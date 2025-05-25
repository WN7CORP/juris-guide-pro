
import { useState } from "react";
import { Play, Pause, Download, Clock, Volume } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { LegalArticle } from "@/services/legalCodeService";
import { globalAudioState } from "@/components/AudioCommentPlaylist";

interface AudioCommentCardProps {
  article: LegalArticle;
  codeTitle: string;
  onPlay: () => void;
  onDownload: () => void;
  isPlaying?: boolean;
}

export const AudioCommentCard = ({
  article,
  codeTitle,
  onPlay,
  onDownload,
  isPlaying = false
}: AudioCommentCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className={`cursor-pointer transition-all duration-200 ${
          isPlaying 
            ? 'border-law-accent bg-law-accent/5' 
            : 'border-gray-800 hover:border-gray-700'
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onPlay}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-xs">
                  Art. {article.numero || "S/N"}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {codeTitle}
                </Badge>
                {article.comentario_audio && (
                  <Badge className="text-xs bg-law-accent/20 text-law-accent">
                    <Volume className="h-3 w-3 mr-1" />
                    Áudio
                  </Badge>
                )}
              </div>
              
              <h3 className="font-medium text-white mb-2 line-clamp-2">
                {article.artigo}
              </h3>
              
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  ~2-3min
                </span>
                <span>Comentário jurídico</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 ml-4">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onDownload();
                }}
                title="Baixar áudio"
              >
                <Download className="h-4 w-4" />
              </Button>
              
              <Button
                variant={isPlaying ? "default" : "outline"}
                size="sm"
                className={`h-10 w-10 p-0 rounded-full transition-all duration-200 ${
                  isPlaying ? 'bg-law-accent hover:bg-law-accent/80' : ''
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  onPlay();
                }}
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
          
          {isPlaying && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="border-t border-gray-700 pt-3 mt-3"
            >
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>Reproduzindo...</span>
                <div className="flex items-center gap-1">
                  <div className="h-1 w-1 bg-law-accent rounded-full animate-pulse"></div>
                  <div className="h-1 w-1 bg-law-accent rounded-full animate-pulse delay-100"></div>
                  <div className="h-1 w-1 bg-law-accent rounded-full animate-pulse delay-200"></div>
                </div>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AudioCommentCard;
