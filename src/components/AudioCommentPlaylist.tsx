
import React, { useState, useEffect } from "react";
import { Volume, Play, Pause, VolumeX } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LegalArticle } from "@/services/legalCodeService";
import { legalCodes } from "@/data/legalCodes";

interface AudioCommentPlaylistProps {
  articlesMap: Record<string, LegalArticle[]>;
}

const AudioCommentPlaylist: React.FC<AudioCommentPlaylistProps> = ({ articlesMap }) => {
  const [playingArticleId, setPlayingArticleId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  // Format time in MM:SS format
  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Handle audio playback
  const toggleAudioPlay = (articleId: string, audioUrl?: string) => {
    if (!audioUrl) return;
    
    const audioElements = document.querySelectorAll('audio');
    
    // If this article is already playing, pause it
    if (playingArticleId === articleId) {
      audioElements.forEach(audio => {
        if (audio.src.includes(audioUrl)) {
          audio.pause();
        }
      });
      setPlayingArticleId(null);
      return;
    }
    
    // Pause any currently playing audio
    audioElements.forEach(audio => {
      audio.pause();
    });
    
    // Create and play a new audio element
    const audioElement = new Audio(audioUrl);
    audioElement.addEventListener('ended', () => setPlayingArticleId(null));
    audioElement.addEventListener('error', (e) => {
      console.error("Audio error:", e);
      setPlayingArticleId(null);
    });
    
    // Track audio progress
    audioElement.addEventListener('timeupdate', () => {
      setCurrentTime(audioElement.currentTime);
    });
    
    audioElement.addEventListener('loadedmetadata', () => {
      setDuration(audioElement.duration);
    });
    
    audioElement.play()
      .then(() => {
        setPlayingArticleId(articleId);
      })
      .catch(error => {
        console.error("Failed to play audio:", error);
        setPlayingArticleId(null);
      });
  };
  
  // Find the code name based on ID
  const getCodeTitle = (codeId: string): string => {
    const code = legalCodes.find(c => c.id === codeId);
    return code ? code.title : "Código Desconhecido";
  };
  
  // Count total articles with audio
  const totalAudioArticles = Object.values(articlesMap).reduce(
    (total, articles) => total + articles.length, 0
  );

  if (totalAudioArticles === 0) {
    return (
      <div className="text-center py-10">
        <VolumeX className="h-10 w-10 mx-auto text-gray-500 mb-4" />
        <p className="text-gray-400">Não há comentários em áudio disponíveis.</p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-8">
        {Object.entries(articlesMap).map(([codeId, articles]) => {
          if (articles.length === 0) return null;
          
          return (
            <Card key={codeId} className="p-4 bg-background-dark border-gray-800">
              <h3 className="text-lg font-serif font-medium text-law-accent mb-4">
                {getCodeTitle(codeId)} ({articles.length})
              </h3>
              
              <div className="space-y-3">
                {articles.map((article) => (
                  <div 
                    key={article.id} 
                    className={`flex items-center justify-between p-3 rounded-md transition-all ${
                      playingArticleId === article.id?.toString() 
                        ? "bg-law-accent/20 border border-law-accent/30" 
                        : "bg-gray-800/30 hover:bg-gray-800/70 border border-gray-700"
                    }`}
                  >
                    <div className="flex-1">
                      <Link 
                        to={`/codigos/${codeId}?article=${article.id}`}
                        className="text-sm hover:text-law-accent font-medium transition-colors block"
                      >
                        Art. {article.numero || "Sem número"}
                      </Link>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                        {article.artigo?.substring(0, 100)}...
                      </p>
                      
                      {playingArticleId === article.id?.toString() && (
                        <div className="mt-2">
                          <div className="h-1 bg-gray-700 rounded-full w-full">
                            <div 
                              className="h-1 bg-law-accent rounded-full" 
                              style={{ width: `${(currentTime / duration) * 100}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-gray-400 mt-1">
                            <span>{formatTime(currentTime)}</span>
                            <span>{formatTime(duration)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          className={`h-8 w-8 p-0 ${
                            playingArticleId === article.id?.toString() 
                              ? "text-law-accent" 
                              : ""
                          }`}
                          onClick={() => toggleAudioPlay(article.id?.toString() || "", article.comentario_audio)}
                        >
                          {playingArticleId === article.id?.toString() ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                          <span className="sr-only">
                            {playingArticleId === article.id?.toString() 
                              ? "Pausar comentário" 
                              : "Ouvir comentário"}
                          </span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {playingArticleId === article.id?.toString() 
                          ? "Pausar comentário" 
                          : "Ouvir comentário"}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </TooltipProvider>
  );
};

export default AudioCommentPlaylist;
