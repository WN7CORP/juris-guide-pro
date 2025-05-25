
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
    // This synchronizer is now simplified and less aggressive
    // Most synchronization is handled by the main useAudioPlayer hook
    console.log(`Audio state synchronizer setup for ${articleId}`);
    
    const checkCurrentAudio = () => {
      const isCurrentlyPlaying = globalAudioState.currentAudioId === articleId && globalAudioState.isPlaying;
      
      // Only update if there's a significant change
      if (isCurrentlyPlaying !== (globalAudioState.currentAudioId === articleId)) {
        console.log(`State sync update for ${articleId}: isPlaying=${isCurrentlyPlaying}`);
        setIsPlaying(isCurrentlyPlaying);
      }
      
      // Sync audio element reference if needed
      if (globalAudioState.currentAudioId === articleId && globalAudioState.audioElement && !audioRef.current) {
        console.log(`Syncing audio element reference for ${articleId}`);
        audioRef.current = globalAudioState.audioElement;
        setCurrentTime(audioRef.current.currentTime || 0);
        setDuration(audioRef.current.duration || 0);
      }
    };
    
    // Check less frequently to avoid conflicts - every 1 second instead of 200ms
    const checkInterval = setInterval(checkCurrentAudio, 1000);
    
    // Initial check
    checkCurrentAudio();
    
    return () => {
      clearInterval(checkInterval);
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current);
        timeUpdateIntervalRef.current = undefined;
      }
    };
  }, [articleId, audioRef, setIsPlaying, setCurrentTime, setDuration, timeUpdateIntervalRef]);
};
