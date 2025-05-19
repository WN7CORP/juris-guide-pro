
import { useParams, Link } from "react-router-dom";
import { legalCodes } from "@/data/legalCodes";
import { Header } from "@/components/Header";
import { MobileFooter } from "@/components/MobileFooter";
import { ArticleView } from "@/components/ArticleView";
import { ChevronLeft, Search, ArrowUp, ExternalLink, Filter } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { fetchLegalCode, LegalArticle } from "@/services/legalCodeService";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { 
  AlertDialog, 
  AlertDialogContent, 
  AlertDialogTitle, 
  AlertDialogDescription, 
  AlertDialogCancel, 
  AlertDialogAction 
} from "@/components/ui/alert-dialog";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage
} from "@/components/ui/breadcrumb";

// Define a mapping from URL parameters to actual table names
const tableNameMap: Record<string, any> = {
  "codigo-civil": "Código_Civil",
  "codigo-penal": "Código_Penal",
  "codigo-processo-civil": "Código_de_Processo_Civil",
  "codigo-processo-penal": "Código_de_Processo_Penal",
  "codigo-tributario": "Código_Tributário_Nacional",
  "codigo-defesa-consumidor": "Código_de_Defesa_do_Consumidor",
  "codigo-transito": "Código_de_Trânsito_Brasileiro",
  "codigo-eleitoral": "Código_Eleitoral",
  "constituicao-federal": "Constituicao_Federal"
};

const CodigoView = () => {
  const { codigoId } = useParams<{ codigoId: string }>();
  const codigo = legalCodes.find(c => c.id === codigoId);
  const [articles, setArticles] = useState<LegalArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadArticles = async () => {
      if (!codigoId) return;
      try {
        setLoading(true);
        const tableName = tableNameMap[codigoId];
        if (tableName) {
          const data = await fetchLegalCode(tableName as any);
          setArticles(data);
        }
      } catch (error) {
        console.error("Failed to load articles:", error);
        setErrorMessage("Falha ao carregar artigos. Por favor, tente novamente.");
        setErrorDialogOpen(true);
        toast.error("Falha ao carregar artigos. Por favor, tente novamente.");
      } finally {
        setLoading(false);
      }
    };
    loadArticles();
    
    // Reset search when changing codes
    setSearchTerm("");
    
    // Scroll to top when changing codes
    window.scrollTo(0, 0);
  }, [codigoId]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Filter articles based on search term
  const filteredArticles = articles.filter(article => {
    const searchLower = searchTerm.toLowerCase();
    return (
      article.numero && article.numero.toLowerCase().includes(searchLower) || 
      article.artigo.toLowerCase().includes(searchLower)
    );
  });
  
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!codigo) {
    return (
      <div className="min-h-screen flex flex-col dark">
        <Header />
        
        <main className="flex-1 container py-6 pb-20 md:pb-6 flex flex-col items-center justify-center">
          <h2 className="text-2xl font-bold text-law-accent mb-4">Código não encontrado</h2>
          <Link to="/codigos" className="text-law-accent hover:underline">
            Voltar para lista de códigos
          </Link>
        </main>
        
        <MobileFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col dark">
      <Header />
      
      <main className="flex-1 container pb-20 md:pb-6 py-4 mx-auto px-3 md:px-4" ref={contentRef}>
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Início</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/codigos">Códigos</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{codigo.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        
        <div className="mb-6">
          <h1 className="text-2xl font-serif font-bold text-law-accent mb-1">
            {codigo.title}
          </h1>
          <p className="text-gray-400 text-sm">{codigo.description}</p>
          
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
        </div>
        
        {/* Articles section with improved loading state */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-background-dark p-4 rounded-md border border-gray-800 animate-pulse">
                <div className="flex justify-between items-start mb-4">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-6" />
                </div>
                <Skeleton className="h-3 w-full mb-2" />
                <Skeleton className="h-3 w-5/6 mb-2" />
                <Skeleton className="h-3 w-4/6 mb-4" />
                <div className="flex justify-end">
                  <Skeleton className="h-7 w-20 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
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
        )}

        {/* Scroll to top button */}
        {showScrollTop && (
          <button 
            onClick={scrollToTop}
            className="fixed right-4 bottom-20 md:bottom-6 z-10 bg-law-accent text-white p-2 rounded-full shadow-lg hover:bg-law-accent/90 transition-all"
            aria-label="Voltar ao topo"
          >
            <ArrowUp className="h-5 w-5" />
          </button>
        )}

        {/* Error Dialog */}
        <AlertDialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
          <AlertDialogContent className="bg-background-dark">
            <AlertDialogTitle>Erro</AlertDialogTitle>
            <AlertDialogDescription>
              {errorMessage}
            </AlertDialogDescription>
            <div className="flex justify-end">
              <AlertDialogCancel onClick={() => setErrorDialogOpen(false)}>
                Fechar
              </AlertDialogCancel>
              <AlertDialogAction onClick={() => window.location.reload()}>
                Tentar Novamente
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </main>
      
      <MobileFooter />
    </div>
  );
};

export default CodigoView;
