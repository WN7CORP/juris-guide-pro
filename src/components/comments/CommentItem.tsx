
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Award, User } from 'lucide-react';
import { Comment } from '@/hooks/useComments';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface CommentItemProps {
  comment: Comment;
  onToggleLike: (commentId: string) => void;
  onToggleRecommendation: (commentId: string) => void;
}

const tagColors = {
  dica: 'bg-green-500/20 text-green-400 border-green-500/30',
  duvida: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  observacao: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  correcao: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const tagLabels = {
  dica: 'Dica',
  duvida: 'Dúvida',
  observacao: 'Observação',
  correcao: 'Correção',
};

export const CommentItem = ({ comment, onToggleLike, onToggleRecommendation }: CommentItemProps) => {
  const { user } = useAuth();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return 'agora mesmo';
    } else if (diffInHours < 24) {
      return `${diffInHours}h atrás`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) {
        return `${diffInDays}d atrás`;
      } else {
        return date.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      }
    }
  };

  return (
    <div className={cn(
      "border rounded-lg p-4 space-y-3 transition-colors",
      comment.is_recommended 
        ? "border-yellow-500/30 bg-yellow-500/5" 
        : "border-gray-700 bg-gray-800/50"
    )}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src={comment.user_profiles?.avatar_url} alt={comment.user_profiles?.username} />
            <AvatarFallback>
              <User className="w-4 h-4" />
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm">{comment.user_profiles?.username}</span>
              <Badge variant="outline" className={cn("text-xs", tagColors[comment.tag])}>
                {tagLabels[comment.tag]}
              </Badge>
              {comment.is_recommended && (
                <Award className="w-4 h-4 text-yellow-500" />
              )}
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">{comment.content}</p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">
          {formatDate(comment.created_at)}
        </span>
        
        <div className="flex items-center gap-2">
          {user && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 px-2 text-xs",
                  comment.user_liked ? "text-red-400" : "text-gray-400"
                )}
                onClick={() => onToggleLike(comment.id)}
              >
                <Heart className={cn("w-3 h-3 mr-1", comment.user_liked && "fill-current")} />
                {comment.likes_count}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 px-2 text-xs",
                  comment.is_recommended ? "text-yellow-400" : "text-gray-400"
                )}
                onClick={() => onToggleRecommendation(comment.id)}
              >
                <Award className={cn("w-3 h-3", comment.is_recommended && "fill-current")} />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
