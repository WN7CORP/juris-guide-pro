
import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { MobileFooter } from "@/components/MobileFooter";
import { LegalArticle, fetchLegalCode } from "@/services/legalCodeService";
import { legalCodes } from "@/data/legalCodes";
import { tableNameMap } from "@/utils/tableMapping";
import { Skeleton } from "@/components/ui/skeleton";
import { Volume, VolumeX, Headphones } from "lucide-react";
import AudioCommentPlaylist from "@/components/AudioCommentPlaylist";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const AudioComments = () => {
  const [articlesMap, setArticlesMap] = useState<Record<string, LegalArticle[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState<Record<string, number>>({});
  
  // Total count of articles with audio comments
  const totalAudioArticles = Object.values(articlesMap).reduce(
    (total, articles) => total + articles.length, 0
  );
  
  useEffect(() => {
    const loadArticlesWithAudio = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const articlesWithAudioMap: Record<string, LegalArticle[]> = {};
        const totalCodes = legalCodes.length;
        
        // Fetch articles from all codes
        for (const [index, code] of legalCodes.entries()) {
          const tableName = tableNameMap[code.id];
          if (!tableName) continue;
          
          try {
            setLoadingProgress(prev => ({
              ...prev,
              [code.id]: 0
            }));
            
            const articles = await fetchLegalCode(tableName as any);
            const articlesWithAudio = articles.filter(article => article.comentario_audio);
            
            if (articlesWithAudio.length > 0) {
              articlesWithAudioMap[code.id] = articlesWithAudio;
            } else {
              articlesWithAudioMap[code.id] = [];
            }
            
            // Update loading progress
            const progress = Math.round(((index + 1) / totalCodes) * 100);
            setLoadingProgress(prev => ({
              ...prev,
              [code.id]: 100,
              total: progress
            }));
            
          } catch (codeError) {
            console.error(`Error loading articles for ${code.title}:`, codeError);
            articlesWithAudioMap[code.id] = [];
            
            setLoadingProgress(prev => ({
              ...prev,
              [code.id]: 100
            }));
          }
        }
        
        setArticlesMap(articlesWithAudioMap);
      } catch (err) {
        console.error("Failed to load audio comments:", err);
        setError("Falha ao carregar comentários em áudio. Por favor, tente novamente.");
      } finally {
        setLoading(false);
      }
    };
    
    loadArticlesWithAudio();
  }, []);

  const refreshData = () => {
    setLoading(true);
    setLoadingProgress({});
    const loadArticlesWithAudio = async () => {
      try {
        const articlesWithAudioMap: Record<string, LegalArticle[]> = {};
        const totalCodes = legalCodes.length;
        
        for (const [index, code] of legalCodes.entries()) {
          const tableName = tableNameMap[code.id];
          if (!tableName) continue;
          
          try {
            const articles = await fetchLegalCode(tableName as any);
            const articlesWithAudio = articles.filter(article => article.comentario_audio);
            
            if (articlesWithAudio.length > 0) {
              articlesWithAudioMap[code.id] = articlesWithAudio;
            } else {
              articlesWithAudioMap[code.id] = [];
            }
            
            // Update loading progress
            const progress = Math.round(((index + 1) / totalCodes) * 100);
            setLoadingProgress(prev => ({
              ...prev,
              [code.id]: 100,
              total: progress
            }));
            
          } catch (codeError) {
            console.error(`Error loading articles for ${code.title}:`, codeError);
            articlesWithAudioMap[code.id] = [];
          }
        }
        
        setArticlesMap(articlesWithAudioMap);
        setError(null);
      } catch (err) {
        console.error("Failed to load audio comments:", err);
        setError("Falha ao carregar comentários em áudio. Por favor, tente novamente.");
      } finally {
        setLoading(false);
      }
    };
    
    loadArticlesWithAudio();
  };

  return (
    <div className="min-h-screen flex flex-col dark">
      <Header />
      
      <main className="flex-1 container pb-20 md:pb-6 py-4 mx-auto px-3 md:px-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-serif font-bold text-law-accent flex items-center gap-2 mb-2">
              <Headphones className="h-6 w-6" /> 
              Comentários em Áudio
            </h1>
            <p className="text-gray-400 text-sm">
              {loading 
                ? "Carregando comentários em áudio..." 
                : `${totalAudioArticles} artigos comentados disponíveis para ouvir`}
            </p>
          </div>
          
          {!loading && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={refreshData}
              className="text-xs"
            >
              Atualizar
            </Button>
          )}
        </div>
        
        {loading ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-2 bg-gray-800 rounded-full w-full max-w-md">
                <div 
                  className="h-2 bg-law-accent rounded-full transition-all duration-300" 
                  style={{ width: `${loadingProgress.total || 0}%` }}
                />
              </div>
              <span className="text-xs text-gray-400 ml-2">
                {loadingProgress.total || 0}%
              </span>
            </div>
            
            {[1, 2, 3].map(i => (
              <div key={i} className="border border-gray-800 rounded-md p-4 animate-pulse">
                <Skeleton className="h-6 w-40 mb-4" />
                <div className="space-y-3">
                  {[1, 2, 3].map(j => (
                    <Skeleton key={j} className="h-16 w-full" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-10">
            <VolumeX className="h-10 w-10 mx-auto text-red-400 mb-4" />
            <p className="text-red-400 mb-4">{error}</p>
            <Button onClick={refreshData}>Tentar novamente</Button>
          </div>
        ) : (
          <div className="animate-fade-in">
            <AudioCommentPlaylist articlesMap={articlesMap} />
          </div>
        )}
      </main>
      
      <MobileFooter />
    </div>
  );
};

export default AudioComments;
