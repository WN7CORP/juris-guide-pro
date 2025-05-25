
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, Send } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useCommentsStore } from "@/store/commentsStore";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ArticleCommentsProps {
  articleId: string;
  codeId: string;
}

export const ArticleComments = ({ articleId, codeId }: ArticleCommentsProps) => {
  const { user, isAuthenticated } = useAuthStore();
  const { comments, loading, fetchComments, addComment, likeComment } = useCommentsStore();
  const [newComment, setNewComment] = useState("");
  const [showComments, setShowComments] = useState(false);

  const articleComments = comments.filter(
    comment => comment.article_id === articleId && comment.code_id === codeId
  );

  useEffect(() => {
    if (showComments) {
      fetchComments(articleId, codeId);
    }
  }, [showComments, articleId, codeId]);

  const handleAddComment = async () => {
    if (!isAuthenticated) {
      toast.error("Você precisa estar logado para comentar");
      return;
    }

    if (!newComment.trim()) {
      toast.error("Digite um comentário");
      return;
    }

    try {
      await addComment(articleId, codeId, newComment.trim());
      setNewComment("");
      toast.success("Comentário adicionado!");
    } catch (error) {
      toast.error("Erro ao adicionar comentário");
    }
  };

  const handleLikeComment = async (commentId: string) => {
    if (!isAuthenticated) {
      toast.error("Você precisa estar logado para curtir");
      return;
    }

    try {
      await likeComment(commentId);
    } catch (error) {
      toast.error("Erro ao curtir comentário");
    }
  };

  return (
    <Card className="bg-netflix-dark border-gray-800 mt-6">
      <CardHeader>
        <CardTitle 
          className="flex items-center gap-2 text-law-accent cursor-pointer"
          onClick={() => setShowComments(!showComments)}
        >
          <MessageCircle className="h-5 w-5" />
          Comentários ({articleComments.length})
        </CardTitle>
      </CardHeader>
      
      {showComments && (
        <CardContent className="space-y-4">
          {/* Add Comment Form */}
          {isAuthenticated ? (
            <div className="space-y-3">
              <Textarea
                placeholder="Adicione um comentário..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="bg-netflix-bg border-gray-700 min-h-[80px]"
              />
              <div className="flex justify-end">
                <Button 
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  className="bg-law-accent hover:bg-law-accent/80"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Comentar
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 border-b border-gray-800">
              <p className="text-gray-400 mb-2">Faça login para comentar</p>
              <Button 
                size="sm" 
                className="bg-law-accent hover:bg-law-accent/80"
                onClick={() => window.location.href = '/auth'}
              >
                Fazer Login
              </Button>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-4">
                <p className="text-gray-400">Carregando comentários...</p>
              </div>
            ) : articleComments.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 text-gray-600 mx-auto mb-2" />
                <p className="text-gray-400">Ainda não há comentários</p>
                <p className="text-gray-500 text-sm">Seja o primeiro a comentar!</p>
              </div>
            ) : (
              articleComments.map(comment => (
                <div key={comment.id} className="flex gap-3 p-3 rounded-lg bg-netflix-bg/30">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.author.avatar_url} />
                    <AvatarFallback className="bg-law-accent/20 text-law-accent text-xs">
                      {comment.author.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-white text-sm">{comment.author.name}</h4>
                      <span className="text-xs text-gray-400">
                        {formatDistanceToNow(new Date(comment.created_at), { 
                          locale: ptBR, 
                          addSuffix: true 
                        })}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm mb-2 whitespace-pre-wrap">{comment.content}</p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLikeComment(comment.id)}
                        className={`gap-1 h-7 px-2 text-xs ${comment.isLiked ? 'text-red-500' : 'text-gray-400'}`}
                      >
                        <Heart className={`h-3 w-3 ${comment.isLiked ? 'fill-current' : ''}`} />
                        {comment.likes_count}
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default ArticleComments;
