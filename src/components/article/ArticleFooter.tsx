
import { Volume, VolumeX, StickyNote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import AprofundarButton from "@/components/AprofundarButton";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import { AnnotationPanel } from "./AnnotationPanel";

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
  const isMobile = useIsMobile();
  const [isAnnotationOpen, setIsAnnotationOpen] = useState(false);

  const handleToggleAnnotation = () => {
    setIsAnnotationOpen(!isAnnotationOpen);
  };

  return (
    <TooltipProvider>
      <div className={`flex items-center gap-2 mt-4 justify-end animate-fade-in`}>
        {/* Botão de Anotação */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs flex gap-1 h-8 px-3 rounded-full bg-purple-600 hover:bg-purple-700 text-white border-purple-600 hover:border-purple-700" 
              onClick={handleToggleAnnotation}
            >
              <StickyNote className="h-3.5 w-3.5" />
              <span>Anotação</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            Adicionar anotação
          </TooltipContent>
        </Tooltip>
        
        {hasAudioComment && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className={`text-xs flex gap-1 h-8 px-3 rounded-full ${isPlaying ? 'bg-teal-500 hover:bg-teal-600 text-white border-teal-500 hover:border-teal-600' : 'bg-teal-500/20 border-teal-500/40 text-teal-400 hover:bg-teal-500/30 hover:border-teal-500/60'}`} 
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

      {/* Annotation Panel - Full screen on mobile, sidebar on desktop */}
      {isAnnotationOpen && (
        <>
          {/* Backdrop for mobile */}
          {isMobile && (
            <div 
              className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
              onClick={() => setIsAnnotationOpen(false)}
            />
          )}
          
          {/* Panel */}
          <div className={`
            fixed z-50 bg-netflix-bg border-l border-gray-700 shadow-2xl
            ${isMobile 
              ? 'inset-0 animate-slide-in-right' 
              : 'top-0 right-0 h-full w-96 animate-slide-in-right'
            }
          `}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800/50">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <StickyNote className="h-5 w-5 text-purple-400" />
                Anotações
                {articleNumber && (
                  <span className="text-sm text-gray-400">
                    - Art. {articleNumber}
                  </span>
                )}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAnnotationOpen(false)}
                className="text-gray-400 hover:text-white hover:bg-gray-700/50 h-8 w-8 p-0"
              >
                <span className="sr-only">Fechar</span>
                ×
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
              <AnnotationPanel 
                articleId={id} 
                articleNumber={articleNumber}
                onClose={() => setIsAnnotationOpen(false)}
              />
            </div>
          </div>
        </>
      )}
    </TooltipProvider>
  );
};

export default ArticleFooter;
