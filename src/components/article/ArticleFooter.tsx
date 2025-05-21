
import { Volume, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import AprofundarButton from "@/components/AprofundarButton";
import ArticleAnnotation from "@/components/article/ArticleAnnotation";

interface ArticleFooterProps {
  id: string;
  hasAudioComment: boolean;
  isPlaying: boolean;
  onToggleAudio: () => void;
  hasExplanations: boolean;
  hasNumber: boolean;
  articleNumber?: string;
  hasExplanation: boolean;
  hasFormalExplanation: boolean;
  hasPracticalExample: boolean;
  onOpenExplanation: () => void;
  onOpenFormal: () => void;
  onOpenExample: () => void;
}

export const ArticleFooter = ({
  id,
  hasAudioComment,
  isPlaying,
  onToggleAudio,
  hasExplanations,
  hasNumber,
  articleNumber,
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
        <ArticleAnnotation articleId={id} articleNumber={articleNumber} />
        
        {hasAudioComment && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className={`text-xs flex gap-1 h-7 px-2.5 rounded-full bg-gradient-to-r from-sky-500 to-teal-500 text-white border-none hover:opacity-90 ${isPlaying ? 'from-teal-700 to-sky-700' : ''}`} 
                onClick={onToggleAudio}
              >
                {isPlaying ? <VolumeX className="h-3.5 w-3.5" /> : <Volume className="h-3.5 w-3.5" />}
                <span>Comentário</span>
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
