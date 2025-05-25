
import { useState } from "react";
import { Filter, TrendingUp, Clock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
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

  const filteredComments = comments.filter(comment => {
    if (filterTag === 'all') return true;
    return comment.tag === filterTag;
  });

  const currentSortOption = sortOptions.find(option => option.value === sortBy);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="bg-gray-800/50 border-gray-700 animate-pulse">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-gray-600 rounded-full"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-gray-600 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-600 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-600 rounded w-1/2"></div>
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
      <Card className="bg-gray-800/30 border-gray-700">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-3">
              <Filter className="h-5 w-5 text-blue-400" />
              <div>
                <h3 className="font-semibold text-white">Feed de Comentários</h3>
                <p className="text-sm text-gray-400">
                  {filteredComments.length} comentários encontrados
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              {/* Filtro por tag */}
              <Select value={filterTag} onValueChange={setFilterTag}>
                <SelectTrigger className="w-[140px] bg-gray-700 border-gray-600">
                  <SelectValue placeholder="Filtrar por" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="all" className="text-white">Todas as tags</SelectItem>
                  <SelectItem value="dica" className="text-white">💡 Dicas</SelectItem>
                  <SelectItem value="duvida" className="text-white">❓ Dúvidas</SelectItem>
                  <SelectItem value="observacao" className="text-white">👁️ Observações</SelectItem>
                  <SelectItem value="correcao" className="text-white">✏️ Correções</SelectItem>
                </SelectContent>
              </Select>

              {/* Ordenação */}
              <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                <SelectTrigger className="w-[160px] bg-gray-700 border-gray-600">
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      {currentSortOption?.icon && <currentSortOption.icon className="h-4 w-4" />}
                      <span>{currentSortOption?.label}</span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {sortOptions.map(option => (
                    <SelectItem key={option.value} value={option.value} className="text-white focus:bg-gray-700">
                      <div className="flex items-center gap-2">
                        <option.icon className="h-4 w-4" />
                        <div>
                          <div>{option.label}</div>
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
        <Card className="bg-gray-800/30 border-gray-700">
          <CardContent className="p-12 text-center">
            <div className="text-gray-400 space-y-3">
              <div className="text-6xl">💬</div>
              <h3 className="text-lg font-medium">Nenhum comentário ainda</h3>
              <p className="text-sm">
                {filterTag === 'all' 
                  ? 'Seja o primeiro a comentar neste artigo!'
                  : 'Nenhum comentário encontrado com este filtro.'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredComments.map((comment, index) => (
            <div key={comment.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
              <CommentItem
                comment={comment}
                onToggleLike={onToggleLike}
                onToggleRecommendation={onToggleRecommendation}
                showActions={!!user}
              />
              {index < filteredComments.length - 1 && (
                <Separator className="bg-gray-700/50 mt-4" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
