
import { Volume, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import AprofundarButton from "@/components/AprofundarButton";

interface ArticleFooterProps {
  hasAudioComment: boolean;
  isPlaying: boolean;
  onToggleAudio: () => void;
  hasExplanations: boolean;
  hasNumber: boolean;
  hasExplanation: boolean;
  hasFormalExplanation: boolean;
  hasPracticalExample: boolean;
  onOpenExplanation: () => void;
  onOpenFormal: () => void;
  onOpenExample: () => void;
}

export const ArticleFooter = ({
  hasAudioComment,
  isPlaying,
  onToggleAudio,
  hasExplanations,
  hasNumber,
  hasExplanation,
  hasFormalExplanation,
  hasPracticalExample,
  onOpenExplanation,
  onOpenFormal,
  onOpenExample
}: ArticleFooterProps) => {
  return (
    <TooltipProvider>
      <div className="flex flex-wrap gap-2 mt-4 justify-end">
        {hasAudioComment && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className={`text-xs flex gap-1 h-7 px-2.5 rounded-full bg-gray-800/60 border-gray-700 hover:bg-gray-700 ${isPlaying ? 'border-law-accent/50 bg-law-accent/10' : ''}`} 
                onClick={onToggleAudio}
              >
                {isPlaying ? <VolumeX className="h-3.5 w-3.5" /> : <Volume className="h-3.5 w-3.5" />}
                <span>Comentário em Áudio</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isPlaying ? "Pausar comentário de áudio" : "Ouvir comentário de áudio"}
            </TooltipContent>
          </Tooltip>
        )}

        {hasExplanations && hasNumber && (
          <AprofundarButton 
            hasTecnica={hasExplanation}
            hasFormal={hasFormalExplanation}
            hasExemplo={hasPracticalExample}
            onSelectTecnica={onOpenExplanation}
            onSelectFormal={onOpenFormal}
            onSelectExemplo={onOpenExample}
          />
        )}
      </div>
    </TooltipProvider>
  );
};

export default ArticleFooter;
