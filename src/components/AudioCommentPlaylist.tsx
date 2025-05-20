
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { LegalArticle } from "@/services/legalCodeService";
import AudioErrorMessage from "@/components/audio/AudioErrorMessage";
import { useAudio } from "@/contexts/AudioContext"; 
import AudioPlayerSlim from "@/components/audio/AudioPlayerSlim";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface AudioCommentPlaylistProps {
  articles: LegalArticle[];
  title: string;
  currentArticleId?: string;
}

const AudioCommentPlaylist = ({
  articles,
  title,
  currentArticleId
}: AudioCommentPlaylistProps) => {
  const {
    currentPlayingArticleId,
    error: audioError,
    playAudio
  } = useAudio();

  const [isLoading, setIsLoading] = useState(false);

  // Filter out articles without audio comments
  const articlesWithAudio = articles.filter(article => 
    article.comentario_audio && article.comentario_audio.trim() !== ''
  );

  // Log the articles with audio for debugging
  useEffect(() => {
    console.log(`AudioCommentPlaylist: Found ${articlesWithAudio.length} articles with audio in ${title}`);
    
    // Set up automatic play for current article if specified
    if (currentArticleId && !currentPlayingArticleId) {
      const article = articlesWithAudio.find(a => a.id?.toString() === currentArticleId);
      if (article && article.comentario_audio) {
        setIsLoading(true);
        console.log(`Auto-playing article ${currentArticleId} with audio: ${article.comentario_audio}`);
        playAudio(currentArticleId, article.comentario_audio)
          .catch(error => {
            console.error("Error auto-playing audio:", error);
          })
          .finally(() => {
            setIsLoading(false);
          });
      }
    }
  }, [currentArticleId, articlesWithAudio, currentPlayingArticleId, playAudio, title]);

  if (articlesWithAudio.length === 0) {
    return (
      <Card className="p-6 mb-6 bg-background-dark border border-gray-800 text-center">
        <h3 className="text-lg font-medium text-gray-300 mb-2">Comentários em Áudio</h3>
        <p className="text-gray-400">
          Não existem artigos comentados disponíveis para este código.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-4 mb-6 bg-background-dark border border-gray-800 animate-fade-in py-[38px]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-serif font-bold text-law-accent">
          Artigos Comentados ({articlesWithAudio.length})
        </h3>
        <p className="text-xs text-gray-400">
          Clique para ouvir o comentário
        </p>
      </div>
      
      <AudioErrorMessage errorMessage={audioError || ""} />
      
      <div className="space-y-2 max-h-[calc(100vh-350px)] overflow-y-auto pr-2 custom-scrollbar py-[20px]">
        {articlesWithAudio.map(article => (
          <div 
            key={article.id} 
            className={cn(
              "flex items-center p-3 rounded-md border transition-colors",
              currentPlayingArticleId === article.id 
                ? "bg-law-accent/10 border-law-accent" 
                : "bg-netflix-dark border-gray-800 hover:border-gray-700"
            )}
          >
            <AudioPlayerSlim 
              articleId={article.id?.toString() || ''} 
              audioUrl={article.comentario_audio || ''}
              size="md"
              showPlayingText
            />
            
            <Link
              to={`?article=${article.id}`}
              className="ml-3 flex-1"
            >
              <div>
                <h5 className={cn(
                  "font-medium text-sm",
                  currentPlayingArticleId === article.id ? "text-law-accent" : "text-white"
                )}>
                  Art. {article.numero}
                </h5>
                <p className="text-xs text-gray-400 line-clamp-1">{article.artigo}</p>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default AudioCommentPlaylist;
