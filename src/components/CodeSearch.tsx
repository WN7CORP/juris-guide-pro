
import React from "react";
import { Search, X, Loader2 } from "lucide-react";

interface CodeSearchProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  totalResults: number;
  inputId?: string;
  isSearching?: boolean;
}

export const CodeSearch = ({ 
  searchTerm, 
  onSearchChange, 
  totalResults,
  inputId = "code-search-input",
  isSearching = false
}: CodeSearchProps) => {
  return (
    <>
      {/* Search input - improved design */}
      <div className="mt-4">
        <div className="relative">
          {isSearching ? (
            <Loader2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
          ) : (
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          )}
          <input 
            id={inputId}
            type="text" 
            placeholder="Buscar por artigo ou conteúdo..." 
            className="w-full pl-10 pr-10 py-3 bg-background-dark border border-gray-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-law-accent text-sm transition-all"
            value={searchTerm} 
            onChange={e => onSearchChange(e.target.value)}
          />
          {searchTerm && (
            <button
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              onClick={() => onSearchChange("")}
              aria-label="Limpar busca"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Search results counter */}
      {totalResults > 0 && searchTerm && (
        <div className="mt-4 bg-background-dark p-3 rounded-md border border-gray-800">
          <p className="text-sm text-gray-300">
            Mostrando {totalResults} {totalResults === 1 ? 'artigo' : 'artigos'} 
            {searchTerm ? ` para "${searchTerm}"` : ''}
          </p>
        </div>
      )}
    </>
  );
};

export default CodeSearch;
