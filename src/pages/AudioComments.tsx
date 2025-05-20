
import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { LegalArticle, fetchLegalCode } from "@/services/legalCodeService";
import { legalCodes } from "@/data/legalCodes";
import { tableNameMap } from "@/utils/tableMapping";
import { Skeleton } from "@/components/ui/skeleton";
import { Volume, VolumeX, Headphones, Play, Pause, RefreshCw, Filter } from "lucide-react";
import AudioCommentPlaylist from "@/components/AudioCommentPlaylist";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { globalAudioState } from "@/components/AudioCommentPlaylist";

const AudioComments = () => {
  const [articlesMap, setArticlesMap] = useState<Record<string, LegalArticle[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState<Record<string, number>>({});
  const [selectedFilter, setSelectedFilter] = useState<string>("todos");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPlayingArticle, setCurrentPlayingArticle] = useState<string | null>(null);
  
  // Total count of articles with audio comments
  const totalAudioArticles = Object.values(articlesMap).reduce(
    (total, articles) => total + articles.length, 0
  );

  // Get code title by ID
  const getCodeTitle = (codeId: string) => {
    const code = legalCodes.find(c => c.id === codeId);
    return code ? code.title : codeId;
  };
  
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
            
            const result = await fetchLegalCode(tableName as any);
            const articlesWithAudio = result.articles.filter(article => article.comentario_audio);
            
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

    // Set up listeners for audio playback state
    const checkAudioStatus = () => {
      if (globalAudioState.currentAudioId) {
        setCurrentPlayingArticle(globalAudioState.currentAudioId);
      } else {
        setCurrentPlayingArticle(null);
      }
    };
    
    const intervalId = setInterval(checkAudioStatus, 1000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const refreshData = () => {
    setLoading(true);
    setLoadingProgress({});
    setSearchTerm("");
    setSelectedFilter("todos");
    
    const loadArticlesWithAudio = async () => {
      try {
        const articlesWithAudioMap: Record<string, LegalArticle[]> = {};
        const totalCodes = legalCodes.length;
        
        for (const [index, code] of legalCodes.entries()) {
          const tableName = tableNameMap[code.id];
          if (!tableName) continue;
          
          try {
            const result = await fetchLegalCode(tableName as any);
            const articlesWithAudio = result.articles.filter(article => article.comentario_audio);
            
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

  // Function to handle playing audio
  const playAudio = (articleId: string, audioUrl?: string) => {
    if (!audioUrl) return;
    
    if (currentPlayingArticle === articleId) {
      // Already playing this audio, do nothing
      return;
    }
    
    // Create and play audio
    const audio = new Audio(audioUrl);
    audio.play().catch(error => {
      console.error("Failed to play audio:", error);
    });
    
    setCurrentPlayingArticle(articleId);
  };

  // Filter articles based on search and filter
  const getFilteredArticles = () => {
    const allArticles: {
      article: LegalArticle;
      codeId: string;
    }[] = [];

    // Collect all articles with their code ID
    Object.entries(articlesMap).forEach(([codeId, articles]) => {
      articles.forEach(article => {
        allArticles.push({
          article,
          codeId
        });
      });
    });

    // Apply filters
    return allArticles.filter(({ article, codeId }) => {
      // Filter by code if not "todos"
      if (selectedFilter !== "todos" && selectedFilter !== codeId) {
        return false;
      }

      // Apply search term if present
      if (searchTerm) {
        const articleText = article.texto?.toLowerCase() || "";
        const articleNumber = article.numero?.toLowerCase() || "";
        const searchLower = searchTerm.toLowerCase();
        
        return articleText.includes(searchLower) || 
               articleNumber.includes(searchLower);
      }

      return true;
    });
  };

  const filteredArticles = getFilteredArticles();

  return (
    <div className="min-h-screen flex flex-col dark">
      <Header />
      
      <main className="flex-1 container pb-20 md:pb-6 pt-20 md:pt-6 px-3 md:px-4">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
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
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={refreshData}
              disabled={loading}
              className="h-9"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Atualizar
            </Button>
          </div>
        </div>
        
        {!loading && !error && (
          <div className="mb-6 space-y-3 md:space-y-0 md:flex items-end gap-3 bg-netflix-dark/30 p-4 rounded-lg border border-gray-800">
            <div className="flex-1">
              <label className="text-xs text-gray-400 mb-1 block">Pesquisar artigos</label>
              <Input
                placeholder="Buscar por número ou texto do artigo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-netflix-bg border-gray-800 focus-visible:ring-netflix-red h-9"
              />
            </div>
            <div className="w-full md:w-64">
              <label className="text-xs text-gray-400 mb-1 block">Filtrar por código</label>
              <Select
                value={selectedFilter}
                onValueChange={setSelectedFilter}
              >
                <SelectTrigger className="bg-netflix-bg border-gray-800 h-9">
                  <SelectValue placeholder="Filtrar por código" />
                </SelectTrigger>
                <SelectContent className="bg-netflix-bg border-gray-800">
                  <SelectItem value="todos">Todos os códigos</SelectItem>
                  {Object.keys(articlesMap).map(codeId => (
                    articlesMap[codeId].length > 0 && (
                      <SelectItem key={codeId} value={codeId}>
                        {getCodeTitle(codeId)} ({articlesMap[codeId].length})
                      </SelectItem>
                    )
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
        
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <Card key={i} className="bg-netflix-dark border-gray-800">
                  <CardHeader className="pb-2">
                    <Skeleton className="h-5 w-24 mb-1" />
                    <Skeleton className="h-4 w-32" />
                  </CardHeader>
                  <CardContent className="pb-2">
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="h-9 w-full" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-10">
            <VolumeX className="h-10 w-10 mx-auto text-red-400 mb-4" />
            <p className="text-red-400 mb-4">{error}</p>
            <Button onClick={refreshData}>Tentar novamente</Button>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="text-center py-10 bg-netflix-dark/30 rounded-lg border border-gray-800">
            <Volume className="h-10 w-10 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-400 mb-4">
              {searchTerm 
                ? "Nenhum artigo encontrado para a pesquisa." 
                : selectedFilter !== "todos" 
                  ? "Nenhum comentário em áudio disponível para este código." 
                  : "Nenhum comentário em áudio disponível."}
            </p>
            {(searchTerm || selectedFilter !== "todos") && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("");
                  setSelectedFilter("todos");
                }}
              >
                Limpar filtros
              </Button>
            )}
          </div>
        ) : (
          <div className="animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredArticles.map(({ article, codeId }) => (
                <Card 
                  key={`${codeId}-${article.id}`} 
                  className={cn(
                    "bg-netflix-dark border-gray-800 transition-all duration-300 hover:border-gray-700",
                    currentPlayingArticle === article.id?.toString() && "border-netflix-red shadow-md"
                  )}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="flex justify-between items-center text-md">
                      <span>Art. {article.numero || "Sem número"}</span>
                      <span className="text-xs font-normal bg-netflix-red/10 text-netflix-red px-2 py-0.5 rounded">
                        {getCodeTitle(codeId)}
                      </span>
                    </CardTitle>
                    <CardDescription className="line-clamp-1 text-xs">
                      {article.titulo || "Sem título"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <p className="text-sm text-gray-300 line-clamp-3">
                      {article.texto || "Sem texto"}
                    </p>
                  </CardContent>
                  <CardFooter className="flex justify-between gap-2">
                    <Button 
                      variant="default" 
                      size="sm"
                      className="flex-1 bg-netflix-red hover:bg-netflix-red/80"
                      onClick={() => playAudio(article.id?.toString() || "", article.comentario_audio)}
                    >
                      {currentPlayingArticle === article.id?.toString() ? (
                        <>
                          <Pause className="h-4 w-4 mr-2" />
                          Reproduzindo
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Ouvir comentário
                        </>
                      )}
                    </Button>
                    <Link to={`/codigos/${codeId}?article=${article.id}`}>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="border-gray-700"
                      >
                        Ver artigo
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
            
            {filteredArticles.length > 0 && filteredArticles.length < totalAudioArticles && (
              <div className="mt-6 text-center text-sm text-gray-400">
                Mostrando {filteredArticles.length} de {totalAudioArticles} artigos com comentários em áudio.
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AudioComments;
