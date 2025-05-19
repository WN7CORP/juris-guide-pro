
import { useState } from "react";
import { legalCodes } from "@/data/legalCodes";
import { Header } from "@/components/Header";
import { MobileFooter } from "@/components/MobileFooter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";

const Pesquisar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Array<{
    codeId: string;
    codeTitle: string;
    article: typeof legalCodes[0]["articles"][0];
  }>>([]);

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    const term = searchTerm.toLowerCase();
    const results: typeof searchResults = [];

    legalCodes.forEach((code) => {
      code.articles.forEach((article) => {
        const contentMatch = article.content.toLowerCase().includes(term);
        const titleMatch = article.title?.toLowerCase().includes(term);
        const numberMatch = article.number.toLowerCase().includes(term);
        const explanationMatch = article.explanation?.toLowerCase().includes(term);
        const practicalMatch = article.practicalExample?.toLowerCase().includes(term);
        const paragraphsMatch = article.paragraphs?.some(p => p.toLowerCase().includes(term));
        const itemsMatch = article.items?.some(i => i.toLowerCase().includes(term));

        if (
          contentMatch ||
          titleMatch ||
          numberMatch ||
          explanationMatch ||
          practicalMatch ||
          paragraphsMatch ||
          itemsMatch
        ) {
          results.push({
            codeId: code.id,
            codeTitle: code.title,
            article,
          });
        }
      });
    });

    setSearchResults(results);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-6 pb-20 md:pb-6">
        <h2 className="text-2xl font-serif font-bold text-law mb-6">
          Pesquisar
        </h2>
        
        <div className="mb-8">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Digite termos como 'direitos fundamentais', 'contrato', etc."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
            />
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" />
              Buscar
            </Button>
          </div>
        </div>
        
        {searchResults.length > 0 ? (
          <div>
            <p className="text-sm text-gray-600 mb-4">
              {searchResults.length} resultados encontrados para "{searchTerm}"
            </p>
            <div className="divide-y">
              {searchResults.map((result) => (
                <div
                  key={result.article.id}
                  className="py-4"
                >
                  <Link
                    to={`/codigos/${result.codeId}`}
                    className="block mb-1 text-xs font-medium text-law"
                  >
                    {result.codeTitle}
                  </Link>
                  <Link
                    to={`/codigos/${result.codeId}`}
                    className="block mb-2 font-medium hover:underline"
                  >
                    {result.article.number}
                    {result.article.title && ` - ${result.article.title}`}
                  </Link>
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {result.article.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : searchTerm ? (
          <div className="bg-accent p-6 rounded-lg text-center">
            <p className="text-gray-700">
              Nenhum resultado encontrado para "{searchTerm}"
            </p>
          </div>
        ) : null}
      </main>
      
      <MobileFooter />
    </div>
  );
};

export default Pesquisar;
