
import React from "react";
import { Bookmark, BookmarkCheck, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useFavoritesStore } from "@/store/favoritesStore";
import { useCommentsStore } from "@/store/commentsStore";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";
import { CommentsDialog } from "@/components/comments/CommentsDialog";

interface ArticleCardProps {
  id: string;
  title: string;
  number?: string;
  content: string;
  hasAudioComment?: boolean;
  isPlaying?: boolean;
  onAudioToggle?: () => void;
  codeId?: string;
}

export const ArticleCard = ({
  id,
  title,
  number,
  content,
  hasAudioComment = false,
  isPlaying = false,
  onAudioToggle,
  codeId
}: ArticleCardProps) => {
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const { getCommentCount } = useCommentsStore();
  const [showComments, setShowComments] = useState(false);
  const articleIsFavorite = isFavorite(id);
  const commentCount = getCommentCount(id);

  const handleToggleFavorite = () => {
    toggleFavorite(id, number);
  };

  // Split content by line breaks to respect original formatting
  const contentLines = content.split('\n').filter(line => line.trim() !== '');
  
  // Create link to article in its code
  const articleLink = codeId ? `/codigos/${codeId}?article=${id}` : null;

  return (
    <TooltipProvider>
      <motion.article 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="legal-article bg-background-dark p-4 rounded-md border border-gray-800 mb-6 transition-all hover:border-gray-700 relative hover:shadow-lg"
      >
        {/* Top section with favorite and comment icons */}
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
            {/* Comments Icon */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-blue-400 hover:bg-blue-950/20 flex-shrink-0 transition-all duration-200 hover:scale-110" 
                  onClick={() => setShowComments(true)}
                  aria-label="Ver comentários"
                >
                  <div className="relative">
                    <MessageCircle className="h-5 w-5" />
                    {commentCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                        {commentCount > 9 ? '9+' : commentCount}
                      </span>
                    )}
                  </div>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {commentCount > 0 ? `${commentCount} comentário${commentCount !== 1 ? 's' : ''}` : 'Comentar'}
              </TooltipContent>
            </Tooltip>
            
            {/* Favorite Icon */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-law-accent hover:bg-background-dark flex-shrink-0 transition-all duration-200 hover:scale-110" 
                  onClick={handleToggleFavorite} 
                  aria-label={articleIsFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                >
                  {articleIsFavorite ? 
                    <BookmarkCheck className="h-5 w-5 animate-scale-in" /> : 
                    <Bookmark className="h-5 w-5" />
                  }
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {articleIsFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        <div className={cn("legal-article-content whitespace-pre-line mb-3", !number && "text-center bg-red-500/10 p-3 rounded")}>
          {contentLines.map((line, index) => (
            <p key={index} className="mb-2.5 leading-relaxed">{line}</p>
          ))}
        </div>

        {articleLink && (
          <div className="mt-4 text-right">
            <Link 
              to={articleLink} 
              className="text-xs text-law-accent hover:underline inline-flex items-center gap-1 transition-all hover:text-law-accent/80"
            >
              Ver artigo completo
            </Link>
          </div>
        )}
      </motion.article>

      {/* Comments Dialog */}
      <CommentsDialog
        open={showComments}
        onOpenChange={setShowComments}
        articleId={id}
        articleNumber={number}
      />
    </TooltipProvider>
  );
};

export default ArticleCard;
