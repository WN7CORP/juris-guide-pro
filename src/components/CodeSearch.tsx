
import React from "react";
import { Search, X } from "lucide-react";
import { LegalArticle } from "@/services/legalCodeService";
import { ArticleView } from "@/components/ArticleView";

interface CodeSearchProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filteredArticles: LegalArticle[];
  codigoId: string | undefined;
}

export const CodeSearch = ({ 
  searchTerm, 
  setSearchTerm, 
  filteredArticles, 
  codigoId 
}: CodeSearchProps) => {
  return (
    <>
      {/* Search input - improved design */}
      <div className="mt-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Buscar por artigo ou conteúdo..." 
            className="w-full pl-10 pr-4 py-2.5 bg-background-dark border border-gray-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-law-accent text-sm transition-all"
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
      </div>

      {/* Search results section */}
      <div className="space-y-4 mt-4">
        {filteredArticles.length > 0 ? (
          <>
            <div className="mb-4 bg-background-dark p-3 rounded-md border border-gray-800">
              <p className="text-sm text-gray-300">
                Mostrando {filteredArticles.length} {filteredArticles.length === 1 ? 'artigo' : 'artigos'} 
                {searchTerm ? ` para "${searchTerm}"` : ''}
              </p>
            </div>
            
            {filteredArticles.map(article => (
              <ArticleView 
                key={article.id?.toString() || `${codigoId}-${article.numero || Math.random().toString()}`} 
                article={{
                  id: article.id?.toString() || `${codigoId}-${article.numero || Math.random().toString()}`,
                  number: article.numero || "",
                  content: article.artigo,
                  title: article.numero ? `Art. ${article.numero}` : "",
                  explanation: article.tecnica,
                  formalExplanation: article.formal,
                  practicalExample: article.exemplo
                }} 
              />
            ))}
          </>
        ) : searchTerm ? (
          <div className="text-center py-8 bg-background-dark rounded-md border border-gray-800">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-800 mb-3">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-gray-300 mb-2">Nenhum artigo encontrado para "{searchTerm}".</p>
            <button 
              className="text-law-accent hover:underline text-sm mt-2 flex items-center gap-1 mx-auto"
              onClick={() => setSearchTerm("")}
            >
              <X className="h-3.5 w-3.5" />
              Limpar busca
            </button>
          </div>
        ) : (
          <div className="text-center py-8 bg-background-dark rounded-md border border-gray-800">
            <p className="text-gray-400">Nenhum artigo encontrado para este código.</p>
          </div>
        )}
      </div>
    </>
  );
};

export default CodeSearch;
