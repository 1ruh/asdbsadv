import { SearchResult } from '../types';

const LEAKCHECK_API_KEY = "4344cd645b6e6cc2559c1a92017d9bfa12e4e4b1";
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

export const searchDatabase = async (query: string): Promise<SearchResult[]> => {
  const isEmail = query.includes('@');
  const type = isEmail ? 'email' : 'username';

  // We must use a CORS proxy because browsers block direct requests to the LeakCheck API
  // due to missing Access-Control-Allow-Origin headers on their server.
  const targetUrl = `https://leakcheck.io/api/v2/query/${encodeURIComponent(query)}?type=${type}`;
  const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;

  try {
    const response = await fetch(proxyUrl, {
      method: 'GET',
      headers: {
        'X-API-Key': LEAKCHECK_API_KEY,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      // Attempt to read error text
      const errText = await response.text();
      console.error(`API Error: ${response.status} ${response.statusText}`, errText);
      return [];
    }

    const data = await response.json();

    if (!data.success || !data.result) {
      return [];
    }

    return data.result.map((item: any) => {
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

  } catch (e) {
    console.error("LeakCheck API Request Failed", e);
    return [];
  }
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
      // This ensures generated keys work, and legacy demo keys still work
      const isValid = 
        normalizedKey.startsWith('EXI') || 
        normalizedKey.startsWith('PLZM') || 
        storedKeys.includes(normalizedKey);
        
      resolve({ isValid, role: 'user' });
    }, 1500);
  });
};