
import { useState, useEffect, useMemo } from "react";
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
  
  // Memoize total count of articles with audio comments for better performance
  const totalAudioArticles = useMemo(() => 
    Object.values(articlesMap).reduce((total, articles) => total + articles.length, 0),
    [articlesMap]
  );
  
  useEffect(() => {
    const loadArticlesWithAudio = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const articlesWithAudioMap: Record<string, LegalArticle[]> = {};
        const totalCodes = legalCodes.length;
        
        // Create an array of promises to fetch all codes in parallel
        const fetchPromises = legalCodes.map(async (code, index) => {
          const tableName = tableNameMap[code.id];
          if (!tableName) return null;
          
          try {
            setLoadingProgress(prev => ({
              ...prev,
              [code.id]: 0
            }));
            
            const articles = await fetchLegalCode(tableName as any);
            const articlesWithAudio = articles.filter(article => article.comentario_audio);
            
            // Update loading progress
            setLoadingProgress(prev => ({
              ...prev,
              [code.id]: 100,
              total: Math.round(((index + 1) / totalCodes) * 100)
            }));
            
            return { 
              codeId: code.id, 
              articles: articlesWithAudio 
            };
          } catch (codeError) {
            console.error(`Error loading articles for ${code.title}:`, codeError);
            
            setLoadingProgress(prev => ({
              ...prev,
              [code.id]: 100
            }));
            
            return { 
              codeId: code.id, 
              articles: [] 
            };
          }
        });
        
        // Wait for all fetches to complete
        const results = await Promise.all(fetchPromises);
        
        // Combine results into the articlesMap
        results.forEach(result => {
          if (result) {
            articlesWithAudioMap[result.codeId] = result.articles;
          }
        });
        
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
        
        // Create an array of promises to fetch all codes in parallel
        const fetchPromises = legalCodes.map(async (code, index) => {
          const tableName = tableNameMap[code.id];
          if (!tableName) return null;
          
          try {
            const articles = await fetchLegalCode(tableName as any);
            const articlesWithAudio = articles.filter(article => article.comentario_audio);
            
            // Update loading progress
            setLoadingProgress(prev => ({
              ...prev,
              [code.id]: 100,
              total: Math.round(((index + 1) / totalCodes) * 100)
            }));
            
            return { 
              codeId: code.id, 
              articles: articlesWithAudio 
            };
          } catch (codeError) {
            console.error(`Error loading articles for ${code.title}:`, codeError);
            return { 
              codeId: code.id, 
              articles: [] 
            };
          }
        });
        
        // Wait for all fetches to complete
        const results = await Promise.all(fetchPromises);
        
        // Combine results into the articlesMap
        results.forEach(result => {
          if (result) {
            articlesWithAudioMap[result.codeId] = result.articles;
          }
        });
        
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

  // Memoize the playlist component to prevent unnecessary re-renders
  const renderPlaylist = useMemo(() => {
    if (loading) {
      return (
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
      );
    }
    
    if (error) {
      return (
        <div className="text-center py-10">
          <VolumeX className="h-10 w-10 mx-auto text-red-400 mb-4" />
          <p className="text-red-400 mb-4">{error}</p>
          <Button onClick={refreshData}>Tentar novamente</Button>
        </div>
      );
    }
    
    return (
      <div className="animate-fade-in">
        <AudioCommentPlaylist articlesMap={articlesMap} />
      </div>
    );
  }, [loading, error, articlesMap, loadingProgress.total]);

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
        
        {renderPlaylist}
      </main>
      
      <MobileFooter />
    </div>
  );
};

export default AudioComments;
