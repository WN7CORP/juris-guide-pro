
import React from 'react';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { BookOpen, Bookmark, Volume } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useFavoritesStore } from '@/store/favoritesStore';
import { Link } from 'react-router-dom';

interface Article {
  id: string;
  number?: string;
  title?: string;
  content: string;
  explanation?: string;
  formalExplanation?: string;
  practicalExample?: string;
  comentario_audio?: string;
}

interface ArticleCardProps {
  article: Article;
  codeId: string;
  codeName: string;
  onClick?: () => void;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, codeId, codeName, onClick }) => {
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const articleIsFavorite = isFavorite(article.id);

  const hasAudio = !!article.comentario_audio;
  const hasExplanation = !!article.explanation || !!article.formalExplanation;
  const hasExample = !!article.practicalExample;

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(article.id, article.number);
  };

  // Truncate content for card preview
  const truncatedContent = article.content.length > 120
    ? `${article.content.substring(0, 120)}...`
    : article.content;

  // Format URL for the article link
  const articleUrl = `/codigo/${codeId}/artigo/${article.id}`;

  return (
    <TooltipProvider>
      <motion.div
        whileHover={{ scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 400, damping: 10 }}
      >
        <Link to={articleUrl} onClick={onClick}>
          <Card className="border border-gray-800 bg-netflix-dark hover:bg-gray-900/50 hover:border-gray-700 transition-all duration-200 h-full">
            <div className="p-4 flex flex-col h-full">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-law-accent" />
                  <h3 className="font-serif font-bold text-law-accent">
                    {article.number ? `Art. ${article.number}` : article.title || 'Artigo'}
                  </h3>
                </div>
                
                <div className="flex gap-1">
                  {hasAudio && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="w-6 h-6 rounded-full bg-law-accent/10 flex items-center justify-center">
                          <Volume className="h-3.5 w-3.5 text-law-accent" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        Possui comentário em áudio
                      </TooltipContent>
                    </Tooltip>
                  )}
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`p-0 h-6 w-6 rounded-full ${articleIsFavorite ? 'text-amber-500' : 'text-gray-400 hover:text-amber-500'}`}
                        onClick={handleToggleFavorite}
                      >
                        <Bookmark className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {articleIsFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
              
              <div className="text-sm text-gray-300 line-clamp-3 mb-3 flex-grow">
                {truncatedContent}
              </div>
              
              <div className="mt-auto pt-2 border-t border-gray-800/50">
                <div className="flex gap-2 items-center text-xs text-gray-400">
                  {codeName && (
                    <span className="bg-gray-800/70 px-2 py-1 rounded-full">
                      {codeName}
                    </span>
                  )}
                  
                  <div className="flex gap-1 ml-auto">
                    {hasExplanation && (
                      <div className="bg-law-accent/20 text-law-accent px-2 py-1 rounded-full">
                        Explicação
                      </div>
                    )}
                    {hasExample && (
                      <div className="bg-amber-900/20 text-amber-400 px-2 py-1 rounded-full">
                        Exemplo
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </Link>
      </motion.div>
    </TooltipProvider>
  );
};

export default ArticleCard;
