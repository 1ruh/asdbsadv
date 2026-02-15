import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';

interface SearchModuleProps {
  onSearch: (query: string) => void;
  isScanning: boolean;
}

export const SearchModule: React.FC<SearchModuleProps> = ({ onSearch, isScanning }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isScanning) {
      onSearch(query);
    }
  };

  return (
    <div className="w-full">
      <div className="text-xs font-mono text-gray-500 mb-2 pl-1">
        ENTER_TARGET_IDENTIFIER (EMAIL / IP / USERNAME)
      </div>
      <form onSubmit={handleSubmit} className="relative group">
        <div className="tech-border h-16 flex items-center bg-black hover:border-gray-600 transition-colors">
            
            {/* Prompt Symbol */}
            <div className="h-full px-4 flex items-center justify-center bg-exi-panel border-r border-exi-border">
                <span className="text-exi-primary font-mono text-lg font-bold">{`>_`}</span>
            </div>

            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-white text-xl font-mono px-6 placeholder-gray-800 uppercase"
              placeholder="RUN_QUERY..."
              spellCheck={false}
              autoComplete="off"
              autoFocus
            />

            <button
                type="submit"
                disabled={isScanning}
                className="h-full px-8 hover:bg-white/5 text-exi-primary transition-colors disabled:opacity-50"
            >
                {isScanning ? (
                    <span className="font-mono text-xs animate-pulse">EXECUTING...</span>
                ) : (
                    <ArrowRight className="w-5 h-5" />
                )}
            </button>
        </div>
        
        {/* Decor Lines */}
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-exi-primary/0 via-exi-primary/50 to-exi-primary/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </form>
    </div>
  );
};