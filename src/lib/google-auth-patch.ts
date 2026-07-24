import { Gaxios } from 'gaxios';

let isPatched = false;

export function patchGoogleAuth() {
  if (isPatched) return;

  const originalRequest = Gaxios.prototype.request;
  Gaxios.prototype.request = async function(opts: any) {
    try {
      const url = opts.url;
      const headers = { ...opts.headers };
      let body = opts.data;
      
      if (body && typeof body === 'object') {
        if (headers['content-type'] === 'application/x-www-form-urlencoded' || headers['Content-Type'] === 'application/x-www-form-urlencoded') {
          const params = new URLSearchParams();
          for (const [key, val] of Object.entries(body)) {
            params.append(key, val as string);
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
          if (val !== undefined) {
            if (Array.isArray(val)) {
              for (const item of val) {
                q.append(key, String(item));
              }
            } else {
              q.append(key, String(val));
            }
          }
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

      const resHeaders: Record<string, string> = {};
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
        const error = new Error(`Request failed with status code ${response.status}`) as any;
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
    } catch (error: any) {
      if (error.response) {
        throw error;
      }
      // Fallback to original gaxios
      return originalRequest.call(this, opts);
    }
  };

  isPatched = true;
}

// Auto-run when imported
patchGoogleAuth();
