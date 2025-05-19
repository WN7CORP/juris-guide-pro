
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Pause, Volume, VolumeX } from "lucide-react";
import { LegalArticle } from "@/services/legalCodeService";
import { toast } from "sonner";

interface AudioCommentPlaylistProps {
  articles: LegalArticle[];
  title: string;
}

const AudioCommentPlaylist = ({ articles, title }: AudioCommentPlaylistProps) => {
  const [currentPlaying, setCurrentPlaying] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  // Filter out articles without audio comments
  const articlesWithAudio = articles.filter(article => article.comentario_audio);

  const playAudio = (articleId: string, audioUrl: string) => {
    // Stop current audio if playing
    if (audioElement) {
      audioElement.pause();
      audioElement.removeEventListener('ended', handleAudioEnded);
    }

    // Create new audio element
    const newAudio = new Audio(audioUrl);
    setAudioElement(newAudio);
    
    // Set up event listeners
    newAudio.addEventListener('ended', handleAudioEnded);
    newAudio.addEventListener('error', (e) => {
      console.error('Audio error:', e);
      toast.error("Não foi possível reproduzir o áudio");
      setIsPlaying(false);
      setCurrentPlaying(null);
    });
    
    // Play the audio
    newAudio.play().catch((error) => {
      console.error('Error playing audio:', error);
      toast.error("Erro ao reproduzir áudio");
      setIsPlaying(false);
      setCurrentPlaying(null);
    });
    
    // Update state
    setCurrentPlaying(articleId);
    setIsPlaying(true);
  };

  const pauseAudio = () => {
    if (audioElement) {
      audioElement.pause();
    }
    setIsPlaying(false);
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentPlaying(null);
  };

  const togglePlayPause = (article: LegalArticle) => {
    if (!article.id || !article.comentario_audio) return;
    
    const articleId = article.id.toString();
    
    if (currentPlaying === articleId) {
      if (isPlaying) {
        pauseAudio();
      } else {
        if (audioElement) {
          audioElement.play()
            .then(() => setIsPlaying(true))
            .catch(error => {
              console.error('Error resuming audio:', error);
              toast.error("Erro ao retomar áudio");
            });
        }
      }
    } else {
      playAudio(articleId, article.comentario_audio);
    }
  };

  if (articlesWithAudio.length === 0) {
    return (
      <Card className="p-4 mb-6 bg-background-dark border border-gray-800">
        <h3 className="text-lg font-serif font-bold text-law-accent mb-2">
          Artigos Comentados
        </h3>
        <p className="text-gray-400 text-sm">
          Não há comentários em áudio disponíveis para este código legal.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-4 mb-6 bg-background-dark border border-gray-800">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-serif font-bold text-law-accent">
          Artigos Comentados ({articlesWithAudio.length})
        </h3>
        <p className="text-xs text-gray-400">
          Clique em um artigo para ouvir o comentário
        </p>
      </div>
      
      <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
        {articlesWithAudio.map((article) => (
          <div 
            key={article.id}
            className={`flex items-center justify-between p-2 rounded-md ${
              currentPlaying === article.id 
                ? 'bg-law-accent/20 border border-law-accent' 
                : 'bg-gray-800/30 hover:bg-gray-800/50 border border-gray-700'
            } transition-colors cursor-pointer`}
            onClick={() => togglePlayPause(article)}
          >
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 rounded-full p-0 text-law-accent"
              >
                {currentPlaying === article.id && isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
              <div>
                <p className="font-medium">Art. {article.numero}</p>
                <p className="text-xs text-gray-400 line-clamp-1">
                  {article.artigo.substring(0, 60)}...
                </p>
              </div>
            </div>
            <div className="flex-shrink-0">
              {currentPlaying === article.id ? (
                isPlaying ? (
                  <Volume className="h-4 w-4 text-law-accent" />
                ) : (
                  <VolumeX className="h-4 w-4 text-gray-400" />
                )
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default AudioCommentPlaylist;
