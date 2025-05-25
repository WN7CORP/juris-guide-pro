
import React from 'react';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { BookOpen, Bookmark, Volume } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useFavoritesStore } from '@/store/favoritesStore';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface ArticleCardProps {
  content: string;
  number?: string;
  title?: string;
  hasAudio?: boolean;
  isAudioPlaying?: boolean;
  onClick?: () => void;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ 
  content, 
  number, 
  title, 
  hasAudio = false, 
  isAudioPlaying = false, 
  onClick 
}) => {
  // Split content by line breaks to respect original formatting
  const contentLines = content.split('\n').filter(line => line.trim() !== '');

  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        onClick={onClick}
      >
        <Card className="border border-gray-800 bg-netflix-dark hover:bg-gray-900/50 hover:border-gray-700 transition-all duration-200">
          <div className="p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-law-accent" />
                <h3 className="font-serif font-bold text-law-accent">
                  {number ? `Art. ${number}` : title || 'Artigo'}
                </h3>
              </div>
              
              {hasAudio && (
                <div className="flex gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center",
                        isAudioPlaying ? "bg-law-accent text-white" : "bg-law-accent/10"
                      )}>
                        <Volume className="h-3.5 w-3.5 text-law-accent" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      {isAudioPlaying ? "Reproduzindo áudio" : "Possui comentário em áudio"}
                    </TooltipContent>
                  </Tooltip>
                </div>
              )}
            </div>
            
            <div className={cn("legal-article-content whitespace-pre-line mb-3", !number && "text-center bg-red-500/10 p-3 rounded")}>
              {contentLines.map((line, index) => (
                <p key={index} className="mb-2.5 leading-relaxed">{line}</p>
              ))}
            </div>
          </div>
        </Card>
      </motion.div>
    </TooltipProvider>
  );
};

export default ArticleCard;
