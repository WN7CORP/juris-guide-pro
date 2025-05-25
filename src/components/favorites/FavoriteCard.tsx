
import React from 'react';
import { motion } from 'framer-motion';
import { Bookmark, Volume, FileText, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useFavoritesStore } from '@/store/favoritesStore';
import { getLegalCodeIcon } from '@/utils/formatters';

interface FavoriteCardProps {
  article: any;
  codeTitle: string;
  codeId: string;
  category: string;
  onNavigate: () => void;
}

export const FavoriteCard: React.FC<FavoriteCardProps> = ({
  article,
  codeTitle,
  codeId,
  category,
  onNavigate
}) => {
  const { toggleFavorite } = useFavoritesStore();

  const getCategoryColor = (category: string) => {
    const colors = {
      códigos: 'bg-blue-900/20 border-blue-500/30 text-blue-400',
      estatutos: 'bg-amber-900/20 border-amber-500/30 text-amber-400',
      constituição: 'bg-yellow-900/20 border-yellow-500/30 text-yellow-400',
      leis: 'bg-green-900/20 border-green-500/30 text-green-400'
    };
    return colors[category as keyof typeof colors] || colors.leis;
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="bg-netflix-dark border-gray-700 hover:border-gray-600 transition-all duration-200 h-full">
        <CardContent className="p-4 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2 flex-1">
              {getLegalCodeIcon(codeId, 'h-5 w-5')}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white text-sm truncate">
                  {article.numero ? `Art. ${article.numero}` : 'Artigo'}
                </h3>
                <p className="text-xs text-gray-400 truncate">{codeTitle}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-1 ml-2">
              {article.comentario_audio && (
                <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                  <Volume className="h-3 w-3" />
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(article.id, article.numero);
                }}
                className="h-8 w-8 p-0 text-amber-500 hover:text-amber-400"
              >
                <Bookmark className="h-4 w-4 fill-current" />
              </Button>
            </div>
          </div>

          {/* Category Badge */}
          <div className="mb-3">
            <Badge 
              variant="outline" 
              className={`text-xs ${getCategoryColor(category)} border`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Badge>
          </div>

          {/* Content */}
          <div className="flex-1 mb-4">
            <p className="text-sm text-gray-300 leading-relaxed">
              {truncateText(article.artigo, 150)}
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-700">
            <div className="flex gap-2">
              {article.tecnica && (
                <Badge variant="secondary" className="text-xs">
                  <FileText className="h-3 w-3 mr-1" />
                  Técnica
                </Badge>
              )}
              {article.exemplo && (
                <Badge variant="secondary" className="text-xs">
                  📝 Exemplo
                </Badge>
              )}
            </div>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={onNavigate}
              className="text-law-accent hover:text-law-accent/80 text-xs"
            >
              Ver artigo
              <ExternalLink className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
