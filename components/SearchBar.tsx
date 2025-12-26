import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';

interface SearchBarProps {
  onSearch: (term: string) => void;
  isLoading: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading }) => {
  const [term, setTerm] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (term.trim()) {
      onSearch(term);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          {isLoading ? (
            <Loader2 className="h-6 w-6 text-teal-600 animate-spin" />
          ) : (
            <Search className="h-6 w-6 text-slate-400 group-focus-within:text-teal-600 transition-colors" />
          )}
        </div>
        <input
          type="text"
          className="block w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-200 rounded-2xl text-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all shadow-sm hover:border-slate-300"
          placeholder="输入基因突变 (例如: EGFR 19del, KRAS G12C, ALK 融合...)"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !term.trim()}
          className="absolute right-2 top-2 bottom-2 px-6 bg-teal-600 text-white font-medium rounded-xl hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          分析
        </button>
      </form>
      <div className="mt-3 flex flex-wrap gap-2 justify-center text-sm text-slate-500">
        <span>尝试搜索:</span>
        {['EGFR 19del', 'ALK Fusion', 'ROS1', 'KRAS G12C', 'BRAF V600E'].map((ex) => (
          <button
            key={ex}
            onClick={() => {
              setTerm(ex);
              onSearch(ex);
            }}
            className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded-md text-slate-700 transition-colors"
          >
            {ex}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SearchBar;