
import { useParams, Link } from "react-router-dom";
import { legalCodes } from "@/data/legalCodes";
import { Header } from "@/components/Header";
import { MobileFooter } from "@/components/MobileFooter";
import { ArticleView } from "@/components/ArticleView";
import { ChevronLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { fetchLegalCode, LegalArticle } from "@/services/legalCodeService";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

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
  "constituicao-federal": "Constituicao_Federal",
};

const CodigoView = () => {
  const { codigoId } = useParams<{ codigoId: string }>();
  const codigo = legalCodes.find((c) => c.id === codigoId);
  const [articles, setArticles] = useState<LegalArticle[]>([]);
  const [loading, setLoading] = useState(true);

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
        toast.error("Falha ao carregar artigos. Por favor, tente novamente.");
      } finally {
        setLoading(false);
      }
    };

    loadArticles();
  }, [codigoId]);

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
      
      <main className="flex-1 container py-6 pb-20 md:pb-6">
        <Link to="/codigos" className="flex items-center text-law-accent mb-4 hover:underline">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Voltar para lista de códigos
        </Link>
        
        <div className="mb-6">
          <h2 className="text-2xl font-serif font-bold text-law-accent">
            {codigo.title}
          </h2>
          <p className="text-gray-400 mt-1">{codigo.description}</p>
        </div>
        
        {loading ? (
          <div className="space-y-8">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-6 w-1/4" />
                <Skeleton className="h-24 w-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {articles.length > 0 ? (
              articles.map((article) => (
                <ArticleView 
                  key={article.id} 
                  article={{
                    id: article.id?.toString() || `${codigoId}-${article.numero || Math.random().toString()}`,
                    number: article.numero || "",
                    content: article.artigo,
                    title: article.numero ? `Art. ${article.numero}` : "",
                    explanation: article.tecnica,
                    formalExplanation: article.formal,
                    practicalExample: article.exemplo,
                  }} 
                />
              ))
            ) : (
              <p className="text-gray-400 text-center py-8">
                Nenhum artigo encontrado para este código.
              </p>
            )}
          </div>
        )}
      </main>
      
      <MobileFooter />
    </div>
  );
};

export default CodigoView;
