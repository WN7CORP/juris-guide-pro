
import { useState } from "react";
import { Bookmark, BookmarkCheck, Copy, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFavoritesStore } from "@/store/favoritesStore";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { MinimalCommentSystem } from "@/components/comments/MinimalCommentSystem";

interface ArticleHeaderProps {
  id: string;
  number?: string;
  title?: string;
  content: string;
  hasAudioComment: boolean;
  isPlaying: boolean;
  onToggleAudio: () => void;
}

export const ArticleHeader = ({
  id,
  number,
  title,
  content,
  hasAudioComment,
  isPlaying,
  onToggleAudio
}: ArticleHeaderProps) => {
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const articleIsFavorite = isFavorite(id);
  const [showComments, setShowComments] = useState(false);

  const handleToggleFavorite = () => {
    toggleFavorite(id, number);
  };
  
  const copyToClipboard = (text: string) => {
    try {
      navigator.clipboard.writeText(text)
        .then(() => {
          toast.success("Texto copiado para área de transferência");
        })
        .catch((err) => {
          console.error("Erro ao copiar: ", err);
          fallbackCopyTextToClipboard(text);
        });
    } catch (error) {
      console.error("Erro ao copiar texto: ", error);
      toast.error("Não foi possível copiar o texto");
    }
  };
  
  const fallbackCopyTextToClipboard = (text: string) => {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);
      
      if (successful) {
        toast.success("Texto copiado para área de transferência");
      } else {
        toast.error("Não foi possível copiar o texto");
      }
    } catch (err) {
      toast.error("Não foi possível copiar o texto");
    }
  };
  
  return (
    <TooltipProvider>
      <div className="flex justify-between items-start mb-3 gap-2">
        <div>
          {number && (
            <h3 className="legal-article-number font-serif text-lg font-bold text-law-accent">
              Art. {number}
            </h3>
          )}
          {title && !number && <h4 className="legal-article-title">{title}</h4>}
        </div>
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-blue-400 hover:bg-blue-900/20 flex-shrink-0 transition-all duration-200 hover:scale-110 h-9 w-9 group" 
                onClick={() => setShowComments(true)}
                aria-label="Ver comentários da comunidade"
              >
                <MessageSquare className="h-5 w-5 group-hover:animate-pulse" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Comentários da comunidade
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-purple-400 hover:bg-purple-900/20 flex-shrink-0 transition-all duration-200 hover:scale-110 h-9 w-9" 
                onClick={() => copyToClipboard(content)}
                aria-label="Copiar texto"
              >
                <Copy className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Copiar texto
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-law-accent hover:bg-background-dark flex-shrink-0 transition-all duration-200 hover:scale-110 h-9 w-9" 
                onClick={handleToggleFavorite} 
                aria-label={articleIsFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
              >
                {articleIsFavorite ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {articleIsFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      <MinimalCommentSystem
        open={showComments}
        onOpenChange={setShowComments}
        articleId={id}
        articleNumber={number}
      />
    </TooltipProvider>
  );
};

export default ArticleHeader;
