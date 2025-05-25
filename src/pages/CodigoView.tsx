
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { MobileFooter } from "@/components/MobileFooter";
import CodeHeader from "@/components/CodeHeader";
import CodeSearch from "@/components/CodeSearch";
import ArticlesLoading from "@/components/ArticlesLoading";
import ErrorDialog from "@/components/ErrorDialog";
import { CodePagination } from "@/components/legal/CodePagination";
import { ArticleView } from "@/components/article/ArticleView";
import { fetchLegalCode, LegalArticle } from "@/services/legalCodeService";
import { legalCodes } from "@/data/legalCodes";
import { getTableName } from "@/utils/tableMapping";
import { usePagination } from "@/hooks/usePagination";
import { toast } from "sonner";

const CodigoView = () => {
  const { codeId } = useParams();
  const navigate = useNavigate();
  
  const [articles, setArticles] = useState<LegalArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [total, setTotal] = useState(0);

  const { currentPage, totalPages, handlePageChange } = usePagination({
    totalItems: total,
    itemsPerPage: 20
  });

  const currentCode = legalCodes.find(code => code.id === codeId);

  useEffect(() => {
    if (!currentCode) {
      navigate('/codigos');
      return;
    }

    const loadArticles = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const tableName = getTableName(codeId!);
        if (!tableName) {
          throw new Error(`Tabela não encontrada para o código: ${codeId}`);
        }

        const result = await fetchLegalCode(tableName, currentPage, 20);
        setArticles(result.articles);
        setTotal(result.total);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
        setError(errorMessage);
        toast.error(`Erro ao carregar artigos: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    loadArticles();
  }, [codeId, currentCode, navigate, currentPage]);

  const filteredArticles = articles.filter(article => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      article.artigo?.toLowerCase().includes(searchLower) ||
      article.numero?.toLowerCase().includes(searchLower)
    );
  });

  if (!currentCode) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-6 pb-20 md:pb-6">
        <CodeHeader 
          title={currentCode.name}
          description={`${total} artigos disponíveis`}
        />
        
        <CodeSearch 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          totalResults={filteredArticles.length}
        />

        {error && (
          <ErrorDialog 
            open={!!error}
            onOpenChange={() => setError(null)}
            errorMessage={error}
          />
        )}

        {loading ? (
          <ArticlesLoading />
        ) : (
          <>
            <div className="space-y-6">
              {filteredArticles.map((article) => (
                <ArticleView
                  key={article.id}
                  article={{
                    id: article.id?.toString() || '',
                    number: article.numero,
                    content: article.artigo,
                    explanation: article.tecnica,
                    formalExplanation: article.formal,
                    practicalExample: article.exemplo,
                    comentario_audio: article.comentario_audio
                  }}
                  codeId={codeId}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <CodePagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}
      </main>
      
      <MobileFooter />
    </div>
  );
};

export default CodigoView;
