import { Capacitor } from '@capacitor/core';

const getBaseUrl = (): string => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl && envUrl.trim().length > 0) {
    return envUrl.endsWith('/') ? envUrl.slice(0, -1) : envUrl;
  }
  return '';
};

export const getApiUrl = (path: string): string => {
  // Se path já começar com http, não fazemos nada
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const baseUrl = getBaseUrl();

  // Detecta se está executando em plataforma nativa (Capacitor/Android/iOS)
  const isNative = typeof window !== 'undefined' && (
    Capacitor.isNativePlatform() || 
    window.location.protocol === 'capacitor:' || 
    window.location.protocol === 'ionic:' ||
    (window.location.hostname === 'localhost' && !window.location.port && !window.location.origin.includes(':3000'))
  );

  if (isNative && baseUrl) {
    return `${baseUrl}${normalizedPath}`;
  }

  // No navegador web tradicional, usamos caminhos relativos para rotas locais
  if (typeof window !== 'undefined') {
    return normalizedPath;
  }
  
  // No servidor (SSR), se o caminho for relativo, precisamos de uma URL base
  if (baseUrl) {
    return `${baseUrl}${normalizedPath}`;
  }
  
  return normalizedPath;
};

export const fetchWithBase = async (path: string, options: RequestInit = {}, maxRetries: number = 6) => {
  const url = getApiUrl(path);
  let attempt = 0;
  
  while (attempt <= maxRetries) {
    try {
      const response = await fetch(url, options);
      const responseClone = response.clone();

      if (!response.ok) {
        let errorDetail = '';
        try {
          errorDetail = await response.text();
        } catch (e) {
          errorDetail = response.statusText;
        }

        // Se o servidor retornar erro de warmup/gateway transitório (502, 503, 504), tenta novamente
        if ((response.status >= 502 && response.status <= 504) && attempt < maxRetries) {
          attempt++;
          await new Promise((resolve) => setTimeout(resolve, 2500 * attempt));
          continue;
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
        const isHtml = text.trim().startsWith('<!doctype') || text.trim().startsWith('<html') || text.toLowerCase().includes('warmup') || text.toLowerCase().includes('loading');
        
        // Se esperávamos JSON mas recebemos HTML de warmup do proxy durante inicialização do servidor ou compilação
        if (isHtml && attempt < maxRetries) {
          attempt++;
          await new Promise((resolve) => setTimeout(resolve, 2500 * attempt));
          continue;
        }

        if (isHtml) {
          throw new Error('O servidor está aquecendo ou ocupado no momento. Por favor, tente novamente em alguns instantes.');
        }
        
        return {
          ok: true,
          status: response.status,
          headers: responseClone.headers,
          json: async () => {
            try { return JSON.parse(text); } catch (e) { throw new Error('Falha ao interpretar resposta do servidor como JSON'); }
          },
          text: async () => text,
          data: text
        } as any;
      }
    } catch (error) {
      if (attempt < maxRetries && !(error instanceof Error && error.message.includes('aquecendo ou ocupado') && attempt >= 3)) {
        attempt++;
        await new Promise((resolve) => setTimeout(resolve, 2500 * attempt));
        continue;
      }
      console.error(`Fetch error for ${url}:`, error);
      throw error;
    }
  }
};
