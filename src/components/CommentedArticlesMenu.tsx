
import React, { useState, useEffect } from "react";
import { Volume, Play, Pause, Download } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LegalArticle } from "@/services/legalCodeService";
import { globalAudioState } from "@/components/AudioCommentPlaylist";
import { toast } from "sonner";

interface CommentedArticlesMenuProps {
  articles: LegalArticle[];
  codeId: string;
}

const CommentedArticlesMenu: React.FC<CommentedArticlesMenuProps> = ({ 
  articles, 
  codeId 
}) => {
  const [playingArticleId, setPlayingArticleId] = useState<string | null>(null);
  const articlesWithAudio = articles.filter(article => article.comentario_audio);
  
  // Check global audio state to update UI
  useEffect(() => {
    const checkInterval = setInterval(() => {
      if (globalAudioState.currentAudioId) {
        setPlayingArticleId(globalAudioState.currentAudioId);
      } else {
        setPlayingArticleId(null);
      }
    }, 500);
    
    return () => clearInterval(checkInterval);
  }, []);
  
  // Handle audio playback
  const toggleAudioPlay = (articleId: string, audioUrl?: string) => {
    if (!audioUrl) return;
    
    // If this article is already playing, pause it
    if (playingArticleId === articleId) {
      globalAudioState.stopCurrentAudio();
      setPlayingArticleId(null);
      return;
    }
    
    // Stop any currently playing audio
    globalAudioState.stopCurrentAudio();
    
    // Create and play a new audio element
    const audioElement = new Audio(audioUrl);
    audioElement.addEventListener('ended', () => setPlayingArticleId(null));
    audioElement.addEventListener('error', (e) => {
      console.error("Audio error:", e);
      setPlayingArticleId(null);
      toast.error("Erro ao reproduzir áudio");
    });
    
    audioElement.play()
      .then(() => {
        setPlayingArticleId(articleId);
        // Update global audio state
        globalAudioState.audioElement = audioElement;
        globalAudioState.currentAudioId = articleId;
        globalAudioState.isPlaying = true;
        // Set minimal player info
        globalAudioState.minimalPlayerInfo = {
          articleId,
          articleNumber: articles.find(a => a.id?.toString() === articleId)?.numero || "Sem número",
          codeId,
          audioUrl
        };
      })
      .catch(error => {
        console.error("Failed to play audio:", error);
        toast.error("Erro ao reproduzir áudio");
        setPlayingArticleId(null);
      });
  };
  
  const handleDownloadAudio = (e: React.MouseEvent, articleId: string, audioUrl?: string, articleNumber?: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!audioUrl) return;
    
    // Abrir o áudio em uma nova aba para download
    window.open(audioUrl, '_blank');
    toast.success("Download do comentário em áudio iniciado");
  };
  
  if (articlesWithAudio.length === 0) {
    return (
      <div className="text-gray-500 text-center py-4">
        Não há comentários em áudio disponíveis para este código.
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-2">
        <h3 className="font-medium text-law-accent flex items-center gap-2 mb-3">
          <Volume className="h-4 w-4" />
          Artigos com Comentário ({articlesWithAudio.length})
        </h3>
        
        <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
          {articlesWithAudio.map((article) => (
            <div 
              key={article.id} 
              className="flex items-center justify-between p-2 rounded-md bg-gray-800/30 hover:bg-gray-800/70 border border-gray-700"
            >
              <Link 
                to={`/codigos/${codeId}?article=${article.id}`}
                className="text-sm hover:text-law-accent transition-colors"
              >
                Art. {article.numero || "Sem número"}
              </Link>
              
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0"
                      onClick={(e) => {
                        e.preventDefault();
                        handleDownloadAudio(e, article.id?.toString() || "", article.comentario_audio, article.numero);
                      }}
                    >
                      <Download className="h-4 w-4" />
                      <span className="sr-only">Baixar comentário</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Baixar comentário</TooltipContent>
                </Tooltip>
              
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0"
                      onClick={(e) => {
                        e.preventDefault();
                        toggleAudioPlay(article.id?.toString() || "", article.comentario_audio);
                      }}
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
            </div>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default CommentedArticlesMenu;
