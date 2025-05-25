
import React from 'react';
import { Play, Pause, Download, Clock, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface LegalArticle {
  id?: number;
  numero?: number;
  artigo?: string;
  comentario_audio?: string;
}

interface AudioCommentCardProps {
  article: LegalArticle;
  codeTitle: string;
  onPlay: () => void;
  onDownload: () => void;
  isPlaying: boolean;
}

const AudioCommentCard: React.FC<AudioCommentCardProps> = ({
  article,
  codeTitle,
  onPlay,
  onDownload,
  isPlaying
}) => {
  return (
    <TooltipProvider>
      <Card className="border-gray-800 hover:border-gray-700 transition-all duration-200 hover:bg-gray-800/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {/* Play button */}
            <div className="flex-shrink-0">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={isPlaying ? "default" : "outline"}
                    size="sm"
                    onClick={onPlay}
                    className={`h-10 w-10 rounded-full p-0 ${
                      isPlaying 
                        ? 'bg-law-accent hover:bg-law-accent/80 text-white animate-pulse' 
                        : 'hover:bg-law-accent/20 hover:border-law-accent/50'
                    }`}
                  >
                    {isPlaying ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4 ml-0.5" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isPlaying ? 'Pausar áudio' : 'Reproduzir áudio'}
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-law-accent text-lg">
                  {article.numero ? `Art. ${article.numero}` : 'Artigo'}
                </h3>
                <Badge variant="outline" className="text-xs">
                  <BookOpen className="h-3 w-3 mr-1" />
                  {codeTitle}
                </Badge>
              </div>
              
              {/* Sempre mostrar o texto do artigo */}
              <div className="mb-3 p-3 bg-gray-800/30 rounded-md border border-gray-700/50">
                <p className="text-gray-300 leading-relaxed text-sm">
                  {article.artigo || 'Conteúdo do artigo não disponível'}
                </p>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Clock className="h-3 w-3" />
                  <span>Comentário em áudio disponível</span>
                </div>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onDownload}
                      className="text-gray-400 hover:text-white p-1 h-8 w-8"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    Baixar áudio
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default AudioCommentCard;
