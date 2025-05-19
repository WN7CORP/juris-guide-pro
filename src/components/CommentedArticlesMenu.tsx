
import { useState, useEffect } from "react";
import { Volume, X, AlertCircle, Info } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LegalArticle } from "@/services/legalCodeService";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
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

  useEffect(() => {
    // In our new implementation, we just set filteredArticles to the articles passed in
    // since we're not filtering by audio comments anymore
    setFilteredArticles(articles.slice(0, 20)); // Just show first 20 articles for performance
    
  }, [articles]);

  // Set open when autoOpen prop changes
  useEffect(() => {
    setOpen(autoOpen);
  }, [autoOpen]);

  if (filteredArticles.length === 0) {
    return null;
  }

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen && onClose) onClose();
  };

  const tableName = title.split(' ')[0]; // Extract first word as table name
  const formattedTitle = tableName.charAt(0).toUpperCase() + tableName.slice(1);

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          className="gap-1 flex items-center text-law-accent"
          aria-label="Ver artigos comentados"
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
                  
                  return (
                    <SheetClose asChild key={article.id}>
                      <Link
                        to={`?article=${article.id}`}
                        className={cn(
                          "flex items-center p-3 rounded-md border transition-all group",
                          isCurrentArticle
                            ? "bg-law-accent/10 border-law-accent"
                            : "bg-netflix-dark border-gray-800 hover:border-gray-700"
                        )}
                      >
                        <div className={cn(
                          "mr-3 p-2 rounded-full text-law-accent",
                          isCurrentArticle ? "bg-law-accent/20" : "bg-law-accent/10"
                        )}>
                          <Info className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
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
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 p-4 text-center">
                  <AlertCircle className="h-8 w-8 text-gray-600" />
                  <p className="text-gray-400">Comentários em breve disponíveis</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-800 mt-4">
          <p className="text-xs text-gray-500 text-center">
            Comentários em áudio em breve disponíveis
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CommentedArticlesMenu;
