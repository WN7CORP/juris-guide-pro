
import { useState, useRef, useEffect } from "react";
import { Bookmark, BookmarkCheck, Info, BookText, BookOpen, X, Play, Volume, VolumeX, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFavoritesStore } from "@/store/favoritesStore";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";

interface Article {
  id: string;
  number?: string;
  title?: string;
  content: string;
  items?: string[];
  paragraphs?: string[];
  explanation?: string;
  formalExplanation?: string;
  practicalExample?: string;
  comentario_audio?: string;
}

interface ArticleViewProps {
  article: Article;
}

export const ArticleView = ({ article }: ArticleViewProps) => {
  const { isFavorite, addFavorite, removeFavorite } = useFavoritesStore();
  const articleIsFavorite = isFavorite(article.id);
  
  // State for audio playback
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLoaded, setAudioLoaded] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // State for explanation type
  const [explanationType, setExplanationType] = useState<string | null>(null);
  
  // State for collapsible content
  const [isExampleOpen, setIsExampleOpen] = useState(false);
  
  const toggleFavorite = () => {
    if (articleIsFavorite) {
      removeFavorite(article.id);
    } else {
      addFavorite(article.id);
    }
  };

  // Log when component mounts with article data
  useEffect(() => {
    if (article.comentario_audio) {
      console.log("Article View mounted with audio comment:", article.comentario_audio);
    }
  }, [article]);

  // Split content by line breaks to respect original formatting
  const contentLines = article.content.split('\n').filter(line => line.trim() !== '');

  // Check if we have any explanations available
  const hasExplanations = article.explanation || article.formalExplanation;
  const hasPracticalExample = !!article.practicalExample;
  
  // Check if article has audio commentary
  const hasAudioComment = !!article.comentario_audio;
  
  // For debugging
  if (article.comentario_audio) {
    console.log("Article has audio comment:", article.comentario_audio);
  }

  // Check if article has number to determine text alignment
  const hasNumber = !!article.number;

  const toggleAudioPlay = () => {
    console.log("Toggle audio playback. Current state:", isPlaying);
    if (!audioRef.current) {
      console.error("Audio reference is not available");
      return;
    }
    
    if (isPlaying) {
      console.log("Pausing audio");
      audioRef.current.pause();
    } else {
      console.log("Playing audio from URL:", article.comentario_audio);
      audioRef.current.play().catch(error => {
        console.error("Error playing audio:", error);
        setAudioError(`Erro ao reproduzir áudio: ${error.message}`);
        toast.error("Não foi possível reproduzir o áudio");
      });
    }
  };

  const handleAudioPlay = () => {
    console.log("Audio playback started");
    setIsPlaying(true);
  };

  const handleAudioPause = () => {
    console.log("Audio playback paused");
    setIsPlaying(false);
  };

  const handleAudioEnded = () => {
    console.log("Audio playback ended");
    setIsPlaying(false);
  };

  const handleAudioCanPlay = () => {
    console.log("Audio can play now");
    setAudioLoaded(true);
  };

  const handleAudioError = (e: any) => {
    const errorMessage = e.target.error 
      ? `Code: ${e.target.error.code}, Message: ${e.target.error.message}` 
      : "Unknown error";
    console.error("Audio error:", errorMessage);
    setAudioError(errorMessage);
    setIsPlaying(false);
    toast.error("Não foi possível reproduzir o áudio do comentário");
  };

  // Get the current explanation based on selected type
  const getCurrentExplanation = () => {
    if (!explanationType) return null;
    
    switch (explanationType) {
      case "technical":
        return article.explanation;
      case "formal":
        return article.formalExplanation;
      default:
        return null;
    }
  };

  return (
    <article className="legal-article bg-background-dark p-4 rounded-md border border-gray-800 mb-6 transition-all hover:border-gray-700 relative">
      <div className="flex justify-between items-start mb-3 gap-2">
        <div>
          {article.number && (
            <h3 className="legal-article-number font-serif text-lg font-bold text-law-accent">
              Art. {article.number}
            </h3>
          )}
          {article.title && !article.number && (
            <h4 className="legal-article-title">{article.title}</h4>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasAudioComment && (
            <Button
              variant="ghost"
              size="sm"
              className="text-law-accent hover:bg-background-dark flex-shrink-0"
              onClick={toggleAudioPlay}
              aria-label={isPlaying ? "Pausar comentário de áudio" : "Ouvir comentário de áudio"}
            >
              {isPlaying ? (
                <VolumeX className="h-5 w-5" />
              ) : (
                <Volume className="h-5 w-5" />
              )}
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="text-law-accent hover:bg-background-dark flex-shrink-0"
            onClick={toggleFavorite}
            aria-label={articleIsFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          >
            {articleIsFavorite ? (
              <BookmarkCheck className="h-5 w-5" />
            ) : (
              <Bookmark className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Hidden audio element for commentary playback */}
      {hasAudioComment && (
        <>
          <audio 
            ref={audioRef}
            src={article.comentario_audio}
            onPlay={handleAudioPlay}
            onPause={handleAudioPause}
            onEnded={handleAudioEnded}
            onError={handleAudioError}
            onCanPlay={handleAudioCanPlay}
            preload="metadata"
          />
          {audioError && (
            <div className="text-red-500 text-sm mb-2 p-2 bg-red-900/20 rounded">
              Erro ao carregar áudio: {audioError}
            </div>
          )}
          {isPlaying && (
            <div className="mb-2 p-2 bg-law-accent/10 rounded-md flex items-center justify-between">
              <span className="text-sm text-law-accent">
                Reproduzindo comentário em áudio...
              </span>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={toggleAudioPlay}
                className="h-7 w-7 p-0 rounded-full"
              >
                <VolumeX className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}

      <div className={cn(
        "legal-article-content whitespace-pre-line mb-3",
        !hasNumber && "text-center bg-red-500/10 p-3 rounded"
      )}>
        {contentLines.map((line, index) => (
          <p key={index} className="mb-2.5">{line}</p>
        ))}
      </div>

      {article.items && article.items.length > 0 && (
        <div className="legal-article-section pl-4 mb-3 border-l-2 border-gray-700">
          {article.items.map((item, index) => (
            <p key={index} className="mb-1.5 text-sm">
              {item}
            </p>
          ))}
        </div>
      )}

      {article.paragraphs && article.paragraphs.length > 0 && (
        <div className="legal-article-section pl-4 mb-3 border-l-2 border-gray-700">
          {article.paragraphs.map((paragraph, index) => (
            <p key={index} className="mb-1.5 text-sm italic">
              {paragraph}
            </p>
          ))}
        </div>
      )}

      {/* Explanation and Examples Functionality */}
      {(hasExplanations || hasPracticalExample || hasAudioComment) && (
        <div className="mt-4 space-y-3">
          {/* Explanation Selector */}
          {hasExplanations && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-gray-800/60 text-gray-300">
                  <Info className="h-3.5 w-3.5 mr-1" />
                  Explicação
                </Badge>
                <Select value={explanationType || ""} onValueChange={setExplanationType}>
                  <SelectTrigger className="w-[180px] bg-gray-800/60 border-gray-700 h-7 text-xs">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {article.explanation && (
                      <SelectItem value="technical">Técnica</SelectItem>
                    )}
                    {article.formalExplanation && (
                      <SelectItem value="formal">Formal</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              {explanationType && (
                <Card className="bg-gray-800/30 border-gray-700 p-3">
                  <div className="text-sm text-gray-300 space-y-2">
                    {getCurrentExplanation()?.split('\n').map((paragraph, i) => (
                      <p key={i} className="leading-relaxed">{paragraph}</p>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          )}
          
          {/* Practical Example */}
          {hasPracticalExample && (
            <Collapsible 
              open={isExampleOpen}
              onOpenChange={setIsExampleOpen}
              className="border border-gray-800 rounded-md overflow-hidden"
            >
              <CollapsibleTrigger asChild>
                <Button 
                  variant="ghost"
                  className="w-full flex justify-between items-center p-2 border-b border-gray-800 bg-gray-800/30"
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-law-accent" />
                    <span className="text-sm">Exemplo Prático</span>
                  </div>
                  <ChevronDown className={cn("h-4 w-4 transition-transform", isExampleOpen && "transform rotate-180")} />
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="p-3 bg-gray-800/10">
                <div className="text-sm text-gray-300 space-y-2">
                  {article.practicalExample?.split('\n').map((paragraph, i) => (
                    <p key={i} className="leading-relaxed">{paragraph}</p>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
          
          {/* Audio Comment Button */}
          {hasAudioComment && (
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full text-xs flex gap-1 h-8 px-2.5 rounded-md bg-gray-800/60 border-gray-700 hover:bg-gray-700"
              onClick={toggleAudioPlay}
            >
              {isPlaying ? 
                <VolumeX className="h-3.5 w-3.5" /> : 
                <Volume className="h-3.5 w-3.5" />
              }
              <span>Ouvir Comentário em Áudio</span>
              {audioLoaded ? <Badge variant="outline" className="ml-1 h-5 bg-law-accent/20 text-law-accent">Disponível</Badge> : <span>...</span>}
            </Button>
          )}
        </div>
      )}
    </article>
  );
};

export default ArticleView;
