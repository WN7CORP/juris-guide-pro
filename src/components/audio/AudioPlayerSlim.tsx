
import { useState, useEffect } from "react";
import { Volume, VolumeX, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAudio } from "@/contexts/AudioContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface AudioPlayerSlimProps {
  articleId: string;
  audioUrl: string;
  showLoadingIndicator?: boolean;
  showPlayingText?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "ghost";
  className?: string;
}

const AudioPlayerSlim = ({
  articleId,
  audioUrl,
  showLoadingIndicator = true,
  showPlayingText = false,
  size = "md",
  variant = "ghost",
  className = ""
}: AudioPlayerSlimProps) => {
  const { 
    currentPlayingArticleId, 
    isPlaying, 
    playAudio, 
    pauseAudio 
  } = useAudio();
  
  const [isLoading, setIsLoading] = useState(false);
  const isThisPlaying = currentPlayingArticleId === articleId && isPlaying;

  // If articleId changes and it's the one currently playing, update loading state
  useEffect(() => {
    if (currentPlayingArticleId === articleId) {
      setIsLoading(false);
    }
  }, [currentPlayingArticleId, articleId]);

  // Check if audio URL is valid
  const hasAudio = !!audioUrl && audioUrl.trim() !== '';

  const handleTogglePlay = async () => {
    if (!hasAudio) {
      toast.info("Comentário em áudio não disponível");
      return;
    }

    try {
      setIsLoading(true);

      if (isThisPlaying) {
        pauseAudio();
      } else {
        await playAudio(articleId, audioUrl);
      }
    } catch (error) {
      console.error("Error toggling audio:", error);
      toast.error("Erro ao reproduzir áudio");
    } finally {
      setIsLoading(false);
    }
  };

  // Size mappings
  const sizeClasses = {
    sm: "h-6 w-6 p-1",
    md: "h-8 w-8 p-1.5",
    lg: "h-10 w-10 p-2"
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5"
  };

  // Variant mappings
  const variantClasses = {
    primary: "bg-law-accent text-white hover:bg-law-accent/80",
    ghost: "text-law-accent hover:bg-law-accent/10"
  };

  return (
    <div className="inline-flex items-center gap-1">
      <Button
        type="button"
        variant="ghost"
        className={cn(
          "rounded-full flex-shrink-0 p-0",
          variantClasses[variant],
          sizeClasses[size],
          isThisPlaying && "bg-law-accent/20",
          !hasAudio && "opacity-50 cursor-not-allowed",
          className
        )}
        onClick={handleTogglePlay}
        disabled={isLoading || !hasAudio}
        title={hasAudio ? "Reproduzir comentário em áudio" : "Comentário em áudio não disponível"}
      >
        {isLoading && showLoadingIndicator ? (
          <Loader2 className={cn("animate-spin", iconSizes[size])} />
        ) : isThisPlaying ? (
          <VolumeX className={iconSizes[size]} />
        ) : (
          <Volume className={iconSizes[size]} />
        )}
      </Button>

      {showPlayingText && isThisPlaying && (
        <span className="text-xs text-law-accent animate-pulse">Reproduzindo</span>
      )}
    </div>
  );
};

export default AudioPlayerSlim;
