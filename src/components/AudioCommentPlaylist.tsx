
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { LegalArticle } from "@/services/legalCodeService";
import AudioPlayer from "@/components/audio/AudioPlayer";
import EmptyAudioList from "@/components/audio/EmptyAudioList";
import AudioErrorMessage from "@/components/audio/AudioErrorMessage";
import { useAudio } from "@/contexts/AudioContext"; 

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
    articlesWithAudio.forEach(article => {
      console.log(`Article ${article.numero} has audio: ${article.comentario_audio}`);
    });
    
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
    return <EmptyAudioList />;
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
      
      <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar py-[20px]">
        {articlesWithAudio.map(article => (
          <AudioPlayer 
            key={article.id} 
            articleId={article.id?.toString() || ''} 
            audioUrl={article.comentario_audio || ''} 
            title={`Art. ${article.numero}`} 
            subtitle={article.artigo.substring(0, 60) + '...'} 
          />
        ))}
      </div>
    </Card>
  );
};

export default AudioCommentPlaylist;
