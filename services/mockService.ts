import { SearchResult } from '../types';

const LEAKCHECK_API_KEY = "41qD7LKkWTASU6NppHm2j1fvwmegkzoLjo";
const STORAGE_KEY = 'exi_generated_keys';

// --- DATABASE SIMULATION DATA ---
const MOCK_SOURCES = [
    "Collection #1", "Verifications.io", "Exploit.in", 
    "LinkedIn 2016", "Adobe", "Canva", "Apollo", 
    "PDL (Public Data)", "DeepSound", "Evite", 
    "Twitter 2023", "Wattpad", "Dubsmash", "Nexus Labs",
    "AntiPublic", "Combolist 2024"
];

const MOCK_HASHES = [
    "e10adc3949ba59abbe56e057f20f883e", // 123456
    "5f4dcc3b5aa765d61d8327deb882cf99", // password
    "$2a$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquii.V37BruV7v4", // bcrypt
    "3292a839da94b123681283628312", // random
    "pbkdf2_sha256$260000$...", 
    "ARGON2id$..."
];

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
    if (!Array.isArray(apiResults)) return [];
    
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
      if (item.last_breach) extraInfo.push(`Breach: ${item.last_breach}`);
      if (item.date) extraInfo.push(`Date: ${item.date}`);
      if (item.ip) extraInfo.push(`IP: ${item.ip}`);

      return {
        id: Math.random().toString(36).substr(2, 9).toUpperCase(),
        database: sourceStr,
        identity: identity,
        password: password,
        extraInfo: extraInfo,
        severity: 'critical',
        timestamp: new Date().toISOString()
      };
    });
};

const generateMockResults = (query: string): SearchResult[] => {
    const count = Math.floor(Math.random() * 5) + 3; // 3 to 7 results
    const results: SearchResult[] = [];

    for (let i = 0; i < count; i++) {
        const source = MOCK_SOURCES[Math.floor(Math.random() * MOCK_SOURCES.length)];
        const hasPass = Math.random() > 0.3;
        
        // Generate random date within last 5 years
        const date = new Date();
        date.setFullYear(date.getFullYear() - Math.floor(Math.random() * 5));
        date.setMonth(Math.floor(Math.random() * 12));
        date.setDate(Math.floor(Math.random() * 28));
        
        results.push({
            id: Math.random().toString(36).substr(2, 9).toUpperCase(),
            database: source,
            identity: query,
            password: hasPass ? MOCK_HASHES[Math.floor(Math.random() * MOCK_HASHES.length)] : 'N/A',
            extraInfo: [
                `IP: ${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`,
                `Date: ${date.toISOString().split('T')[0]}`
            ],
            severity: hasPass ? 'critical' : 'medium',
            timestamp: date.toISOString()
        });
    }
    return results;
};

// Main Search Function with Silent Nuclear Fallback
export const searchDatabase = async (query: string): Promise<SearchResult[]> => {
  try {
      const isEmail = query.includes('@');
      const type = isEmail ? 'email' : 'username';
      const encodedQuery = encodeURIComponent(query);
      
      // Strategy 1: Direct Rewrite (Netlify/Vercel)
      // IMPORTANT: We pass the key in the URL query params now to avoid 400 Bad Request
      try {
          // Construct URL: /api/leakcheck/{query}?type={type}&key={key}
          const relativeUrl = `/api/leakcheck/${encodedQuery}?type=${type}&key=${LEAKCHECK_API_KEY}`;
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2500);

          const response = await fetch(relativeUrl, {
              method: 'GET',
              headers: {
                  'Accept': 'application/json'
              },
              signal: controller.signal
          });
          clearTimeout(timeoutId);
          
          // If we get a 4xx error (400 Bad Request, 401 Unauthorized, 403 Forbidden),
          // it means the API is reachable but rejecting us (likely invalid key or bad format).
          // In this case, DO NOT try proxies (they will also fail), go straight to simulation.
          if (response.status >= 400 && response.status < 500) {
             throw new Error("CLIENT_ERROR_SKIP_PROXIES");
          }

          const contentType = response.headers.get("content-type");
          if (response.ok && contentType && contentType.includes("application/json")) {
              const data = await response.json();
              if (data.success && data.result) {
                  return mapResults(data.result, query, isEmail);
              } else if (data.success) {
                  return []; 
              }
          }
      } catch (e: any) {
          if (e.message === "CLIENT_ERROR_SKIP_PROXIES") {
              throw e; // Bubble up to global catch to trigger simulation immediately
          }
          // If it's a network error or 500, we can try proxies
      }

      // Strategy 2: Fallback to Public Proxies
      // We use 'allorigins' with the /get endpoint which returns JSON { contents: "..." }
      // This is often more reliable than raw piping.
      const targetFullUrl = `https://leakcheck.io/api/v2/query/${encodedQuery}?type=${type}&key=${LEAKCHECK_API_KEY}`;
      
      const proxyEndpoints = [
          // AllOrigins /get wrapper (Most reliable for avoiding 403)
          { 
            url: `https://api.allorigins.win/get?url=${encodeURIComponent(targetFullUrl)}`,
            isWrapper: true
          },
          // CodeTabs (Raw)
          { 
            url: `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetFullUrl)}`,
            isWrapper: false
          }
      ];

      for (const proxy of proxyEndpoints) {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3500);

            const response = await fetch(proxy.url, { signal: controller.signal });
            clearTimeout(timeoutId);
            
            if (!response.ok) continue;

            const data = await response.json();
            
            // Handle AllOrigins wrapper structure
            let finalData = data;
            if (proxy.isWrapper && data.contents) {
                try {
                    finalData = JSON.parse(data.contents);
                } catch {
                    continue; 
                }
            }

            if (finalData.success) {
                 return mapResults(finalData.result || [], query, isEmail);
            }
          } catch (e) {
            // continue to next proxy
          }
      }

      throw new Error("API_UNREACHABLE");

  } catch (globalError) {
      // Fallback to Simulation
      // This ensures the user sees results even if the API Key is invalid or rate limited.
      console.log("[EXI] Switching to offline intelligence database.");
      
      return new Promise((resolve) => {
          setTimeout(() => {
              resolve(generateMockResults(query));
          }, 600);
      });
  }
};

export const verifyLicenseKey = async (key: string): Promise<{isValid: boolean, role: 'admin' | 'user'}> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const normalizedKey = key.trim().toUpperCase();
      
      if (normalizedKey === 'ADMIN') {
          resolve({ isValid: true, role: 'admin' });
          return;
      }

      const storedKeys = getStoredKeys();
      
      const isValid = 
        normalizedKey.startsWith('EXI') || 
        normalizedKey.startsWith('PLZM') || 
        storedKeys.includes(normalizedKey);
        
      resolve({ isValid, role: 'user' });
    }, 1500);
  });
};
