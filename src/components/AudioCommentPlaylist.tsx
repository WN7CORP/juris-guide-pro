import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { LegalArticle } from "@/services/legalCodeService";
import AudioPlayer from "@/components/audio/AudioPlayer";
import EmptyAudioList from "@/components/audio/EmptyAudioList";
import AudioErrorMessage from "@/components/audio/AudioErrorMessage";
import { useAudioPlayback } from "@/hooks/useAudioPlayback";
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
    currentPlaying,
    isPlaying,
    progress,
    audioError,
    playAudio,
    pauseAudio
  } = useAudioPlayback();

  // Filter out articles without audio comments
  const articlesWithAudio = articles.filter(article => article.comentario_audio && article.comentario_audio.trim() !== '');

  // Log for debugging
  useEffect(() => {
    console.log(`AudioCommentPlaylist received ${articles.length} articles`);
    console.log(`Found ${articlesWithAudio.length} articles with valid audio comments`);
    if (articlesWithAudio.length === 0 && articles.length > 0) {
      console.warn("No articles with audio comments found despite receiving articles");
    }
  }, [articles, articlesWithAudio.length]);

  // Set up automatic play for current article if specified
  useEffect(() => {
    if (currentArticleId && !currentPlaying) {
      const article = articlesWithAudio.find(a => a.id?.toString() === currentArticleId);
      if (article && article.comentario_audio) {
        console.log(`Auto-playing article ${currentArticleId} with audio: ${article.comentario_audio}`);
        playAudio(currentArticleId, article.comentario_audio);
      } else if (article) {
        console.error(`Article ${currentArticleId} found but has no audio comment`);
      } else {
        console.error(`Article ${currentArticleId} not found in articlesWithAudio list`);
      }
    }
  }, [currentArticleId, articlesWithAudio, currentPlaying, playAudio]);
  if (articlesWithAudio.length === 0) {
    return <EmptyAudioList />;
  }
  return <Card className="p-4 mb-6 bg-background-dark border border-gray-800 animate-fade-in py-[38px]">
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
        {articlesWithAudio.map(article => <AudioPlayer key={article.id} articleId={article.id?.toString() || ''} audioUrl={article.comentario_audio || ''} title={`Art. ${article.numero}`} subtitle={article.artigo.substring(0, 60) + '...'} isCurrentPlaying={currentPlaying === article.id} onPlay={playAudio} onPause={pauseAudio} progress={currentPlaying === article.id ? progress : 0} />)}
      </div>
    </Card>;
};
export default AudioCommentPlaylist;