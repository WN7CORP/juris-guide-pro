
import { useState } from "react";
import { Filter, TrendingUp, Clock, Calendar, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CommentItem } from "./CommentItem";
import { Comment, SortOption } from "@/hooks/useComments";
import { User } from "@supabase/supabase-js";

interface CommentFeedProps {
  comments: Comment[];
  loading: boolean;
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
  onToggleLike: (commentId: string) => void;
  onToggleRecommendation: (commentId: string) => void;
  user: User | null;
}

const sortOptions = [
  { 
    value: 'most_liked' as SortOption, 
    label: 'Mais Curtidos', 
    icon: TrendingUp,
    description: 'Comentários com mais curtidas primeiro'
  },
  { 
    value: 'recent' as SortOption, 
    label: 'Mais Recentes', 
    icon: Clock,
    description: 'Comentários mais novos primeiro'
  },
  { 
    value: 'oldest' as SortOption, 
    label: 'Mais Antigos', 
    icon: Calendar,
    description: 'Comentários mais antigos primeiro'
  },
];

const tagOptions = [
  { value: 'all', label: 'Todas', emoji: '🌟', count: 0 },
  { value: 'dica', label: 'Dicas', emoji: '💡', count: 0 },
  { value: 'duvida', label: 'Dúvidas', emoji: '❓', count: 0 },
  { value: 'observacao', label: 'Observações', emoji: '👁️', count: 0 },
  { value: 'correcao', label: 'Correções', emoji: '✏️', count: 0 },
];

export const CommentFeed = ({ 
  comments, 
  loading, 
  sortBy, 
  setSortBy, 
  onToggleLike, 
  onToggleRecommendation,
  user 
}: CommentFeedProps) => {
  const [filterTag, setFilterTag] = useState<string>('all');

  // Calculate tag counts
  const updatedTagOptions = tagOptions.map(option => ({
    ...option,
    count: option.value === 'all' 
      ? comments.length 
      : comments.filter(comment => comment.tag === option.value).length
  }));

  const filteredComments = comments.filter(comment => {
    if (filterTag === 'all') return true;
    return comment.tag === filterTag;
  });

  const currentSortOption = sortOptions.find(option => option.value === sortBy);
  const recommendedComments = filteredComments.filter(comment => comment.is_recommended);

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="bg-gray-800/40 border-gray-700/50 animate-pulse">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="w-14 h-14 bg-gray-600/50 rounded-full"></div>
                <div className="flex-1 space-y-4">
                  <div className="flex gap-3">
                    <div className="h-4 bg-gray-600/50 rounded w-24"></div>
                    <div className="h-6 bg-gray-600/50 rounded-full w-16"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-600/50 rounded w-full"></div>
                    <div className="h-4 bg-gray-600/50 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-600/50 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header do feed com filtros */}
      <Card className="bg-gradient-to-r from-gray-800/40 to-gray-800/20 border-gray-700/50 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Sparkles className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h3 className="font-bold text-white text-xl">Feed de Comentários</h3>
                <p className="text-gray-400">
                  {filteredComments.length} comentários • {recommendedComments.length} recomendados
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Filtro por tag */}
              <div className="flex-1">
                <div className="flex flex-wrap gap-2">
                  {updatedTagOptions.map(option => (
                    <Button
                      key={option.value}
                      variant={filterTag === option.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilterTag(option.value)}
                      className={`transition-all hover:scale-105 ${
                        filterTag === option.value 
                          ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg" 
                          : "hover:bg-gray-700/50 border-gray-600"
                      }`}
                    >
                      <span className="mr-1">{option.emoji}</span>
                      {option.label}
                      <Badge variant="secondary" className="ml-2 bg-gray-600/50 text-xs">
                        {option.count}
                      </Badge>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Ordenação */}
              <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                <SelectTrigger className="w-[200px] bg-gray-700/80 border-gray-600 backdrop-blur-sm">
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      {currentSortOption?.icon && <currentSortOption.icon className="h-4 w-4" />}
                      <span>{currentSortOption?.label}</span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 backdrop-blur-lg">
                  {sortOptions.map(option => (
                    <SelectItem key={option.value} value={option.value} className="text-white focus:bg-gray-700 py-3">
                      <div className="flex items-center gap-3">
                        <option.icon className="h-4 w-4" />
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-xs text-gray-400">{option.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Lista de comentários */}
      {filteredComments.length === 0 ? (
        <Card className="bg-gray-800/20 border-gray-700/30 backdrop-blur-sm">
          <CardContent className="p-16 text-center">
            <div className="space-y-6">
              <div className="w-24 h-24 mx-auto bg-gray-700/30 rounded-full flex items-center justify-center">
                <div className="text-6xl">💬</div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {filterTag === 'all' 
                    ? 'Nenhum comentário ainda'
                    : `Nenhum comentário de ${tagOptions.find(t => t.value === filterTag)?.label?.toLowerCase()}`
                  }
                </h3>
                <p className="text-gray-400 max-w-md mx-auto">
                  {filterTag === 'all' 
                    ? 'Seja o primeiro a compartilhar seu conhecimento e iniciar a discussão!'
                    : 'Tente outro filtro ou seja o primeiro a comentar nesta categoria.'
                  }
                </p>
              </div>
              {filterTag !== 'all' && (
                <Button 
                  variant="outline" 
                  onClick={() => setFilterTag('all')}
                  className="border-gray-600 hover:bg-gray-700/50"
                >
                  Ver todos os comentários
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredComments.map((comment, index) => (
            <div 
              key={comment.id} 
              className="animate-fade-in group" 
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CommentItem
                comment={comment}
                onToggleLike={onToggleLike}
                onToggleRecommendation={onToggleRecommendation}
                showActions={!!user}
              />
              {index < filteredComments.length - 1 && (
                <Separator className="bg-gray-700/30 my-4" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
