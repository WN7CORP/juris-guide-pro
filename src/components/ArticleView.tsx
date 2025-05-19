
import { useState, useRef, useEffect } from "react";
import { Bookmark, BookmarkCheck, Info, BookText, BookOpen, X, Volume, VolumeX, Headphones } from "lucide-react";
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
  SelectValue,
} from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

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
  
  // State para controlar o tipo de explicação selecionada
  const [explanationType, setExplanationType] = useState<string | null>(null);
  
  // Abrir/fechar o conteúdo da explicação
  const [isExplanationOpen, setIsExplanationOpen] = useState(false);
  
  // Estado para controlar se o exemplo está visível
  const [isExampleOpen, setIsExampleOpen] = useState(false);
  
  // State para modal dialogs
  const [activeDialog, setActiveDialog] = useState<string | null>(null);
  
  // State para reprodução de áudio
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLoaded, setAudioLoaded] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
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
  const hasExample = !!article.practicalExample;

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

  const handleExplanationTypeChange = (value: string) => {
    setExplanationType(value);
    setIsExplanationOpen(true);
  };

  const getExplanationContent = () => {
    switch(explanationType) {
      case 'tecnica':
        return article.explanation || "Explicação técnica não disponível para este artigo.";
      case 'formal':
        return article.formalExplanation || "Explicação formal não disponível para este artigo.";
      default:
        return "Selecione um tipo de explicação.";
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
                <Headphones className="h-5 w-5" />
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

      {/* Seção de explicações e exemplos com Collapsible */}
      <div className="mt-4 space-y-3">
        {/* Função 1: Comentário em Áudio */}
        {hasAudioComment && (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start text-sm gap-2 h-9 px-3 rounded-md bg-gray-800/60 border-gray-700 hover:bg-gray-700"
            onClick={toggleAudioPlay}
          >
            <Headphones className="h-4 w-4" />
            <span>Comentário em Áudio {isPlaying ? '(Reproduzindo)' : audioLoaded ? '(Pronto)' : '(Carregando...)'}</span>
          </Button>
        )}

        {/* Função 2: Explicação com opções */}
        {hasExplanations && (
          <div className="space-y-2">
            <Select onValueChange={handleExplanationTypeChange} value={explanationType || undefined}>
              <SelectTrigger className="w-full bg-gray-800/60 border-gray-700 hover:bg-gray-700">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  <SelectValue placeholder="Selecione o tipo de explicação" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tecnica">Explicação Técnica</SelectItem>
                <SelectItem value="formal">Explicação Formal</SelectItem>
              </SelectContent>
            </Select>

            {explanationType && (
              <div className="bg-gray-800/40 p-3 rounded-md border border-gray-700 mt-2">
                <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
                  {getExplanationContent().split('\n').map((paragraph, i) => (
                    <p key={i} className="mb-2">{paragraph}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Função 3: Exemplo Prático */}
        {hasExample && (
          <Collapsible 
            open={isExampleOpen} 
            onOpenChange={setIsExampleOpen}
            className="w-full"
          >
            <CollapsibleTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start text-sm gap-2 h-9 px-3 rounded-md bg-gray-800/60 border-gray-700 hover:bg-gray-700"
              >
                <BookOpen className="h-4 w-4" />
                <span>Exemplo Prático {isExampleOpen ? '(Ocultar)' : '(Mostrar)'}</span>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="bg-gray-800/40 p-3 rounded-md border border-gray-700 mt-2">
              <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
                {article.practicalExample?.split('\n').map((paragraph, i) => (
                  <p key={i} className="mb-2">{paragraph}</p>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>
    </article>
  );
};

export default ArticleView;
