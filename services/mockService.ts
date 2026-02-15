import { SearchResult } from '../types';

const LEAKCHECK_API_KEY = "41qD7LKkWTASU6NppHm2j1fvwmegkzoLjo";
const STORAGE_KEY = 'exi_generated_keys';

const getStoredKeys = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
};

export const generateLicenseKey = (type: 'MONTHLY' | 'LIFETIME'): string => {
    const prefix = type === 'MONTHLY' ? 'EXI-MO' : 'EXI-LF';
    const random = Math.random().toString(36).substring(2, 6).toUpperCase() + 
                   Math.random().toString(36).substring(2, 6).toUpperCase();
    const newKey = `${prefix}-${random}`;
    
    const keys = getStoredKeys();
    keys.push(newKey);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
    return newKey;
};

export const getActiveKeys = (): string[] => {
    return getStoredKeys();
};

// Helper to map API results to our app type
const mapResults = (apiResults: any[], query: string, isEmail: boolean): SearchResult[] => {
    return apiResults.map((item: any) => {
      let identity = query;
      let password = 'N/A';
      
      const line = item.line || '';
      
      if (line) {
        if (line.includes(':')) {
           const parts = line.split(':', 2);
           identity = parts[0];
           password = parts[1];
        } else {
           identity = line;
        }
      }

      // Fallback overrides if explicit fields exist
      if (item.email) identity = item.email;
      if (item.username && !isEmail) identity = item.username; 
      if (item.password) password = item.password;

      // Handle Sources
      let sourceStr = 'Unknown Database';
      if (item.sources) {
        sourceStr = Array.isArray(item.sources) ? item.sources.join(', ') : item.sources;
      }

      const extraInfo: string[] = [];
      if (item.last_breach) extraInfo.push(`Breach Date: ${item.last_breach}`);
      if (item.date) extraInfo.push(`Date: ${item.date}`);
      if (item.ip) extraInfo.push(`IP: ${item.ip}`);

      return {
        id: Math.random().toString(36).substr(2, 9), 
        database: sourceStr,
        identity: identity,
        password: password,
        extraInfo: extraInfo,
        severity: 'critical',
        timestamp: new Date().toISOString()
      };
    });
};

export const searchDatabase = async (query: string): Promise<SearchResult[]> => {
  const isEmail = query.includes('@');
  const type = isEmail ? 'email' : 'username';
  const encodedQuery = encodeURIComponent(query);
  
  // Strategy 1: Try Netlify Rewrite (Relative Path)
  // When using the rewrite, we should pass the API key in the headers as intended by standard API usage.
  try {
      // NOTE: Do not include `key` in the URL query params when using headers for the direct rewrite
      const relativePath = `${encodedQuery}?type=${type}`;
      const relativeUrl = `/api/leakcheck/${relativePath}`;
      
      console.log(`[EXI] Attempting Strategy 1 (Direct Rewrite): ${relativeUrl}`);
      
      const response = await fetch(relativeUrl, {
          method: 'GET',
          headers: {
              'X-API-Key': LEAKCHECK_API_KEY,
              'Accept': 'application/json'
          }
      });
      
      const contentType = response.headers.get("content-type");
      if (response.ok && contentType && contentType.includes("application/json")) {
          const data = await response.json();
          if (data.success && data.result) {
              return mapResults(data.result, query, isEmail);
          } else if (data.success && (!data.result || data.result.length === 0)) {
              // Valid response, but no data found
              return [];
          }
      }
  } catch (e) {
      console.warn("[EXI] Strategy 1 failed:", e);
  }

  // Strategy 2: Fallback to Public CORS Proxies
  // For these, we MUST put the key in the URL because we can't reliably pass headers through all proxies.
  const targetFullUrl = `https://leakcheck.io/api/v2/query/${encodedQuery}?type=${type}&key=${LEAKCHECK_API_KEY}`;
  
  const proxyEndpoints = [
      `https://corsproxy.io/?${encodeURIComponent(targetFullUrl)}`,
      `https://api.allorigins.win/raw?url=${encodeURIComponent(targetFullUrl)}`
  ];

  for (const proxyUrl of proxyEndpoints) {
      try {
        console.log(`[EXI] Attempting Proxy: ${proxyUrl}`);
        const response = await fetch(proxyUrl);
        
        if (!response.ok) {
           const err = await response.text();
           console.warn(`[EXI] Proxy Error ${response.status}:`, err);
           continue;
        }

        const data = await response.json();

        // Check specifically for success boolean or result array
        if (data.success) {
             return mapResults(data.result || [], query, isEmail);
        }
      } catch (e) {
        console.warn("[EXI] Proxy Request Failed", e);
      }
  }

  // If all strategies fail, we throw an error so the UI shows "Connection Failed"
  // instead of just "No Results" (which implies the person is safe).
  throw new Error("All fetch strategies failed");
};

export const verifyLicenseKey = async (key: string): Promise<{isValid: boolean, role: 'admin' | 'user'}> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const normalizedKey = key.trim().toUpperCase();
      
      // Admin backdoor
      if (normalizedKey === 'ADMIN') {
          resolve({ isValid: true, role: 'admin' });
          return;
      }

      // Check stored keys
      const storedKeys = getStoredKeys();
      
      // Allow legacy PLZM/EXI prefixes OR stored keys
      const isValid = 
        normalizedKey.startsWith('EXI') || 
        normalizedKey.startsWith('PLZM') || 
        storedKeys.includes(normalizedKey);
        
      resolve({ isValid, role: 'user' });
    }, 1500);
  });
};
