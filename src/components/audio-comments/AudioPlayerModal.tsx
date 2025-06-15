
import { useState } from "react";
import { X, Book, Headphones, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import { AudioArticle } from "@/pages/AudioComments";

// Import new sub-components
import AudioPlayerTabs from "./AudioPlayerTabs";
import AudioPlayerContent from "./AudioPlayerContent";
import AudioPlayerControls from "./AudioPlayerControls";

interface AudioPlayerModalProps {
  article: AudioArticle;
  onClose: () => void;
}

const AudioPlayerModal = ({ article, onClose }: AudioPlayerModalProps) => {
  const [textSize, setTextSize] = useState(16);
  const [activeSection, setActiveSection] = useState<'text' | 'audio'>('audio');
  const isMobile = useIsMobile();

  const adjustTextSize = (delta: number) => {
    setTextSize(prev => Math.max(12, Math.min(24, prev + delta)));
  };

  return (
    <div className="fixed inset-0 z-50 bg-netflix-bg">
      <div className="h-full flex flex-col">
        {/* Enhanced Header with controls */}
        <div className="flex items-center justify-between p-3 border-b border-gray-700 bg-netflix-dark flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 text-xs px-2 py-1">
              {article.codeTitle}
            </Badge>
            <Badge variant="outline" className="text-netflix-red border-netflix-red/30 text-xs px-2 py-1">
              Art. {article.numero}
            </Badge>
          </div>
          
          {/* Text size controls - only show when on text tab */}
          {activeSection === 'text' && (
            <div className="flex items-center gap-1 mr-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => adjustTextSize(-1)}
                className="text-gray-400 hover:text-white h-6 w-6 p-0"
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="text-xs text-gray-400 min-w-[2rem] text-center">{textSize}px</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => adjustTextSize(1)}
                className="text-gray-400 hover:text-white h-6 w-6 p-0"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-white flex-shrink-0 h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>

        {isMobile ? (
          // Mobile Layout with tabs
          <div className="flex-1 flex flex-col min-h-0">
            <AudioPlayerTabs 
              activeSection={activeSection}
              setActiveSection={setActiveSection}
            />
            
            <AudioPlayerContent
              article={article}
              activeSection={activeSection}
              textSize={textSize}
              isMobile={isMobile}
            />
          </div>
        ) : (
          // Desktop Layout
          <div className="h-full flex gap-4 p-4">
            {/* Article Text */}
            <div className="flex-1 bg-netflix-dark rounded-lg border border-gray-700 overflow-hidden">
              <div className="p-3 border-b border-gray-700 bg-netflix-dark flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Book className="h-4 w-4 text-cyan-400" />
                  Texto do Artigo
                </h3>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => adjustTextSize(-1)}
                    className="text-gray-400 hover:text-white h-6 w-6 p-0"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="text-xs text-gray-400 min-w-[2.5rem] text-center">{textSize}px</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => adjustTextSize(1)}
                    className="text-gray-400 hover:text-white h-6 w-6 p-0"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="p-4 overflow-y-auto max-h-[calc(100vh-200px)]">
                <div 
                  className="text-gray-300 leading-relaxed whitespace-pre-wrap selection:bg-cyan-400/20"
                  style={{ 
                    fontSize: `${textSize}px`,
                    lineHeight: textSize <= 14 ? '1.6' : textSize <= 18 ? '1.7' : '1.8'
                  }}
                >
                  {article.artigo}
                </div>
              </div>
            </div>

            {/* Audio Player */}
            <div className="w-80 bg-netflix-dark rounded-lg border border-gray-700 flex flex-col">
              <div className="p-3 border-b border-gray-700 bg-netflix-dark">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Headphones className="h-4 w-4 text-cyan-400" />
                  Comentário em Áudio
                </h3>
              </div>
              
              <AudioPlayerControls article={article} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioPlayerModal;
