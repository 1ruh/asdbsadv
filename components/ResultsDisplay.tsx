import React from 'react';
import { SearchResult } from '../types';
import { motion } from 'framer-motion';

interface ResultsDisplayProps {
  results: SearchResult[];
  isLoading?: boolean;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, isLoading }) => {
  
  // Header Component
  const Header = () => (
      <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-transparent border-b border-border/50 text-[9px] text-muted font-bold uppercase tracking-wider">
          <div className="col-span-2">Ref ID</div>
          <div className="col-span-2">Detected</div>
          <div className="col-span-2">Source</div>
          <div className="col-span-2">Category</div>
          <div className="col-span-1">Match</div>
          <div className="col-span-1 text-center">Status</div>
          <div className="col-span-1">Target</div>
          <div className="col-span-1 text-right">Risk Level</div>
      </div>
  );

  if (isLoading) {
      return (
          <div className="w-full">
              <Header />
              <div className="space-y-1 p-2">
                  {[...Array(6)].map((_, i) => (
                      <div key={i} className="h-8 bg-[#1A1A1A] rounded animate-pulse" />
                  ))}
              </div>
          </div>
      );
  }

  if (results.length === 0) {
      return (
          <div className="w-full flex flex-col h-full">
               <Header />
               <div className="flex-1 flex flex-col items-center justify-center text-muted py-20">
                   <div className="text-xs font-bold mb-1">No Records</div>
                   <div className="text-[10px] opacity-50">Awaiting search query...</div>
               </div>
          </div>
      );
  }

  return (
    <div className="w-full text-[10px] font-mono">
      <Header />
      <div className="divide-y divide-border/30">
        {results.map((result, idx) => {
            const hasPassword = result.password && result.password !== 'N/A';
            const riskLevel = hasPassword ? 'High' : 'Low';
            // Removed random match score

            return (
            <motion.div 
                key={result.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.03 }}
                className="grid grid-cols-12 gap-2 px-4 py-3 items-center hover:bg-[#151515] transition-colors group cursor-pointer"
            >
                {/* Ref ID */}
                <div className="col-span-2 text-muted group-hover:text-white transition-colors">{result.id}</div>
                
                {/* Detected Time */}
                <div className="col-span-2 text-muted">
                    {new Date(result.timestamp).toLocaleString('en-US', { 
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false 
                    }).replace(',', ' -')}
                </div>

                {/* Source (Database) */}
                <div className="col-span-2 text-white font-bold truncate pr-2">
                    {result.database || 'Unknown Source'}
                </div>

                {/* Category (Type) */}
                <div className="col-span-2 text-muted uppercase">
                     {result.identity.includes('@') ? 'Creds' : 'Logs'}
                </div>

                {/* Match % (Static now) */}
                <div className="col-span-1 text-white font-bold">
                    100%
                </div>

                {/* Status Badge */}
                <div className="col-span-1 flex justify-center">
                    <span className={`
                        px-2 py-0.5 rounded text-[9px] font-bold w-12 text-center
                        ${hasPassword 
                            ? 'bg-red-500/20 text-red-500' // Leak
                            : 'bg-blue-500/20 text-blue-500' // Info
                        }
                    `}>
                        {hasPassword ? 'LEAK' : 'INFO'}
                    </span>
                </div>

                {/* Target */}
                <div className="col-span-1 text-muted text-center truncate">
                    {result.identity}
                </div>

                {/* Risk Level */}
                <div className="col-span-1 text-right">
                    <span className={`font-bold ${riskLevel === 'High' ? 'text-red-500' : 'text-success'}`}>
                        {riskLevel}
                    </span>
                </div>

            </motion.div>
        )})}
      </div>
    </div>
  );
};