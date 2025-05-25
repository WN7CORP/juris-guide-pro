
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Award, User, MoreHorizontal, Reply, Share } from 'lucide-react';
import { Comment } from '@/hooks/useComments';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface CommentItemProps {
  comment: Comment;
  onToggleLike: (commentId: string) => void;
  onToggleRecommendation: (commentId: string) => void;
  onReply?: (commentId: string, parentComment: Comment) => void;
  showActions?: boolean;
  isReply?: boolean;
}

const tagStyles = {
  dica: { color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40', emoji: '💡', bgGradient: 'from-emerald-500/10 to-green-500/5' },
  duvida: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/40', emoji: '❓', bgGradient: 'from-blue-500/10 to-cyan-500/5' },
  observacao: { color: 'bg-amber-500/20 text-amber-400 border-amber-500/40', emoji: '👁️', bgGradient: 'from-amber-500/10 to-yellow-500/5' },
  correcao: { color: 'bg-red-500/20 text-red-400 border-red-500/40', emoji: '✏️', bgGradient: 'from-red-500/10 to-pink-500/5' },
};

const tagLabels = {
  dica: 'Dica',
  duvida: 'Dúvida',
  observacao: 'Observação',
  correcao: 'Correção',
};

export const CommentItem = ({ 
  comment, 
  onToggleLike, 
  onToggleRecommendation, 
  onReply,
  showActions = true,
  isReply = false
}: CommentItemProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return diffInMinutes < 1 ? 'agora' : `${diffInMinutes}min`;
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
      "bg-gray-800/40 border-gray-700/50 transition-all duration-300 hover:bg-gray-800/60 hover:border-gray-600/60 hover:shadow-xl backdrop-blur-sm",
      comment.is_recommended && "ring-2 ring-amber-500/30 bg-gradient-to-br from-amber-900/10 to-yellow-900/5 shadow-amber-500/10 shadow-lg",
      isReply && "ml-8 border-l-4 border-blue-500/30"
    )}>
      <CardContent className="p-6">
        {/* Header do comentário */}
        <div className="flex items-start gap-4 mb-5">
          <div className="relative">
            <Avatar className={cn(
              "ring-2 ring-gray-600/50 shadow-lg transition-all duration-200 hover:ring-blue-500/50",
              isReply ? "w-10 h-10" : "w-14 h-14"
            )}>
              <AvatarImage src={comment.user_profiles?.avatar_url} alt={comment.user_profiles?.username} />
              <AvatarFallback className="bg-gradient-to-br from-gray-600 to-gray-700 text-white font-semibold">
                {comment.user_profiles?.username?.slice(0, 2).toUpperCase() || <User className="w-6 h-6" />}
              </AvatarFallback>
            </Avatar>
            {comment.is_recommended && !isReply && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center shadow-lg">
                <Award className="w-3 h-3 text-white fill-current" />
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <span className="font-semibold text-white text-base hover:text-blue-400 transition-colors cursor-pointer">
                {comment.user_profiles?.username}
              </span>
              
              <Badge variant="outline" className={cn("text-xs font-medium border transition-all hover:scale-105", tagStyle.color)}>
                <span className="mr-1.5 text-sm">{tagStyle.emoji}</span>
                {tagLabels[comment.tag]}
              </Badge>
              
              {comment.is_recommended && (
                <div className="flex items-center gap-1.5 text-amber-400 bg-amber-500/10 px-2 py-1 rounded-full">
                  <Award className="w-3.5 h-3.5 fill-current" />
                  <span className="text-xs font-semibold">Recomendado</span>
                </div>
              )}
              
              <span className="text-sm text-gray-500 ml-auto">
                {formatDate(comment.created_at)}
              </span>
            </div>
            
            {/* Conteúdo do comentário */}
            <div className="prose prose-invert prose-sm max-w-none mb-4">
              <p className="text-gray-200 leading-relaxed whitespace-pre-wrap text-base">
                {comment.content}
              </p>
            </div>
          </div>
          
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-gray-700/50 shrink-0 opacity-0 group-hover:opacity-100 transition-all">
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        </div>
        
        {/* Ações do comentário */}
        {showActions && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "flex items-center gap-2.5 px-4 py-2 rounded-full transition-all hover:scale-105 group",
                  comment.user_liked 
                    ? "text-red-400 bg-red-500/15 hover:bg-red-500/25 shadow-red-500/20 shadow-md" 
                    : "text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                )}
                onClick={() => onToggleLike(comment.id)}
              >
                <Heart className={cn("w-4 h-4 transition-transform group-hover:scale-110", comment.user_liked && "fill-current")} />
                <span className="text-sm font-semibold">{comment.likes_count}</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "flex items-center gap-2.5 px-4 py-2 rounded-full transition-all hover:scale-105 group",
                  comment.is_recommended 
                    ? "text-amber-400 bg-amber-500/15 hover:bg-amber-500/25 shadow-amber-500/20 shadow-md" 
                    : "text-gray-400 hover:text-amber-400 hover:bg-amber-500/10"
                )}
                onClick={() => onToggleRecommendation(comment.id)}
              >
                <Award className={cn("w-4 h-4 transition-transform group-hover:scale-110", comment.is_recommended && "fill-current")} />
                <span className="text-sm font-semibold">
                  {comment.is_recommended ? 'Recomendado' : 'Recomendar'}
                </span>
              </Button>

              {onReply && !isReply && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2.5 px-4 py-2 rounded-full text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all hover:scale-105 group"
                  onClick={() => onReply(comment.id, comment)}
                >
                  <Reply className="w-4 h-4 transition-transform group-hover:scale-110" />
                  <span className="text-sm font-semibold">Responder</span>
                </Button>
              )}

              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2.5 px-4 py-2 rounded-full text-gray-400 hover:text-green-400 hover:bg-green-500/10 transition-all hover:scale-105 group"
              >
                <Share className="w-4 h-4 transition-transform group-hover:scale-110" />
              </Button>
            </div>
            
            <div className="text-xs text-gray-500 bg-gray-700/30 px-2 py-1 rounded-full">
              #{comment.id.slice(-6)}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
