import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Hexagon, Lock } from 'lucide-react';
import { verifyLicenseKey } from '../services/mockService';

interface AuthScreenProps {
  onSuccess: (role: 'admin' | 'user') => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSuccess }) => {
  const [key, setKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
        const { isValid, role } = await verifyLicenseKey(key);
        if (isValid) {
            onSuccess(role);
        } else {
            setError('Invalid license key');
        }
    } catch {
        setError('Connection failed');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#050505] flex items-center justify-center overflow-hidden">
      
      {/* Animated Background Atmosphere */}
      <div className="absolute inset-0 z-0 overflow-hidden">
          {/* Moving Blobs - Red/Black Theme */}
          <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-red-900/20 rounded-full blur-[120px] animate-blob mix-blend-screen"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-red-950/40 rounded-full blur-[120px] animate-blob animation-delay-2000 mix-blend-screen"></div>
          <div className="absolute top-[20%] left-[20%] w-[40vw] h-[40vw] bg-red-800/10 rounded-full blur-[120px] animate-blob animation-delay-4000 mix-blend-screen"></div>
          
          {/* Noise Overlay */}
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 pointer-events-none"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md p-8"
      >
         <div className="text-center mb-10">
            <div className="w-16 h-16 bg-white/5 rounded-2xl mx-auto flex items-center justify-center mb-6 border border-white/10 backdrop-blur-md shadow-[0_0_30px_rgba(220,38,38,0.1)]">
                <Hexagon className="w-8 h-8 text-white fill-white/20" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Welcome to Exi</h1>
            <p className="text-gray-500 font-medium">Enter your secure license key to access the dashboard.</p>
         </div>

         <div className="bg-[#09090b]/60 backdrop-blur-2xl border border-white/5 rounded-3xl p-2 shadow-2xl">
            <form onSubmit={handleSubmit} className="relative">
                <div className="relative flex items-center">
                    <div className="absolute left-6 text-gray-500">
                        <Lock className="w-5 h-5" />
                    </div>
                    <input 
                        type="text" 
                        value={key}
                        onChange={(e) => setKey(e.target.value)}
                        placeholder="License Key"
                        className="w-full bg-[#121214]/50 border border-transparent focus:border-red-900/20 rounded-2xl py-4 pl-14 pr-4 text-white placeholder-gray-600 focus:outline-none focus:bg-[#121214] transition-all font-mono"
                    />
                </div>
                
                <button 
                    type="submit"
                    disabled={loading || !key}
                    className="w-full mt-2 bg-white text-black font-bold py-4 rounded-2xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {loading ? 'Verifying...' : (
                        <>Access Dashboard <ArrowRight className="w-4 h-4" /></>
                    )}
                </button>
            </form>
         </div>
         
         {error && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-sm font-mono text-center mt-6 bg-red-500/10 py-2 rounded-lg border border-red-500/20">
                 {error}
             </motion.div>
         )}

         <div className="mt-8 text-center">
             <a href="#" className="text-xs text-gray-600 hover:text-white transition-colors font-mono">LOST_LICENSE_KEY?</a>
         </div>
      </motion.div>
    </div>
  );
};