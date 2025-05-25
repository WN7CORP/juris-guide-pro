
import React from "react";
import { Search, X, Loader2 } from "lucide-react";
import { LegalArticle } from "@/services/legalCodeService";

interface CodeSearchProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filteredArticles: LegalArticle[];
  codigoId: string | undefined;
  inputId?: string;
  isSearching?: boolean;
}

export const CodeSearch = ({ 
  searchTerm, 
  setSearchTerm, 
  filteredArticles, 
  codigoId,
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
            placeholder="Digite o número do artigo (ex: 5, 157) ou busque no conteúdo..." 
            className="w-full pl-10 pr-10 py-3 bg-background-dark border border-gray-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-law-accent text-sm transition-all"
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              onClick={() => setSearchTerm("")}
              aria-label="Limpar busca"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        
        {/* Remove search guidance that was restrictive */}
      </div>

      {/* Search results counter */}
      {searchTerm && (
        <div className="mt-4 bg-background-dark p-3 rounded-md border border-gray-800">
          {isSearching ? (
            <p className="text-sm text-gray-300 flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Buscando artigos...
            </p>
          ) : filteredArticles.length > 0 ? (
            <p className="text-sm text-gray-300">
              ✅ Encontrados {filteredArticles.length} {filteredArticles.length === 1 ? 'artigo' : 'artigos'} 
              para "{searchTerm}"
            </p>
          ) : (
            <p className="text-sm text-red-400">
              ❌ Nenhum artigo encontrado para "{searchTerm}"
              <span className="block text-xs text-gray-400 mt-1">
                Tente termos mais genéricos ou apenas o número do artigo
              </span>
            </p>
          )}
        </div>
      )}
    </>
  );
};

export default CodeSearch;
