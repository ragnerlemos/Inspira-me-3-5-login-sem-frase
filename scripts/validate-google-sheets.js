require('dotenv').config({ path: '.env' });
const { google } = require('googleapis');
const { setGlobalDispatcher, Agent } = require('undici');

// Configure undici global dispatcher to avoid "Premature close" errors due to keep-alive issues
setGlobalDispatcher(new Agent({ 
  keepAliveTimeout: 10, 
  keepAliveMaxTimeout: 10,
  pipelining: 0
}));

async function main() {
  console.log('--- TESTANDO CONECTIVIDADE ---');
  try {
    const res = await fetch('https://www.google.com');
    console.log('google.com status:', res.status);
  } catch (e) {
    console.error('Erro ao conectar em google.com:', e.message || e);
  }

  try {
    const res = await fetch('https://www.googleapis.com');
    console.log('googleapis.com status:', res.status);
  } catch (e) {
    console.error('Erro ao conectar em googleapis.com:', e.message || e);
  }

  try {
    const res = await fetch('https://www.googleapis.com/oauth2/v4/token', { method: 'POST' });
    console.log('oauth2 token endpoint status:', res.status);
    const text = await res.text();
    console.log('oauth2 token response text:', text.substring(0, 100));
  } catch (e) {
    console.error('Erro ao conectar em oauth2 token endpoint:', e.message || e);
  }

  const spreadsheetId = process.env.SPREADSHEET_ID;
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  let privateKey = process.env.GOOGLE_PRIVATE_KEY;

  console.log('--- DIAGNÓSTICO DE AMBIENTE ---');
  console.log('SPREADSHEET_ID:', spreadsheetId ? `Definido (tamanho: ${spreadsheetId.length}, começa com: ${spreadsheetId.substring(0, 5)}, termina com: ${spreadsheetId.substring(spreadsheetId.length - 5)})` : 'Não definido');
  console.log('GOOGLE_SERVICE_ACCOUNT_EMAIL:', clientEmail ? `Definido (tamanho: ${clientEmail.length}, valor: "${clientEmail}")` : 'Não definido');
  console.log('GOOGLE_PRIVATE_KEY:', privateKey ? `Definido (tamanho: ${privateKey.length}, começa com: "${privateKey.substring(0, 30)}...", termina com: "...${privateKey.substring(privateKey.length - 30)}")` : 'Não definido');

  if (privateKey) {
    console.log('Private Key has literal \\n (escaped):', privateKey.includes('\\n'));
    console.log('Private Key has real newlines:', privateKey.includes('\n'));
    console.log('Private Key has leading/trailing quotes:', /^["']|["']$/.test(privateKey));
  }

  if (!spreadsheetId) {
    throw new Error('SPREADSHEET_ID não está definido em .env.local');
  }
  if (!clientEmail) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_EMAIL não está definido em .env.local');
  }
  if (!privateKey) {
    throw new Error('GOOGLE_PRIVATE_KEY não está definido em .env.local');
  }

  // Clean the variables
  const cleanSpreadsheetId = spreadsheetId.replace(/^["']|["']$/g, '');
  const cleanClientEmail = clientEmail.replace(/^["']|["']$/g, '');
  let cleanPrivateKey = privateKey.replace(/^["']|["']$/g, '').replace(/\\n/g, '\n');

  console.log('--- DEPOIS DE LIMPAR ---');
  console.log('cleanSpreadsheetId:', cleanSpreadsheetId);
  console.log('cleanClientEmail:', cleanClientEmail);
  console.log('cleanPrivateKey começa com:', cleanPrivateKey.substring(0, 40));
  console.log('cleanPrivateKey termina com:', cleanPrivateKey.substring(cleanPrivateKey.length - 40));
  console.log('cleanPrivateKey has real newlines:', cleanPrivateKey.includes('\n'));

  console.log('google.auth keys:', Object.keys(google.auth));
  try {
    const authLib = require('google-auth-library');
    console.log('google-auth-library keys:', Object.keys(authLib));
    if (authLib.DefaultTransporter) {
      console.log('DefaultTransporter on authLib exists! Overriding prototype.request...');
      
      const originalRequest = authLib.DefaultTransporter.prototype.request;
      authLib.DefaultTransporter.prototype.request = async function(opts) {
        console.log(`[Transporter] Intercepting ${opts.method || 'GET'} request to ${opts.url}`);
        try {
          const url = opts.url;
          const headers = { ...opts.headers };
          let body = opts.data;
          
          if (body && typeof body === 'object') {
            if (headers['content-type'] === 'application/x-www-form-urlencoded' || headers['Content-Type'] === 'application/x-www-form-urlencoded') {
              const params = new URLSearchParams();
              for (const [key, val] of Object.entries(body)) {
                params.append(key, val);
              }
              body = params.toString();
            } else {
              body = JSON.stringify(body);
            }
          }
          
          let fullUrl = url;
          if (opts.params) {
            const q = new URLSearchParams();
            for (const [key, val] of Object.entries(opts.params)) {
              if (val !== undefined) q.append(key, String(val));
            }
            const qStr = q.toString();
            if (qStr) {
              fullUrl += (fullUrl.includes('?') ? '&' : '?') + qStr;
            }
          }

          const response = await fetch(fullUrl, {
            method: opts.method || 'GET',
            headers: headers,
            body: body,
          });

          console.log(`[Transporter] Native fetch status: ${response.status}`);
          
          const resHeaders = {};
          response.headers.forEach((val, key) => {
            resHeaders[key] = val;
          });

          let data;
          const contentType = response.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            data = await response.json();
          } else {
            data = await response.text();
          }

          if (response.status >= 400) {
            // Throw a GaxiosError like error for compatibility if needed, or just return response
            // For auth token or googleapis, throwing on status >= 400 is expected by google-auth-library
            const error = new Error(`Request failed with status code ${response.status}`);
            error.response = {
              config: opts,
              data: data,
              headers: resHeaders,
              status: response.status,
              statusText: response.statusText,
            };
            throw error;
          }

          return {
            config: opts,
            data: data,
            headers: resHeaders,
            status: response.status,
            statusText: response.statusText,
          };
        } catch (error) {
          if (error.response) {
            throw error;
          }
          console.error('[Transporter] Native fetch failed, falling back to original gaxios:', error);
          return originalRequest.call(this, opts);
        }
      };
    }
  } catch (e) {
    console.log('Could not require google-auth-library:', e.message);
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: cleanClientEmail,
      private_key: cleanPrivateKey,
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  const response = await sheets.spreadsheets.get({ spreadsheetId: cleanSpreadsheetId });
  const title = response.data.properties?.title || 'não disponível';
  const sheetNames = response.data.sheets
    ?.map(sheet => sheet.properties?.title)
    .filter(Boolean)
    .join(', ');

  console.log('Planilha encontrada com sucesso!');
  console.log(`Título: ${title}`);
  console.log(`Abas: ${sheetNames}`);
}

main().catch(error => {
  console.error('Falha na validação do Google Sheets:');
  console.error(error.message || error);
  process.exit(1);
});
