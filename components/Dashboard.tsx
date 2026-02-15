import React, { useState, useEffect } from 'react';
import { SearchResult } from '../types';
import { searchDatabase, generateLicenseKey, getActiveKeys } from '../services/mockService';
import { 
    Search, Scan, Activity, Shield, 
    Info, Database, Check, Lock, Key, 
    Terminal, Copy, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DashboardProps {
    role: 'admin' | 'user';
}

export const Dashboard: React.FC<DashboardProps> = ({ role }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeModule, setActiveModule] = useState<string>('stealer');
  const [copiedStates, setCopiedStates] = useState<{[key: string]: boolean}>({});

  // Admin State
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [activeKeys, setActiveKeys] = useState<string[]>([]);

  useEffect(() => {
      if (activeModule === 'admin') {
          setActiveKeys(getActiveKeys());
      }
  }, [activeModule]);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setResults([]); // Clear previous results
    
    // Real API call (Logic from service)
    const data = await searchDatabase(query);
    setResults(data);
    setIsLoading(false);
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStates(prev => ({ ...prev, [key]: true }));
    setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [key]: false }));
    }, 2000);
  };

  const handleGenerateKey = (type: 'MONTHLY' | 'LIFETIME') => {
      const newKey = generateLicenseKey(type);
      setGeneratedKey(newKey);
      setActiveKeys(getActiveKeys());
  };

  const AdminPanel = () => (
      <div className="flex-1 flex flex-col gap-6 h-full p-2">
          <div className="bg-[#121214] border border-red-900/30 rounded-xl p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
                  <Key className="w-24 h-24 text-red-600" />
              </div>
              
              <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-red-500" />
                  KEY_GENERATOR_PROTOCOL
              </h2>
              <p className="text-xs text-gray-500 font-mono mb-6">AUTHORIZATION LEVEL: ALPHA-1</p>

              <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
                  <button 
                    onClick={() => handleGenerateKey('MONTHLY')}
                    className="h-14 bg-white/5 hover:bg-red-600/20 border border-white/10 hover:border-red-500 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 group/btn"
                  >
                      <RefreshCw className="w-4 h-4 group-hover/btn:rotate-180 transition-transform" />
                      GENERATE MONTHLY
                  </button>
                  <button 
                    onClick={() => handleGenerateKey('LIFETIME')}
                    className="h-14 bg-red-600 hover:bg-red-500 text-black font-bold rounded-lg transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(220,38,38,0.3)]"
                  >
                      <Lock className="w-4 h-4" />
                      GENERATE LIFETIME
                  </button>
              </div>

              {generatedKey && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-black/50 border border-red-500/50 rounded-lg p-4 flex items-center justify-between"
                  >
                      <div className="flex flex-col">
                          <span className="text-[10px] text-red-400 font-mono mb-1">NEW LICENSE KEY GENERATED</span>
                          <span className="text-xl font-mono text-white tracking-widest font-bold">{generatedKey}</span>
                      </div>
                      <button 
                        onClick={() => copyToClipboard(generatedKey, 'gen-key')}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      >
                          {copiedStates['gen-key'] ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5 text-gray-400" />}
                      </button>
                  </motion.div>
              )}
          </div>

          <div className="flex-1 bg-[#121214] border border-white/5 rounded-xl overflow-hidden flex flex-col">
              <div className="p-3 border-b border-white/5 flex items-center justify-between bg-black/20">
                  <span className="text-xs font-bold text-gray-400">ACTIVE_KEYS_DATABASE</span>
                  <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-gray-300">{activeKeys.length} ENTRIES</span>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                  {activeKeys.slice().reverse().map((k, i) => (
                      <div key={i} className="flex items-center justify-between p-2 rounded hover:bg-white/5 transition-colors group">
                          <span className="font-mono text-xs text-gray-300">{k}</span>
                          <span className="text-[9px] text-gray-600 group-hover:text-gray-400">
                              {k.includes('EXI-LF') ? 'LIFETIME' : 'MONTHLY'}
                          </span>
                      </div>
                  ))}
                  {activeKeys.length === 0 && (
                      <div className="text-center py-10 text-xs text-gray-600 font-mono">NO GENERATED KEYS FOUND</div>
                  )}
              </div>
          </div>
      </div>
  );

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#050505] relative overflow-hidden p-4">
      
      {/* Animated Background Atmosphere */}
      <div className="absolute inset-0 z-0 overflow-hidden">
          {/* Moving Blobs - Red/Black Theme */}
          <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-red-900/20 rounded-full blur-[120px] animate-blob mix-blend-screen"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-red-950/40 rounded-full blur-[120px] animate-blob animation-delay-2000 mix-blend-screen"></div>
          <div className="absolute top-[20%] left-[20%] w-[40vw] h-[40vw] bg-red-800/10 rounded-full blur-[120px] animate-blob animation-delay-4000 mix-blend-screen"></div>
          
          {/* Noise Overlay */}
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 pointer-events-none"></div>
      </div>

      {/* Main Card Interface */}
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative z-10 w-full max-w-4xl bg-[#09090b]/80 backdrop-blur-2xl rounded-[32px] border border-white/5 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col"
        style={{ height: '600px' }}
      >
        {/* Window Controls (Visual) */}
        <div className="absolute top-4 right-4 flex gap-2 z-50">
            <div className="w-3 h-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"></div>
            <div className="w-3 h-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"></div>
        </div>

        {/* ASCII Header */}
        <div className="pt-8 pb-2 flex justify-center select-none opacity-80">
            <pre className="font-mono text-[8px] sm:text-[10px] leading-[0.9] text-center bg-gradient-to-b from-white to-gray-600 bg-clip-text text-transparent font-bold">
{`    ________  ______   ____  _____ ____  ____________
   / ____/| |/ /  _/  / __ \\/ ___//  _/ |/ /_  __/   
  / __/   |   // /   / / / /\\__ \\ / //    / / /      
 / /___  /   |/ /   / /_/ /___/ // //   |/ / /       
/_____/ /_/|_|___/  \\____//____/___/_/|_/_/ /_/      `}
            </pre>
        </div>

        <div className="p-8 flex flex-col h-full gap-6">
            
            {/* Search Bar Area - Only show if not in Admin Module or keep it always? 
                Keeping it always is fine, but maybe disabled in admin mode for focus. 
                Let's keep it visible but maybe opacity-50 if activeModule is admin.
            */}
            <div className={`relative group transition-opacity ${activeModule === 'admin' ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                <form onSubmit={handleSearch} className="relative flex items-center w-full h-16 bg-[#121214]/80 border border-white/5 rounded-2xl px-4 transition-all focus-within:border-white/20 focus-within:bg-[#161618] focus-within:shadow-[0_0_30px_rgba(220,38,38,0.1)]">
                    {/* Scan Icon */}
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 text-gray-400 mr-4">
                        <Scan className="w-5 h-5" />
                    </div>

                    <input 
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="e.g. johndoe@gmail.com"
                        className="flex-1 bg-transparent border-none outline-none text-gray-200 placeholder-gray-600 font-medium text-lg font-sans"
                        disabled={activeModule === 'admin'}
                    />

                    {/* Right Actions */}
                    <div className="flex items-center gap-3">
                        <button 
                            type="submit" 
                            disabled={isLoading || activeModule === 'admin'}
                            className="w-10 h-10 flex items-center justify-center bg-[#222] hover:bg-red-900/50 hover:text-red-200 text-white rounded-xl transition-all disabled:opacity-50"
                        >
                            {isLoading ? (
                                <Activity className="w-5 h-5 animate-spin" />
                            ) : (
                                <Search className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Split Content Area */}
            <div className="flex flex-1 gap-6 min-h-0">
                
                {/* Left Controls */}
                <div className="w-1/3 flex flex-col gap-4">
                    <div className="flex flex-col gap-3">
                        {[
                            { id: 'stealer', label: 'Stealer Logs', icon: Activity, desc: 'Malware data' },
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveModule(item.id)}
                                className={`
                                    relative flex items-center justify-between p-4 rounded-2xl border transition-all text-left group
                                    ${activeModule === item.id 
                                        ? 'bg-[#18181b] border-white/10 text-white shadow-lg shadow-red-900/10' 
                                        : 'bg-[#0e0e10]/50 border-transparent text-gray-500 hover:bg-[#121214] hover:text-gray-300'
                                    }
                                `}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${activeModule === item.id ? 'bg-red-900/20 text-red-200' : 'bg-[#18181b] text-gray-600'}`}>
                                        <item.icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold">{item.label}</div>
                                        <div className="text-[10px] opacity-50 font-medium">{item.desc}</div>
                                    </div>
                                </div>
                            </button>
                        ))}

                        {role === 'admin' && (
                            <button
                                onClick={() => setActiveModule('admin')}
                                className={`
                                    relative flex items-center justify-between p-4 rounded-2xl border transition-all text-left group mt-4
                                    ${activeModule === 'admin' 
                                        ? 'bg-red-950/20 border-red-900/30 text-white shadow-lg shadow-red-900/10' 
                                        : 'bg-[#0e0e10]/50 border-red-900/10 text-red-700 hover:bg-red-950/10 hover:text-red-500'
                                    }
                                `}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${activeModule === 'admin' ? 'bg-red-600 text-black' : 'bg-red-950/30 text-red-700'}`}>
                                        <Key className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold">Admin Command</div>
                                        <div className="text-[10px] opacity-50 font-medium">Key Generator</div>
                                    </div>
                                </div>
                                {activeModule === 'admin' && <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>}
                            </button>
                        )}
                    </div>
                </div>

                {/* Right Results Panel / Admin Panel */}
                <div className="flex-1 bg-[#0e0e10]/60 rounded-2xl border border-white/5 flex flex-col overflow-hidden relative backdrop-blur-sm">
                    {activeModule === 'admin' ? (
                        <AdminPanel />
                    ) : (
                        <>
                            {/* Panel Header */}
                            <div className="h-10 border-b border-white/5 flex items-center justify-between px-4 bg-[#121214]/50">
                                <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                                    <Info className="w-3.5 h-3.5" />
                                    Results
                                </div>
                                {results.length > 0 && (
                                    <div className="text-[10px] text-red-500 font-mono">
                                        {results.length} HITS FOUND
                                    </div>
                                )}
                            </div>

                            {/* Scrollable Content */}
                            <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                                {isLoading ? (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-600 space-y-4">
                                        <div className="w-6 h-6 border-2 border-t-red-500 border-red-900/20 rounded-full animate-spin"></div>
                                        <span className="text-xs font-mono">QUERYING_NODES...</span>
                                    </div>
                                ) : results.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-700 space-y-2">
                                        <div className="w-12 h-12 rounded-2xl bg-[#18181b] flex items-center justify-center mb-2">
                                            <Search className="w-6 h-6 opacity-20" />
                                        </div>
                                        <span className="text-xs font-medium">Ready to scan</span>
                                    </div>
                                ) : (
                                    <AnimatePresence>
                                        {results.map((res, i) => (
                                            <motion.div 
                                                key={res.id || i}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.05 }}
                                                className="p-3 rounded-xl bg-[#141416] border border-white/5 hover:border-red-900/30 transition-colors group"
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-1.5 h-1.5 rounded-full ${res.password ? 'bg-red-500' : 'bg-gray-600'}`}></div>
                                                        <span className="text-xs font-bold text-gray-300 truncate max-w-[150px]">{res.database || 'Unknown Source'}</span>
                                                    </div>
                                                    <span className="text-[10px] text-gray-600 font-mono">{res.timestamp.split('T')[0]}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2 text-sm text-gray-100 font-mono truncate max-w-[200px]">
                                                        <span className="select-all">{res.identity}</span>
                                                        <button
                                                            onClick={() => copyToClipboard(res.identity, `${res.id}-identity`)}
                                                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded"
                                                            title="Copy Identity"
                                                        >
                                                            {copiedStates[`${res.id}-identity`] ? (
                                                                <Check className="w-3 h-3 text-green-500" />
                                                            ) : (
                                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 hover:text-white transition-colors">
                                                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                                                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                                                </svg>
                                                            )}
                                                        </button>
                                                    </div>
                                                    {res.password && res.password !== 'N/A' && (
                                                        <div className="text-[10px] bg-red-500/10 text-red-500 px-2 py-0.5 rounded border border-red-500/20">
                                                            LEAK
                                                        </div>
                                                    )}
                                                </div>
                                                {res.password && res.password !== 'N/A' && (
                                                    <div className="mt-2 pt-2 border-t border-white/5 text-xs text-gray-400 font-mono flex items-center gap-2 group/pass">
                                                        <span>pass: <span className="text-white select-all">{res.password}</span></span>
                                                        <button
                                                            onClick={() => copyToClipboard(res.password!, `${res.id}-password`)}
                                                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded"
                                                            title="Copy Password"
                                                        >
                                                            {copiedStates[`${res.id}-password`] ? (
                                                                <Check className="w-3 h-3 text-green-500" />
                                                            ) : (
                                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 hover:text-white transition-colors">
                                                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                                                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                                                </svg>
                                                            )}
                                                        </button>
                                                    </div>
                                                )}
                                                {res.extraInfo && res.extraInfo.length > 0 && (
                                                    <div className="mt-2 flex flex-wrap gap-1">
                                                        {res.extraInfo.map((info, idx) => (
                                                            <span key={idx} className="text-[9px] bg-[#1a1a1c] text-gray-500 px-1.5 py-0.5 rounded">
                                                                {info}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                )}
                            </div>
                            
                            {/* Result Footer */}
                            <div className="absolute bottom-4 right-4 w-1 h-8 bg-gray-800 rounded-full opacity-50"></div>
                        </>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-4 text-[10px] font-medium text-gray-600">
                <div className="flex items-center gap-1.5">
                    <Shield className="w-3 h-3" />
                    Secure Search
                </div>
                <div className="flex items-center gap-1.5">
                    <Database className="w-3 h-3" />
                    +15 Sources
                </div>
            </div>
        </div>

      </motion.div>
    </div>
  );
};