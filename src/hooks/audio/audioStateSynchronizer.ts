
import { useEffect } from "react";
import { globalAudioState } from "@/components/AudioCommentPlaylist";

export const useAudioStateSynchronizer = (
  articleId: string,
  audioRef: React.MutableRefObject<HTMLAudioElement | null>,
  setIsPlaying: (playing: boolean) => void,
  setCurrentTime: (time: number) => void,
  setDuration: (duration: number) => void,
  timeUpdateIntervalRef: React.MutableRefObject<number | undefined>
) => {
  useEffect(() => {
    const checkCurrentAudio = () => {
      const isCurrentlyPlaying = globalAudioState.currentAudioId === articleId && globalAudioState.isPlaying;
      console.log(`State check for article ${articleId}: currentAudioId=${globalAudioState.currentAudioId}, isPlaying=${globalAudioState.isPlaying}, result=${isCurrentlyPlaying}`);
      
      setIsPlaying(isCurrentlyPlaying);
      
      // If the global audio element exists and it's this article, sync our reference
      if (globalAudioState.currentAudioId === articleId && globalAudioState.audioElement) {
        audioRef.current = globalAudioState.audioElement;
        setCurrentTime(audioRef.current.currentTime || 0);
        setDuration(audioRef.current.duration || 0);
        
        // Start time update interval only if audio is playing
        if (!timeUpdateIntervalRef.current && !audioRef.current.paused) {
          timeUpdateIntervalRef.current = window.setInterval(() => {
            if (audioRef.current && !audioRef.current.paused) {
              setCurrentTime(audioRef.current.currentTime || 0);
              setDuration(audioRef.current.duration || 0);
            }
          }, 100);
        }
      } else if (timeUpdateIntervalRef.current) {
        // Clear interval if this article is not playing
        clearInterval(timeUpdateIntervalRef.current);
        timeUpdateIntervalRef.current = undefined;
      }
    };
    
    // Initial check
    checkCurrentAudio();
    
    // Reduced frequency to prevent conflicts
    const checkInterval = setInterval(checkCurrentAudio, 200);
    
    return () => {
      clearInterval(checkInterval);
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current);
      }
    };
  }, [articleId, audioRef, setIsPlaying, setCurrentTime, setDuration, timeUpdateIntervalRef]);
};
