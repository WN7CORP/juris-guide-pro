
import { useState, useRef } from "react";
import { Bookmark, BookmarkCheck, Info, BookText, BookOpen, X, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFavoritesStore } from "@/store/favoritesStore";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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
  
  // State for modal dialogs
  const [activeDialog, setActiveDialog] = useState<string | null>(null);
  
  // State for audio playback
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const toggleFavorite = () => {
    if (articleIsFavorite) {
      removeFavorite(article.id);
    } else {
      addFavorite(article.id);
    }
  };

  // Split content by line breaks to respect original formatting
  const contentLines = article.content.split('\n').filter(line => line.trim() !== '');

  // Check if we have any explanations available
  const hasExplanations = article.explanation || article.formalExplanation || article.practicalExample;
  
  // Check if article has audio commentary
  const hasAudioComment = !!article.comentario_audio;

  // Check if article has number to determine text alignment
  const hasNumber = !!article.number;

  const toggleAudioPlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(error => {
        console.error("Error playing audio:", error);
        toast.error("Não foi possível reproduzir o áudio");
      });
    }
  };

  const handleAudioPlay = () => {
    setIsPlaying(true);
  };

  const handleAudioPause = () => {
    setIsPlaying(false);
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const handleAudioError = () => {
    setIsPlaying(false);
    toast.error("Não foi possível reproduzir o áudio do comentário");
  };

  // Function to handle audio or dialog
  const handleCommentAudio = () => {
    // If audio exists, play it
    if (hasAudioComment) {
      toggleAudioPlay();
    }
  };

  const renderDialog = () => {
    if (!activeDialog) return null;
    
    let title = '';
    let content = '';
    let IconComponent = Info;
    
    switch(activeDialog) {
      case 'explanation':
        title = 'Explicação Técnica';
        content = article.explanation || '';
        IconComponent = Info;
        break;
      case 'formal':
        title = 'Explicação Formal';
        content = article.formalExplanation || '';
        IconComponent = BookText;
        break;
      case 'example':
        title = 'Exemplo Prático';
        content = article.practicalExample || '';
        IconComponent = BookOpen;
        break;
    }
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-lg bg-background-dark border border-gray-700 shadow-xl animate-in slide-in-from-bottom-10 duration-300">
          <div className="sticky top-0 bg-background-dark border-b border-gray-700 px-4 py-3 flex items-center justify-between z-10">
            <div className="flex items-center gap-2 text-law-accent">
              <IconComponent className="h-5 w-5" />
              <h3 className="font-medium text-lg">{title}</h3>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setActiveDialog(null)}
              className="rounded-full p-1 h-auto w-auto hover:bg-gray-800"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Fechar</span>
            </Button>
          </div>
          <div className="p-4 text-sm text-gray-300 space-y-3">
            {content.split('\n').map((paragraph, i) => (
              <p key={i} className="leading-relaxed">{paragraph}</p>
            ))}
          </div>
        </div>
      </div>
    );
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
        <audio 
          ref={audioRef}
          src={article.comentario_audio}
          onPlay={handleAudioPlay}
          onPause={handleAudioPause}
          onEnded={handleAudioEnded}
          onError={handleAudioError}
          preload="metadata"
        />
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

      <div className="flex flex-wrap gap-2 mt-4 justify-end">
        {hasExplanations && hasNumber && (
          <>
            {article.explanation && (
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs flex gap-1 h-7 px-2.5 rounded-full bg-gray-800/60 border-gray-700 hover:bg-gray-700"
                onClick={() => setActiveDialog('explanation')}
              >
                <Info className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Técnica</span>
                <span className="sm:hidden">Técnica</span>
              </Button>
            )}

            {article.formalExplanation && (
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs flex gap-1 h-7 px-2.5 rounded-full bg-gray-800/60 border-gray-700 hover:bg-gray-700"
                onClick={() => setActiveDialog('formal')}
              >
                <BookText className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Formal</span>
                <span className="sm:hidden">Formal</span>
              </Button>
            )}

            {article.practicalExample && (
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs flex gap-1 h-7 px-2.5 rounded-full bg-gray-800/60 border-gray-700 hover:bg-gray-700"
                onClick={() => setActiveDialog('example')}
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Exemplo</span>
                <span className="sm:hidden">Exemplo</span>
              </Button>
            )}

            {hasAudioComment && (
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs flex gap-1 h-7 px-2.5 rounded-full bg-gray-800/60 border-gray-700 hover:bg-gray-700"
                onClick={toggleAudioPlay}
              >
                <Headphones className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Comentário</span>
                <span className="sm:hidden">Comentário</span>
              </Button>
            )}
          </>
        )}
      </div>
      
      {renderDialog()}
    </article>
  );
};

export default ArticleView;
