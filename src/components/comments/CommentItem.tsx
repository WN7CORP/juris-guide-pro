
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Award, User, MoreHorizontal } from 'lucide-react';
import { Comment } from '@/hooks/useComments';
import { cn } from '@/lib/utils';

interface CommentItemProps {
  comment: Comment;
  onToggleLike: (commentId: string) => void;
  onToggleRecommendation: (commentId: string) => void;
  showActions?: boolean;
}

const tagStyles = {
  dica: { color: 'bg-green-500/20 text-green-400 border-green-500/30', emoji: '💡' },
  duvida: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', emoji: '❓' },
  observacao: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', emoji: '👁️' },
  correcao: { color: 'bg-red-500/20 text-red-400 border-red-500/30', emoji: '✏️' },
};

const tagLabels = {
  dica: 'Dica',
  duvida: 'Dúvida',
  observacao: 'Observação',
  correcao: 'Correção',
};

export const CommentItem = ({ comment, onToggleLike, onToggleRecommendation, showActions = true }: CommentItemProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return 'agora mesmo';
    } else if (diffInHours < 24) {
      return `${diffInHours}h`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) {
        return `${diffInDays}d`;
      } else if (diffInDays < 30) {
        const diffInWeeks = Math.floor(diffInDays / 7);
        return `${diffInWeeks}sem`;
      } else {
        return date.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit'
        });
      }
    }
  };

  const tagStyle = tagStyles[comment.tag];

  return (
    <Card className={cn(
      "bg-gray-800/50 border-gray-700 transition-all duration-200 hover:bg-gray-800/70 hover:border-gray-600",
      comment.is_recommended && "ring-1 ring-yellow-500/50 bg-yellow-900/10"
    )}>
      <CardContent className="p-6">
        {/* Header do comentário */}
        <div className="flex items-start gap-4 mb-4">
          <Avatar className="w-12 h-12 ring-2 ring-gray-600">
            <AvatarImage src={comment.user_profiles?.avatar_url} alt={comment.user_profiles?.username} />
            <AvatarFallback className="bg-gray-600">
              <User className="w-6 h-6" />
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <span className="font-semibold text-white">
                {comment.user_profiles?.username}
              </span>
              
              <Badge variant="outline" className={cn("text-xs", tagStyle.color)}>
                <span className="mr-1">{tagStyle.emoji}</span>
                {tagLabels[comment.tag]}
              </Badge>
              
              {comment.is_recommended && (
                <div className="flex items-center gap-1 text-yellow-500">
                  <Award className="w-4 h-4 fill-current" />
                  <span className="text-xs font-medium">Recomendado</span>
                </div>
              )}
              
              <span className="text-sm text-gray-500 ml-auto">
                {formatDate(comment.created_at)}
              </span>
            </div>
            
            {/* Conteúdo do comentário */}
            <div className="prose prose-invert prose-sm max-w-none">
              <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">
                {comment.content}
              </p>
            </div>
          </div>
          
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white shrink-0">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Ações do comentário */}
        {showActions && (
          <div className="flex items-center justify-between pt-3 border-t border-gray-700">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-full transition-all",
                  comment.user_liked 
                    ? "text-red-400 bg-red-500/10 hover:bg-red-500/20" 
                    : "text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                )}
                onClick={() => onToggleLike(comment.id)}
              >
                <Heart className={cn("w-4 h-4", comment.user_liked && "fill-current")} />
                <span className="text-sm font-medium">{comment.likes_count}</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-full transition-all",
                  comment.is_recommended 
                    ? "text-yellow-400 bg-yellow-500/10 hover:bg-yellow-500/20" 
                    : "text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/10"
                )}
                onClick={() => onToggleRecommendation(comment.id)}
              >
                <Award className={cn("w-4 h-4", comment.is_recommended && "fill-current")} />
                <span className="text-sm font-medium">
                  {comment.is_recommended ? 'Recomendado' : 'Recomendar'}
                </span>
              </Button>
            </div>
            
            <div className="text-xs text-gray-500">
              #{comment.id.slice(-6)}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
