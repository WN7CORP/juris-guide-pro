
import { useState, useEffect } from "react";
import { Volume, X, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LegalArticle } from "@/services/legalCodeService";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface CommentedArticlesMenuProps {
  articles: LegalArticle[];
  title: string;
  onClose?: () => void;
  currentArticleId?: string;
}

export const CommentedArticlesMenu = ({ 
  articles, 
  title, 
  onClose,
  currentArticleId 
}: CommentedArticlesMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredArticles, setFilteredArticles] = useState<LegalArticle[]>([]);

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
        className="fixed right-4 top-20 z-20 rounded-full p-3 bg-law-accent hover:bg-law-accent/90 shadow-lg md:right-8 animate-pulse-soft"
        aria-label="Ver artigos comentados"
      >
        <Volume className="h-5 w-5" />
      </Button>

      {/* Slide-in menu */}
      <div 
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-80 max-w-[80vw] bg-netflix-bg border-l border-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-gray-800 flex items-center justify-between">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Volume className="h-5 w-5 text-law-accent" />
              <span>Artigos Comentados</span>
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
                {filteredArticles.map((article) => (
                  <Link
                    key={article.id}
                    to={`/comentados?article=${article.id}&table=${encodeURIComponent(title)}`}
                    onClick={handleClose}
                    className={cn(
                      "flex items-center p-3 rounded-md border transition-all group",
                      article.id === currentArticleId
                        ? "bg-netflix-bg border-law-accent"
                        : "bg-netflix-dark border-gray-800 hover:border-gray-700"
                    )}
                  >
                    <div className="mr-3 p-2 rounded-full bg-law-accent/10 text-law-accent">
                      <Volume className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <h5 className="font-medium text-sm text-white group-hover:text-law-accent transition-colors">
                        {article.numero ? `Art. ${article.numero}` : 'Artigo'}
                      </h5>
                      <p className="text-xs text-gray-400 line-clamp-1">{article.artigo}</p>
                    </div>
                  </Link>
                ))}
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
