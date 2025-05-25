
import { useState } from "react";
import { MessageCircle, Heart, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useFavoritesStore } from "@/store/favoritesStore";
import { useCommentsStore } from "@/store/commentsStore";
import { toast } from "sonner";
import { CommentsDialog } from "@/components/comments/CommentsDialog";

interface ArticleFooterProps {
  id: string;
  hasNumber: boolean;
  articleNumber?: string;
}

const ArticleFooter = ({
  id,
  hasNumber,
  articleNumber
}: ArticleFooterProps) => {
  const { favorites, addFavorite, removeFavorite } = useFavoritesStore();
  const { getCommentCount } = useCommentsStore();
  const isFavorited = favorites.includes(id);
  const [showComments, setShowComments] = useState(false);
  const commentCount = getCommentCount(id);

  const handleFavoriteToggle = () => {
    if (isFavorited) {
      removeFavorite(id);
      toast.success("Removido dos favoritos");
    } else {
      addFavorite(id);
      toast.success("Adicionado aos favoritos");
    }
  };

  return (
    <>
      <div className="mt-4 pt-4 border-t border-gray-800">
        <div className="flex items-center justify-end gap-2">
          {/* Comments Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowComments(true)}
                className="text-xs flex gap-1 h-7 px-2.5 rounded-full bg-blue-950/20 border-blue-700 text-blue-400 hover:bg-blue-900/30"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                <span>{commentCount > 0 ? commentCount : 'Comentar'}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {commentCount > 0 ? `Ver ${commentCount} comentário${commentCount !== 1 ? 's' : ''}` : 'Adicionar comentário'}
            </TooltipContent>
          </Tooltip>

          {/* Favorite Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={isFavorited ? "default" : "outline"}
                size="sm"
                onClick={handleFavoriteToggle}
                className={`text-xs flex gap-1 h-7 px-2.5 rounded-full ${
                  isFavorited 
                    ? 'bg-netflix-red hover:bg-red-700 text-white border-none' 
                    : 'bg-red-950/20 border-red-700 text-red-400 hover:bg-red-900/30'
                }`}
              >
                {isFavorited ? (
                  <BookmarkCheck className="h-3.5 w-3.5" />
                ) : (
                  <Heart className="h-3.5 w-3.5" />
                )}
                <span>{isFavorited ? 'Favoritado' : 'Favoritar'}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isFavorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Comments Dialog */}
      <CommentsDialog
        open={showComments}
        onOpenChange={setShowComments}
        articleId={id}
        articleNumber={articleNumber}
      />
    </>
  );
};

export default ArticleFooter;
