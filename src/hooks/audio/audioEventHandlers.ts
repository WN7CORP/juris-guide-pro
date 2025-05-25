
import { globalAudioState } from "@/components/AudioCommentPlaylist";

export const createAudioEventHandlers = (
  articleId: string,
  setIsPlaying: (playing: boolean) => void,
  setCurrentTime: (time: number) => void,
  setDuration: (duration: number) => void,
  setIsReady: (ready: boolean) => void,
  setError: (error: string | null) => void,
  timeUpdateIntervalRef: React.MutableRefObject<number | undefined>,
  onEnded?: () => void
) => {
  const handlePlay = (audio: HTMLAudioElement) => () => {
    console.log(`Audio PLAY event for article ${articleId}`);
    setIsPlaying(true);
    globalAudioState.isPlaying = true;
    globalAudioState.currentAudioId = articleId;
    
    // Start time update interval
    timeUpdateIntervalRef.current = window.setInterval(() => {
      if (audio && !audio.paused) {
        setCurrentTime(audio.currentTime);
        setDuration(audio.duration || 0);
      }
    }, 100);
  };

  const handlePause = () => {
    console.log(`Audio PAUSE event for article ${articleId}`);
    setIsPlaying(false);
    globalAudioState.isPlaying = false;
    // CRITICAL FIX: Clear currentAudioId when pausing
    globalAudioState.currentAudioId = "";
    
    // Clear interval when paused
    if (timeUpdateIntervalRef.current) {
      clearInterval(timeUpdateIntervalRef.current);
      timeUpdateIntervalRef.current = undefined;
    }
  };

  const handleTimeUpdate = (audio: HTMLAudioElement) => () => {
    setCurrentTime(audio.currentTime);
  };

  const handleLoadedMetadata = (audio: HTMLAudioElement) => () => {
    setDuration(audio.duration);
    setIsReady(true);
  };

  const handleCanPlayThrough = () => {
    setIsReady(true);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    
    // Clear interval when ended
    if (timeUpdateIntervalRef.current) {
      clearInterval(timeUpdateIntervalRef.current);
      timeUpdateIntervalRef.current = undefined;
    }
    
    // Reset global state
    globalAudioState.currentAudioId = "";
    globalAudioState.isPlaying = false;
    
    // Call onEnded callback if provided
    if (onEnded) onEnded();
  };

  const handleError = (e: any) => {
    console.error(`Audio error for article ${articleId}:`, e);
    setIsPlaying(false);
    setError("Erro ao reproduzir áudio");
    
    // Clear interval on error
    if (timeUpdateIntervalRef.current) {
      clearInterval(timeUpdateIntervalRef.current);
      timeUpdateIntervalRef.current = undefined;
    }
    
    // Reset global state on error
    globalAudioState.currentAudioId = "";
    globalAudioState.isPlaying = false;
  };

  return {
    handlePlay,
    handlePause,
    handleTimeUpdate,
    handleLoadedMetadata,
    handleCanPlayThrough,
    handleEnded,
    handleError
  };
};
