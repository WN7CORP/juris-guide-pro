
import { useState, useEffect } from "react";
import { Volume, X, AlertCircle, Info, Loader2 } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LegalArticle } from "@/services/legalCodeService";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAudio } from "@/contexts/AudioContext";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";

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
  const [open, setOpen] = useState(autoOpen);
  const [filteredArticles, setFilteredArticles] = useState<LegalArticle[]>([]);
  const [searchParams] = useSearchParams();
  const articleParam = searchParams.get('article');
  const { currentPlayingArticleId, isPlaying, playAudio, pauseAudio } = useAudio();
  
  // Track loading state for audio playback
  const [loadingArticle, setLoadingArticle] = useState<string | null>(null);

  useEffect(() => {
    // Filter articles that have audio comments
    const articlesWithAudio = articles.filter(article => 
      article.comentario_audio && article.comentario_audio.trim() !== ''
    );
    
    setFilteredArticles(articlesWithAudio.slice(0, 20)); // Just show first 20 articles for performance
    
    // Log the articles with audio for debugging
    console.log(`Found ${articlesWithAudio.length} articles with audio in ${title}`);
    articlesWithAudio.forEach(article => {
      console.log(`Article ${article.numero} has audio: ${article.comentario_audio}`);
    });
    
  }, [articles, title]);

  // Set open when autoOpen prop changes
  useEffect(() => {
    setOpen(autoOpen);
  }, [autoOpen]);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen && onClose) onClose();
  };

  const tableName = title.split(' ')[0]; // Extract first word as table name
  const formattedTitle = tableName.charAt(0).toUpperCase() + tableName.slice(1);

  // Handle play/pause audio for a specific article
  const toggleArticleAudio = async (articleId: string, audioUrl: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    try {
      setLoadingArticle(articleId);
      
      if (currentPlayingArticleId === articleId) {
        if (isPlaying) {
          pauseAudio();
        } else {
          await playAudio(articleId, audioUrl);
        }
      } else {
        await playAudio(articleId, audioUrl);
      }
    } catch (error) {
      console.error("Error toggling audio:", error);
      toast.error("Erro ao reproduzir áudio");
    } finally {
      setLoadingArticle(null);
    }
  };

  // If no articles with audio, show feedback but still render the trigger button
  const hasAudioArticles = filteredArticles.length > 0;

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          className="gap-1 flex items-center text-law-accent"
          aria-label="Ver artigos comentados"
          onClick={() => {
            if (!hasAudioArticles) {
              toast.info("Comentários em áudio em breve disponíveis", {
                duration: 3000,
              });
            }
          }}
        >
          <Volume className="h-5 w-5" />
          <span>Artigos Comentados</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="bg-netflix-bg border-gray-800 text-white w-80 pt-10">
        <SheetHeader className="pb-3 border-b border-gray-800">
          <SheetTitle className="text-white flex items-center gap-2">
            <Volume className="h-5 w-5 text-law-accent" />
            <span>Artigos Comentados</span>
            <span className="text-xs bg-law-accent/20 text-law-accent px-1.5 py-0.5 rounded-full">
              {filteredArticles.length}
            </span>
          </SheetTitle>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 mt-4 max-h-[calc(100vh-150px)]">
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-400 mb-2">{formattedTitle}</h4>
            <div className="space-y-2">
              {filteredArticles.length > 0 ? (
                filteredArticles.map((article) => {
                  const isCurrentArticle = article.id?.toString() === articleParam;
                  const isPlaying = currentPlayingArticleId === article.id && isPlaying;
                  const isLoading = loadingArticle === article.id;
                  
                  return (
                    <div
                      key={article.id}
                      className={cn(
                        "flex items-center p-3 rounded-md border transition-all group",
                        isCurrentArticle
                          ? "bg-law-accent/10 border-law-accent"
                          : "bg-netflix-dark border-gray-800 hover:border-gray-700"
                      )}
                    >
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className={cn(
                          "mr-3 p-2 rounded-full text-law-accent",
                          isCurrentArticle ? "bg-law-accent/20" : "bg-law-accent/10"
                        )}
                        onClick={(e) => toggleArticleAudio(article.id!.toString(), article.comentario_audio!, e)}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : isPlaying ? (
                          <Volume className="h-4 w-4 animate-pulse" />
                        ) : (
                          <Volume className="h-4 w-4" />
                        )}
                      </Button>
                      
                      <SheetClose asChild>
                        <Link
                          to={`?article=${article.id}`}
                          className="flex-1"
                        >
                          <div>
                            <h5 className={cn(
                              "font-medium text-sm group-hover:text-law-accent transition-colors",
                              isCurrentArticle ? "text-law-accent" : "text-white"
                            )}>
                              {article.numero ? `Art. ${article.numero}` : 'Artigo'}
                            </h5>
                            <p className="text-xs text-gray-400 line-clamp-1">{article.artigo}</p>
                          </div>
                        </Link>
                      </SheetClose>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 p-4 text-center">
                  <AlertCircle className="h-8 w-8 text-gray-600" />
                  <p className="text-gray-400">Comentários em áudio não disponíveis</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-800 mt-4">
          <p className="text-xs text-gray-500 text-center">
            Clique no ícone de áudio para ouvir o comentário
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CommentedArticlesMenu;
