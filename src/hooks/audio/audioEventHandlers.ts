
import { useAudioPlayerStore } from "@/store/audioPlayerStore";

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
  const store = useAudioPlayerStore.getState();

  const handlePlay = (audio: HTMLAudioElement) => () => {
    console.log(`Audio PLAY event for article ${articleId}`);
    setIsPlaying(true);
    store.setPlaybackState(true);
    store.setCurrentAudio(articleId, {
      articleId,
      audioUrl: audio.src,
      articleNumber: "Unknown",
      codeId: "Unknown"
    });
    store.setAudioElement(audio);
    
    // Clear any existing interval before starting a new one
    if (timeUpdateIntervalRef.current) {
      clearInterval(timeUpdateIntervalRef.current);
    }
    
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
    store.setPlaybackState(false);
    store.stopCurrentAudio();
    
    // Clear interval when paused
    if (timeUpdateIntervalRef.current) {
      clearInterval(timeUpdateIntervalRef.current);
      timeUpdateIntervalRef.current = undefined;
    }
  };

  const handleTimeUpdate = (audio: HTMLAudioElement) => () => {
    // Only update if this is the currently playing audio
    if (store.currentAudioId === articleId) {
      setCurrentTime(audio.currentTime);
    }
  };

  const handleLoadedMetadata = (audio: HTMLAudioElement) => () => {
    console.log(`Audio metadata loaded for ${articleId}, duration: ${audio.duration}`);
    setDuration(audio.duration);
    setIsReady(true);
  };

  const handleCanPlayThrough = () => {
    console.log(`Audio can play through for ${articleId}`);
    setIsReady(true);
  };

  const handleEnded = () => {
    console.log(`Audio ENDED event for ${articleId}`);
    setIsPlaying(false);
    setCurrentTime(0);
    
    // Clear interval when ended
    if (timeUpdateIntervalRef.current) {
      clearInterval(timeUpdateIntervalRef.current);
      timeUpdateIntervalRef.current = undefined;
    }
    
    // Reset store state
    store.stopCurrentAudio();
    
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
    
    // Reset store state on error
    store.stopCurrentAudio();
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
