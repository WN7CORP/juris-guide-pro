
import { useState, useEffect } from 'react';
import { Volume, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface NowPlayingInfo {
  articleId: string;
  articleNumber: string;
  audioUrl: string;
}

export const NowPlayingIndicator = () => {
  const [currentlyPlaying, setCurrentlyPlaying] = useState<NowPlayingInfo | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleNowPlaying = (e: CustomEvent) => {
      const detail = e.detail as NowPlayingInfo;
      setCurrentlyPlaying(detail);
      setIsVisible(true);
    };

    const handleAudioEnded = (e: CustomEvent) => {
      const detail = e.detail as { articleId: string };
      if (currentlyPlaying?.articleId === detail.articleId) {
        setIsVisible(false);
        
        // Remove the playing info after the fade out animation completes
        setTimeout(() => {
          setCurrentlyPlaying(null);
        }, 300); // Match this to the CSS transition duration
      }
    };

    // Use type assertion for the event listeners
    document.addEventListener('nowPlaying', handleNowPlaying as EventListener);
    document.addEventListener('audioEnded', handleAudioEnded as EventListener);

    return () => {
      document.removeEventListener('nowPlaying', handleNowPlaying as EventListener);
      document.removeEventListener('audioEnded', handleAudioEnded as EventListener);
    };
  }, [currentlyPlaying]);

  if (!currentlyPlaying) return null;

  return (
    <div 
      className={cn(
        "now-playing-indicator transition-all duration-300",
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
    >
      <div className="audio-wave flex items-end h-3 gap-[2px] mr-2">
        <span className="w-[2px] h-2 bg-netflix-red rounded-full animate-pulse"></span>
        <span className="w-[2px] h-3 bg-netflix-red rounded-full animate-pulse" style={{animationDelay: "0.1s"}}></span>
        <span className="w-[2px] h-1 bg-netflix-red rounded-full animate-pulse" style={{animationDelay: "0.2s"}}></span>
        <span className="w-[2px] h-2 bg-netflix-red rounded-full animate-pulse" style={{animationDelay: "0.15s"}}></span>
      </div>
      
      <span className="text-xs text-white font-medium">
        Reproduzindo Art. {currentlyPlaying.articleNumber}
      </span>
      
      <button 
        onClick={() => setIsVisible(false)} 
        className="ml-2 text-gray-400 hover:text-white"
        aria-label="Fechar notificação"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
};

export default NowPlayingIndicator;
