export const getApiUrl = (path: string) => {
  // Se path já começar com http, não fazemos nada
  if (path.startsWith('http')) return path;
  
  // No navegador, sempre usamos caminhos relativos
  if (typeof window !== 'undefined') {
    return path;
  }
  
  // No servidor (SSR), se o caminho for relativo, precisamos de uma URL base
  // Se NEXT_PUBLIC_API_URL estiver definido, usamos ele. 
  // Caso contrário, tentamos usar o host local se estivermos em ambiente de desenvolvimento.
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (baseUrl) {
    // Garante que não haja barras duplas acidentais
    const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${normalizedBase}${normalizedPath}`;
  }
  
  return path;
};

export const fetchWithBase = async (path: string, options: RequestInit = {}) => {
  const url = getApiUrl(path);
  
  try {
    const response = await fetch(url, options);
    
    // Clone the response for safe multi-reading if needed
    const responseClone = response.clone();

    if (!response.ok) {
      let errorDetail = '';
      try {
        errorDetail = await response.text();
      } catch (e) {
        errorDetail = response.statusText;
      }
      throw new Error(`API call failed: ${response.status} - ${errorDetail}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      
      return {
        ok: true,
        status: response.status,
        headers: responseClone.headers,
        json: async () => data,
        text: async () => JSON.stringify(data),
        data: data
      } as any;
    } else {
      const text = await response.text();
      // Se esperávamos JSON mas recebemos outra coisa (provavelmente HTML de erro)
      if (text.trim().startsWith('<!doctype') || text.trim().startsWith('<html')) {
        throw new Error(`Expected JSON but received HTML response. This usually indicates a 404 or 500 error page from the server.`);
      }
      
      return {
        ok: true,
        status: response.status,
        headers: responseClone.headers,
        json: async () => {
          try { return JSON.parse(text); } catch (e) { throw new Error('Failed to parse response as JSON'); }
        },
        text: async () => text,
        data: text
      } as any;
    }
  } catch (error) {
    console.error(`Fetch error for ${url}:`, error);
    throw error;
  }
};
