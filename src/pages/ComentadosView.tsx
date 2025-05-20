
import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { fetchArticlesWithAudioComments, LegalArticle } from "@/services/legalCodeService";
import { toast } from "sonner";
import { FloatingMenu } from "@/components/FloatingMenu";
import { Volume, Search, ArrowDown } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Map of table names to display names and routes
const codeMap: Record<string, { displayName: string, route: string }> = {
  "Código_Civil": { displayName: "Código Civil", route: "codigo-civil" },
  "Código_Penal": { displayName: "Código Penal", route: "codigo-penal" },
  "Código_de_Processo_Civil": { displayName: "Código de Processo Civil", route: "codigo-processo-civil" },
  "Código_de_Processo_Penal": { displayName: "Código de Processo Penal", route: "codigo-processo-penal" },
  "Código_Tributário_Nacional": { displayName: "Código Tributário Nacional", route: "codigo-tributario" },
  "Código_de_Defesa_do_Consumidor": { displayName: "Código do Consumidor", route: "codigo-defesa-consumidor" },
  "Código_de_Trânsito_Brasileiro": { displayName: "Código de Trânsito", route: "codigo-transito" },
  "Código_Eleitoral": { displayName: "Código Eleitoral", route: "codigo-eleitoral" },
  "Constituicao_Federal": { displayName: "Constituição Federal", route: "constituicao-federal" }
};

interface ArticleWithSource extends LegalArticle {
  source: string;
  displayName: string;
  route: string;
}

const ComentadosView = () => {
  const [allArticles, setAllArticles] = useState<ArticleWithSource[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<ArticleWithSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedView, setExpandedView] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllCommentedArticles = async () => {
      setLoading(true);
      try {
        const allResults: ArticleWithSource[] = [];
        
        // Fetch from all possible tables
        for (const [tableName, { displayName, route }] of Object.entries(codeMap)) {
          try {
            const articles = await fetchArticlesWithAudioComments(tableName as any);
            const articlesWithSource = articles.map(article => ({
              ...article,
              source: tableName,
              displayName,
              route
            }));
            allResults.push(...articlesWithSource);
          } catch (error) {
            console.error(`Error fetching from ${tableName}:`, error);
          }
        }
        
        console.log(`Found total of ${allResults.length} articles with audio comments`);
        setAllArticles(allResults);
        setFilteredArticles(allResults);
      } catch (error) {
        console.error("Failed to load commented articles:", error);
        toast.error("Falha ao carregar artigos comentados");
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllCommentedArticles();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredArticles(allArticles);
      return;
    }
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    const filtered = allArticles.filter(article => {
      return (
        article.displayName.toLowerCase().includes(lowerSearchTerm) ||
        (article.numero && article.numero.toLowerCase().includes(lowerSearchTerm)) ||
        article.artigo.toLowerCase().includes(lowerSearchTerm)
      );
    });
    
    setFilteredArticles(filtered);
  }, [searchTerm, allArticles]);

  // Group articles by source
  const groupedArticles: Record<string, ArticleWithSource[]> = {};
  filteredArticles.forEach(article => {
    if (!groupedArticles[article.source]) {
      groupedArticles[article.source] = [];
    }
    groupedArticles[article.source].push(article);
  });

  const toggleExpand = (source: string) => {
    if (expandedView === source) {
      setExpandedView(null);
    } else {
      setExpandedView(source);
    }
  };

  return (
    <div className="min-h-screen flex flex-col dark">
      <Header />
      
      <main className="flex-1 container py-6 pb-28 md:pb-6">
        <div className="mb-8">
          <h2 className="text-3xl font-serif font-bold text-netflix-red mb-4 flex items-center gap-2">
            <Volume className="h-6 w-6" />
            <span>Artigos Comentados em Áudio</span>
          </h2>
          <p className="text-gray-300 mb-6">
            Acesse comentários explicativos em áudio para os principais artigos dos códigos e estatutos.
          </p>

          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            <Input
              type="text"
              placeholder="Pesquisar artigos comentados..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-netflix-dark border-gray-800 focus:border-law-accent"
            />
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-netflix-dark animate-pulse rounded-lg"></div>
            ))}
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Volume className="h-12 w-12 text-gray-600 mb-4" />
            <h3 className="text-xl font-medium text-gray-400 mb-2">Nenhum artigo comentado encontrado</h3>
            <p className="text-gray-500">
              {searchTerm ? `Não encontramos artigos comentados para "${searchTerm}"` : 
                "Novos comentários serão adicionados em breve."}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedArticles).map(([source, articles]) => (
              <div 
                key={source}
                className="bg-netflix-dark border border-gray-800 rounded-lg overflow-hidden"
              >
                <div 
                  className="p-4 border-b border-gray-800 flex items-center justify-between cursor-pointer"
                  onClick={() => toggleExpand(source)}
                >
                  <h3 className="font-medium text-lg text-white">
                    {codeMap[source]?.displayName || source}
                    <span className="ml-2 text-sm text-gray-400">({articles.length})</span>
                  </h3>
                  <Button 
                    variant="ghost"
                    size="sm"
                    className="p-1 h-auto"
                  >
                    <ArrowDown className={cn(
                      "h-4 w-4 transition-transform",
                      expandedView === source ? "transform rotate-180" : ""
                    )} />
                  </Button>
                </div>

                <div className={cn(
                  "overflow-hidden transition-all duration-300",
                  expandedView === source ? "max-h-[1000px]" : "max-h-0"
                )}>
                  <div className="p-4 space-y-3">
                    {articles.map((article) => (
                      <Link
                        key={article.id}
                        to={`/codigos/${article.route}?article=${article.id}`}
                        className="flex items-start p-3 rounded-md hover:bg-netflix-bg transition-colors"
                      >
                        <div className="mr-3 mt-1 p-1.5 rounded-full bg-law-accent/10 text-law-accent">
                          <Volume className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <h4 className="font-medium text-sm text-white">
                            {article.numero ? `Art. ${article.numero}` : 'Artigo'}
                          </h4>
                          <p className="text-xs text-gray-400 line-clamp-2 mt-1">{article.artigo}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      
      <FloatingMenu />
    </div>
  );
};

export default ComentadosView;
