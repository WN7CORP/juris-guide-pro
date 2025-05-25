import { useState, useEffect, useMemo } from "react";
import { Header } from "@/components/Header";
import { LegalArticle, fetchLegalCode } from "@/services/legalCodeService";
import { legalCodes } from "@/data/legalCodes";
import { tableNameMap } from "@/utils/tableMapping";
import { Skeleton } from "@/components/ui/skeleton";
import { Volume, VolumeX, Headphones, BookOpen, ChevronRight, Play, Pause, ArrowLeft, BookMarked } from "lucide-react";
import AudioCommentPlaylist, { globalAudioState } from "@/components/AudioCommentPlaylist";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { categorizeLegalCode, formatTime, getLegalCodeIcon } from "@/utils/formatters";
import { motion } from "framer-motion";

// Define interface for categorized articles
interface CategorizedArticles {
  códigos: Record<string, LegalArticle[]>;
  estatutos: Record<string, LegalArticle[]>;
  constituição: Record<string, LegalArticle[]>;
  leis: Record<string, LegalArticle[]>;
}

const AudioComments = () => {
  const [articlesMap, setArticlesMap] = useState<Record<string, LegalArticle[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState<Record<string, number>>({});
  const [selectedCategory, setSelectedCategory] = useState<'códigos' | 'estatutos' | 'constituição' | 'leis'>('códigos');
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [focusMode, setFocusMode] = useState(false);
  const [currentArticle, setCurrentArticle] = useState<LegalArticle | null>(null);
  
  // Memoize total count of articles with audio comments for better performance
  const totalAudioArticles = useMemo(() => 
    Object.values(articlesMap).reduce((total, articles) => total + articles.length, 0),
    [articlesMap]
  );

  // Categorize articles by code type
  const categorizedArticles = useMemo(() => {
    const result: CategorizedArticles = {
      códigos: {},
      estatutos: {},
      constituição: {},
      leis: {}
    };
    
    Object.entries(articlesMap).forEach(([codeId, articles]) => {
      if (articles.length === 0) return;
      
      const category = categorizeLegalCode(codeId);
      result[category][codeId] = articles;
    });
    
    return result;
  }, [articlesMap]);
  
  // Check for currently playing audio and update focus mode
  useEffect(() => {
    const checkAudioStatus = () => {
      if (globalAudioState.minimalPlayerInfo && globalAudioState.isPlaying) {
        const { codeId, articleId } = globalAudioState.minimalPlayerInfo;
        
        // If there's a playing audio and we have that article data, set focus mode
        if (articlesMap[codeId]) {
          const foundArticle = articlesMap[codeId].find(
            article => article.id?.toString() === articleId
          );
          
          if (foundArticle) {
            setCurrentArticle(foundArticle);
            setSelectedCode(codeId);
            setSelectedCategory(categorizeLegalCode(codeId));
            setFocusMode(true);
          }
        }
      }
    };
    
    const intervalId = setInterval(checkAudioStatus, 500);
    return () => clearInterval(intervalId);
  }, [articlesMap]);
  
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
            
            const result = await fetchLegalCode(tableName as any);
            const articlesWithAudio = result.articles.filter(
              article => typeof article === 'object' && 
              article !== null && 
              'comentario_audio' in article && 
              article.comentario_audio
            );
            
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
            const result = await fetchLegalCode(tableName as any);
            const articlesWithAudio = result.articles.filter(article => 
              typeof article === 'object' && article !== null && 'comentario_audio' in article && article.comentario_audio
            );
            
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

  // Get code title by ID
  const getCodeTitle = (codeId: string) => {
    const code = legalCodes.find(c => c.id === codeId);
    return code ? code.title : codeId;
  };

  // Exit focus mode
  const exitFocusMode = () => {
    setFocusMode(false);
    setCurrentArticle(null);
  };

  // Toggle audio playback
  const toggleAudioPlayback = () => {
    if (!globalAudioState.audioElement) return;
    
    if (globalAudioState.audioElement.paused) {
      globalAudioState.audioElement.play();
      globalAudioState.isPlaying = true;
    } else {
      globalAudioState.audioElement.pause();
      globalAudioState.isPlaying = false;
    }
  };

  // Render categories as tabs
  const renderCategoryTabs = () => (
    <Tabs 
      defaultValue="códigos" 
      className="w-full"
      value={selectedCategory}
      onValueChange={(value) => {
        setSelectedCategory(value as any);
        setSelectedCode(null);
      }}
    >
      <TabsList className="grid grid-cols-4 mb-4">
        <TabsTrigger value="códigos">Códigos</TabsTrigger>
        <TabsTrigger value="estatutos">Estatutos</TabsTrigger>
        <TabsTrigger value="constituição">Constituição</TabsTrigger>
        <TabsTrigger value="leis">Leis</TabsTrigger>
      </TabsList>
      
      {['códigos', 'estatutos', 'constituição', 'leis'].map((category) => (
        <TabsContent 
          key={category} 
          value={category}
          className="animate-fade-in"
        >
          {renderCategoryContent(category as keyof CategorizedArticles)}
        </TabsContent>
      ))}
    </Tabs>
  );

  // Render codes within a category
  const renderCategoryContent = (category: keyof CategorizedArticles) => {
    const codesInCategory = Object.keys(categorizedArticles[category]);
    
    if (codesInCategory.length === 0) {
      return (
        <div className="text-center py-8 text-gray-400">
          Nenhum {category} com comentários em áudio disponível.
        </div>
      );
    }
    
    if (selectedCode && categorizedArticles[category][selectedCode]) {
      return renderCodeArticles(selectedCode, categorizedArticles[category][selectedCode]);
    }
    
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-2"
      >
        {codesInCategory.map(codeId => (
          <div 
            key={codeId}
            className="border border-gray-800 rounded-lg p-3 cursor-pointer hover:bg-gray-800/30 transition-colors"
            onClick={() => setSelectedCode(codeId)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getLegalCodeIcon(codeId)}
                <span className="font-medium">{getCodeTitle(codeId)}</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm text-gray-400 mr-2">
                  {categorizedArticles[category][codeId].length} artigo(s)
                </span>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
        ))}
      </motion.div>
    );
  };

  // Render articles for a specific code
  const renderCodeArticles = (codeId: string, articles: LegalArticle[]) => {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-4"
      >
        <div className="flex items-center mb-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-0 mr-2"
            onClick={() => setSelectedCode(null)}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span>Voltar</span>
          </Button>
          <h3 className="text-lg font-serif font-medium">
            {getCodeTitle(codeId)}
          </h3>
        </div>
        
        <AudioCommentPlaylist 
          articlesMap={{ [codeId]: articles }} 
          onArticleSelect={(article) => {
            setCurrentArticle(article);
            setFocusMode(true);
          }}
        />
      </motion.div>
    );
  };

  // Render focus mode with current article
  const renderFocusMode = () => {
    if (!currentArticle) return null;
    
    const currentAudioId = globalAudioState.currentAudioId;
    const isPlaying = globalAudioState.isPlaying;
    const currentTime = globalAudioState.audioElement?.currentTime || 0;
    const duration = globalAudioState.audioElement?.duration || 0;
    
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-3xl mx-auto bg-gray-900/70 backdrop-blur-sm rounded-lg border border-gray-800 p-6"
      >
        <div className="flex justify-between items-center mb-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={exitFocusMode}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span>Voltar à lista</span>
          </Button>
          
          <div className="text-sm text-gray-400">
            {selectedCode && getCodeTitle(selectedCode)}
          </div>
        </div>
        
        <h2 className="text-xl font-serif font-medium text-law-accent mb-2">
          {currentArticle.numero ? `Art. ${currentArticle.numero}` : 'Artigo'}
        </h2>
        
        <div className="text-lg mb-6 leading-relaxed whitespace-pre-line">
          {currentArticle.artigo}
        </div>
        
        <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
          <div className="flex justify-between mb-2">
            <Button
              variant={isPlaying ? "default" : "outline"}
              size="sm"
              onClick={toggleAudioPlayback}
              className="flex gap-1 items-center"
            >
              {isPlaying ? (
                <>
                  <Pause className="h-4 w-4" />
                  <span>Pausar</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  <span>Ouvir</span>
                </>
              )}
            </Button>
            
            <div className="text-sm text-gray-400">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="h-2 bg-gray-700 rounded-full">
            <div 
              className="h-2 bg-law-accent rounded-full transition-all duration-300" 
              style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
            />
          </div>
        </div>
        
        {currentArticle.comentario_audio && (
          <div className="text-xs text-gray-500 text-center">
            O áudio contém um comentário jurídico sobre este artigo
          </div>
        )}
      </motion.div>
    );
  };

  // Memoize the playlist component to prevent unnecessary re-renders
  const renderContent = useMemo(() => {
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
    
    if (focusMode) {
      return renderFocusMode();
    }
    
    return renderCategoryTabs();
  }, [loading, error, articlesMap, loadingProgress.total, selectedCategory, selectedCode, focusMode, currentArticle]);

  return (
    <div className="min-h-screen flex flex-col dark">
      <Header />
      
      <main className="flex-1 container pb-6 py-4 mx-auto px-3 md:px-4">
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
          
          {!loading && !focusMode && (
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
        
        {renderContent}
      </main>
    </div>
  );
};

export default AudioComments;
