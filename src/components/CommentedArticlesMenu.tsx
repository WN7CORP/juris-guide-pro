
import { useState, useEffect } from "react";
import { Volume, X, AlertCircle, Play, Pause } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LegalArticle } from "@/services/legalCodeService";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface CommentedArticlesMenuProps {
  articles: LegalArticle[];
  title: string;
  onClose?: () => void;
  currentArticleId?: string;
  autoOpen?: boolean;
}

export const CommentedArticlesMenu = ({ 
  articles, 
  title, 
  onClose,
  currentArticleId,
  autoOpen = false
}: CommentedArticlesMenuProps) => {
  const [isOpen, setIsOpen] = useState(autoOpen);
  const [filteredArticles, setFilteredArticles] = useState<LegalArticle[]>([]);
  const [searchParams] = useSearchParams();
  const articleParam = searchParams.get('article');
  const [playingArticleId, setPlayingArticleId] = useState<string | null>(null);

  useEffect(() => {
    // Filter out any articles that don't actually have audio comments
    const articlesWithAudio = articles.filter(
      article => article.comentario_audio && article.comentario_audio.trim() !== ''
    );
    
    setFilteredArticles(articlesWithAudio);
    
    if (articlesWithAudio.length === 0 && articles.length > 0) {
      console.warn('Articles were provided but none had valid audio comments');
    }
  }, [articles]);

  // Set isOpen when autoOpen prop changes
  useEffect(() => {
    setIsOpen(autoOpen);
  }, [autoOpen]);

  // Listen for global nowPlaying events
  useEffect(() => {
    const handleNowPlaying = (e: CustomEvent) => {
      const detail = e.detail as { articleId: string };
      setPlayingArticleId(detail.articleId);
    };
    
    const handleAudioEnded = (e: CustomEvent) => {
      const detail = e.detail as { articleId: string };
      if (playingArticleId === detail.articleId) {
        setPlayingArticleId(null);
      }
    };
    
    // Use type assertion for the event listeners
    document.addEventListener('nowPlaying', handleNowPlaying as EventListener);
    document.addEventListener('audioEnded', handleAudioEnded as EventListener);
    
    return () => {
      document.removeEventListener('nowPlaying', handleNowPlaying as EventListener);
      document.removeEventListener('audioEnded', handleAudioEnded as EventListener);
    };
  }, [playingArticleId]);

  if (filteredArticles.length === 0) {
    return null;
  }

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleClose = () => {
    setIsOpen(false);
    if (onClose) onClose();
  };

  const tableName = title.split(' ')[0]; // Extract first word as table name
  const formattedTitle = tableName.charAt(0).toUpperCase() + tableName.slice(1);

  return (
    <>
      {/* Floating trigger button */}
      <Button
        onClick={toggleMenu}
        className={cn(
          "fixed right-4 top-20 z-20 rounded-full p-3 shadow-lg md:right-8 transition-all",
          isOpen 
            ? "bg-gray-700 hover:bg-gray-600" 
            : "bg-gradient-to-r from-netflix-red to-red-700 hover:from-netflix-red hover:to-red-600 animate-pulse-soft"
        )}
        aria-label="Ver artigos comentados"
      >
        <Volume className="h-5 w-5" />
        <span className="absolute inline-flex h-5 w-5 rounded-full bg-white text-[10px] font-bold text-gray-900 items-center justify-center -top-1 -right-1">
          {filteredArticles.length}
        </span>
        <span className="sr-only">Ver artigos comentados</span>
      </Button>

      {/* Slide-in menu */}
      <div 
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-80 max-w-[80vw] bg-gradient-to-b from-gray-900 to-black border-l border-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-gray-800 flex items-center justify-between">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Volume className="h-5 w-5 text-netflix-red" />
              <span>Artigos Comentados</span>
              <span className="text-xs bg-netflix-red/20 text-netflix-red px-1.5 py-0.5 rounded-full">
                {filteredArticles.length}
              </span>
            </h3>
            <Button 
              variant="ghost" 
              size="sm" 
              className="rounded-full p-1 h-auto w-auto hover:bg-gray-800" 
              onClick={handleClose}
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Fechar</span>
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-400 mb-2">{formattedTitle}</h4>
              <div className="space-y-2">
                {filteredArticles.map((article) => {
                  const isCurrentArticle = article.id?.toString() === articleParam;
                  const isPlaying = article.id?.toString() === playingArticleId;
                  
                  return (
                    <Link
                      key={article.id}
                      to={`?article=${article.id}`}
                      onClick={handleClose}
                      className={cn(
                        "flex items-center p-3 rounded-md border transition-all group relative overflow-hidden",
                        isCurrentArticle
                          ? "bg-netflix-red/10 border-netflix-red"
                          : isPlaying
                            ? "bg-netflix-red/5 border-netflix-red/50 animate-pulse-soft"
                            : "bg-gray-900/50 border-gray-800 hover:border-gray-700"
                      )}
                    >
                      <div className={cn(
                        "mr-3 p-2 rounded-full text-netflix-red",
                        isCurrentArticle ? "bg-netflix-red/20" : 
                        isPlaying ? "bg-netflix-red/20 animate-glow" : "bg-netflix-red/10"
                      )}>
                        {isPlaying ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h5 className={cn(
                          "font-medium text-sm group-hover:text-netflix-red transition-colors",
                          isCurrentArticle || isPlaying ? "text-netflix-red" : "text-white"
                        )}>
                          {article.numero ? `Art. ${article.numero}` : 'Artigo'}
                        </h5>
                        <p className="text-xs text-gray-400 line-clamp-1">{article.artigo}</p>
                      </div>

                      {isPlaying && (
                        <div className="audio-wave absolute right-2 flex items-end h-4 gap-[2px]">
                          <span className="w-[2px] h-2 bg-netflix-red rounded-full animate-pulse"></span>
                          <span className="w-[2px] h-3 bg-netflix-red rounded-full animate-pulse" style={{animationDelay: "0.1s"}}></span>
                          <span className="w-[2px] h-1 bg-netflix-red rounded-full animate-pulse" style={{animationDelay: "0.2s"}}></span>
                          <span className="w-[2px] h-2 bg-netflix-red rounded-full animate-pulse" style={{animationDelay: "0.15s"}}></span>
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
          
          <div className="p-4 border-t border-gray-800">
            <p className="text-xs text-gray-500 text-center">
              Encontre todos os artigos comentados em áudio
            </p>
          </div>
        </div>
      </div>
      
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={handleClose}
          aria-hidden="true"
        />
      )}
    </>
  );
};

export default CommentedArticlesMenu;
