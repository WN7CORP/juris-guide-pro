import { useParams, Link } from "react-router-dom";
import { legalCodes } from "@/data/legalCodes";
import { Header } from "@/components/Header";
import { MobileFooter } from "@/components/MobileFooter";
import { ArticleView } from "@/components/ArticleView";
import { ChevronLeft, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { fetchLegalCode, LegalArticle } from "@/services/legalCodeService";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { AlertDialog, AlertDialogContent, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";

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
  const {
    codigoId
  } = useParams<{
    codigoId: string;
  }>();
  const codigo = legalCodes.find(c => c.id === codigoId);
  const [articles, setArticles] = useState<LegalArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  useEffect(() => {
    const loadArticles = async () => {
      if (!codigoId) return;
      try {
        setLoading(true);
        const tableName = tableNameMap[codigoId];
        if (tableName) {
          const data = await fetchLegalCode(tableName as any); // Type assertion to handle the mapping
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
  }, [codigoId]);

  // Filter articles based on search term
  const filteredArticles = articles.filter(article => {
    const searchLower = searchTerm.toLowerCase();
    return article.numero && article.numero.toLowerCase().includes(searchLower) || article.artigo.toLowerCase().includes(searchLower);
  });
  if (!codigo) {
    return <div className="min-h-screen flex flex-col dark">
        <Header />
        
        <main className="flex-1 container py-6 pb-20 md:pb-6 flex flex-col items-center justify-center">
          <h2 className="text-2xl font-bold text-law-accent mb-4">Código não encontrado</h2>
          <Link to="/codigos" className="text-law-accent hover:underline">
            Voltar para lista de códigos
          </Link>
        </main>
        
        <MobileFooter />
      </div>;
  }
  return <div className="min-h-screen flex flex-col dark">
      <Header />
      
      <main className="flex-1 container pb-20 md:pb-6 py-[15px] mx-0 my-[5px] px-[12px]">
        <Link to="/codigos" className="flex items-center text-law-accent mb-4 hover:underline">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Voltar para lista de códigos
        </Link>
        
        <div className="mb-6">
          <h2 className="text-2xl font-serif font-bold text-law-accent">
            {codigo.title}
          </h2>
          <p className="text-gray-400 mt-1 text-sm">{codigo.description}</p>
          
          {/* Search input */}
          <div className="mt-4 relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input type="text" placeholder="Buscar por artigo ou conteúdo..." className="w-full pl-10 pr-4 py-2 bg-background-dark border border-gray-800 rounded-md focus:outline-none focus:ring-1 focus:ring-law-accent text-sm" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
          </div>
        </div>
        
        {loading ? <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => <div key={i} className="bg-background-dark p-4 rounded-md border border-gray-800">
                <div className="flex justify-between items-start mb-4">
                  <Skeleton className="h-5 w-1/5" />
                  <Skeleton className="h-5 w-6" />
                </div>
                <Skeleton className="h-16 w-full mb-4" />
                <div className="flex justify-end">
                  <Skeleton className="h-8 w-24" />
                </div>
              </div>)}
          </div> : <div className="space-y-4">
            {filteredArticles.length > 0 ? filteredArticles.map(article => <ArticleView key={article.id} article={{
          id: article.id?.toString() || `${codigoId}-${article.numero || Math.random().toString()}`,
          number: article.numero || "",
          content: article.artigo,
          title: article.numero ? `Art. ${article.numero}` : "",
          explanation: article.tecnica,
          formalExplanation: article.formal,
          practicalExample: article.exemplo
        }} />) : searchTerm ? <div className="text-center py-8 bg-background-dark rounded-md border border-gray-800">
                <p className="text-gray-400">Nenhum artigo encontrado para "{searchTerm}".</p>
                <button className="text-law-accent hover:underline text-sm mt-2" onClick={() => setSearchTerm("")}>
                  Limpar busca
                </button>
              </div> : <div className="text-center py-8 bg-background-dark rounded-md border border-gray-800">
                <p className="text-gray-400">Nenhum artigo encontrado para este código.</p>
              </div>}
          </div>}

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
    </div>;
};
export default CodigoView;