
import { ScrollArea } from "@/components/ui/scroll-area";
import { AudioArticle } from "@/pages/AudioComments";
import AudioPlayerControls from "./AudioPlayerControls";

interface AudioPlayerContentProps {
  article: AudioArticle;
  activeSection: 'text' | 'audio';
  textSize: number;
  isMobile: boolean;
}

const AudioPlayerContent = ({ article, activeSection, textSize, isMobile }: AudioPlayerContentProps) => {
  if (activeSection === 'text') {
    return (
      <div className="flex-1 min-h-0 bg-netflix-dark">
        <ScrollArea className="flex-1 h-full">
          <div className="p-4">
            <div 
              className="text-gray-200 leading-relaxed whitespace-pre-wrap selection:bg-cyan-400/20"
              style={{ 
                fontSize: `${textSize}px`,
                lineHeight: textSize <= 14 ? '1.6' : textSize <= 18 ? '1.7' : '1.8'
              }}
            >
              {article.artigo}
            </div>
          </div>
        </ScrollArea>
      </div>
    );
  }

  return <AudioPlayerControls article={article} isMobile={isMobile} />;
};

export default AudioPlayerContent;
