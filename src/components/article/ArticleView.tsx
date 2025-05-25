
import { useState, useEffect } from "react";
import { ArticleCard } from "./ArticleCard";
import { ArticleFooter } from "./ArticleFooter";
import { ArticleExplanations } from "./ArticleExplanations";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { globalAudioState } from "@/components/AudioCommentPlaylist";
import { useFontSize } from "@/hooks/useFontSize";
import { useEngagement } from "@/hooks/useEngagement";
import { toast } from "sonner";

interface ArticleViewProps {
  article: {
    id: string;
    number?: string;
    content: string;
    explanation?: string;
    formalExplanation?: string;
    practicalExample?: string;
    comentario_audio?: string;
  };
}

export const ArticleView = ({ article }: ArticleViewProps) => {
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showFormal, setShowFormal] = useState(false);
  const [showExample, setShowExample] = useState(false);
  const [explanationType, setExplanationType] = useState<"explanation" | "formal" | "example">("explanation");
  const { fontSize } = useFontSize();
  const { trackArticleRead } = useEngagement();

  // Track article reading
  useEffect(() => {
    const timer = setTimeout(() => {
      trackArticleRead();
    }, 3000); // Track after 3 seconds of viewing

    return () => clearTimeout(timer);
  }, [trackArticleRead]);

  const hasExplanations = !!(article.explanation || article.formalExplanation || article.practicalExample);
  const hasNumber = !!article.number;

  const toggleAudioComment = () => {
    if (!article.comentario_audio) {
      toast.error("Este artigo não possui comentário de áudio");
      return;
    }

    // Check if this audio is already playing
    if (globalAudioState.currentAudioId === article.id) {
      // Toggle play/pause
      if (globalAudioState.audioElement) {
        if (globalAudioState.audioElement.paused) {
          globalAudioState.audioElement.play();
          setIsAudioPlaying(true);
          globalAudioState.isPlaying = true;
        } else {
          globalAudioState.audioElement.pause();
          setIsAudioPlaying(false);
          globalAudioState.isPlaying = false;
        }
      }
    } else {
      // Stop current audio and play new one
      if (globalAudioState.audioElement) {
        globalAudioState.audioElement.pause();
        globalAudioState.audioElement.currentTime = 0;
      }

      const audio = new Audio(article.comentario_audio);
      audio.addEventListener('loadstart', () => {
        toast.success("Carregando comentário de áudio...");
      });
      
      audio.addEventListener('canplaythrough', () => {
        audio.play().then(() => {
          setIsAudioPlaying(true);
          globalAudioState.isPlaying = true;
          globalAudioState.currentAudioId = article.id;
          globalAudioState.audioElement = audio;
          
          // Set minimal player info
          globalAudioState.minimalPlayerInfo = {
            codeId: '', // Will be set by parent component
            articleId: article.id,
            articleNumber: article.number || ''
          };
          
          toast.success("Reproduzindo comentário de áudio");
        }).catch(error => {
          console.error('Audio play error:', error);
          toast.error("Erro ao reproduzir áudio");
        });
      });

      audio.addEventListener('ended', () => {
        setIsAudioPlaying(false);
        globalAudioState.isPlaying = false;
        globalAudioState.currentAudioId = null;
        globalAudioState.audioElement = null;
        globalAudioState.minimalPlayerInfo = null;
      });

      audio.addEventListener('error', (e) => {
        console.error('Audio error:', e);
        toast.error("Erro ao carregar áudio");
        setIsAudioPlaying(false);
      });

      audio.load();
    }
  };

  const openExplanation = (type: "explanation" | "formal" | "example") => {
    setExplanationType(type);
    if (type === "explanation") setShowExplanation(true);
    else if (type === "formal") setShowFormal(true);
    else if (type === "example") setShowExample(true);
  };

  const closeExplanations = () => {
    setShowExplanation(false);
    setShowFormal(false);
    setShowExample(false);
  };

  return (
    <div className="space-y-4" style={{ fontSize: `${fontSize}px` }}>
      <ArticleCard
        content={article.content}
        number={article.number}
        hasAudio={!!article.comentario_audio}
        isAudioPlaying={isAudioPlaying}
      />
      
      <ArticleFooter
        id={article.id}
        hasAudioComment={!!article.comentario_audio}
        isPlaying={isAudioPlaying}
        onToggleAudio={toggleAudioComment}
        hasExplanations={hasExplanations}
        hasNumber={hasNumber}
        articleNumber={article.number}
        hasExplanation={!!article.explanation}
        hasFormalExplanation={!!article.formalExplanation}
        hasPracticalExample={!!article.practicalExample}
        onOpenExplanation={() => openExplanation("explanation")}
        onOpenFormal={() => openExplanation("formal")}
        onOpenExample={() => openExplanation("example")}
      />

      {/* Explanation Dialogs */}
      <Dialog open={showExplanation} onOpenChange={setShowExplanation}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-netflix-dark border border-gray-800">
          <ArticleExplanations
            explanation={article.explanation}
            formalExplanation={article.formalExplanation}
            practicalExample={article.practicalExample}
            type="explanation"
            onClose={closeExplanations}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showFormal} onOpenChange={setShowFormal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-netflix-dark border border-gray-800">
          <ArticleExplanations
            explanation={article.explanation}
            formalExplanation={article.formalExplanation}
            practicalExample={article.practicalExample}
            type="formal"
            onClose={closeExplanations}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showExample} onOpenChange={setShowExample}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-netflix-dark border border-gray-800">
          <ArticleExplanations
            explanation={article.explanation}
            formalExplanation={article.formalExplanation}
            practicalExample={article.practicalExample}
            type="example"
            onClose={closeExplanations}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ArticleView;
