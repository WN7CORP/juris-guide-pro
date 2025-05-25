
import { globalAudioState } from "@/components/AudioCommentPlaylist";

export const createAudioControls = (
  articleId: string,
  articleNumber?: string,
  codeId?: string,
  audioUrl?: string,
  audioRef?: React.MutableRefObject<HTMLAudioElement | null>,
  setIsPlaying?: (playing: boolean) => void,
  setError?: (error: string | null) => void
) => {
  const togglePlay = () => {
    if (!audioRef?.current) {
      console.warn(`No audio element for togglePlay in ${articleId}`);
      return;
    }
    
    console.log(`Toggle play called for article ${articleId}, current paused state:`, audioRef.current.paused);
    
    if (audioRef.current.paused) {
      // First, stop any currently playing audio globally
      globalAudioState.stopCurrentAudio();
      
      // Then play this audio
      console.log(`Starting play for article ${articleId}`);
      audioRef.current.play().then(() => {
        console.log(`Play started successfully for article ${articleId}`);
        // The play event handler will update the global state
      }).catch(error => {
        console.error("Play failed:", error);
        setError?.("Erro ao reproduzir áudio");
      });
    } else {
      console.log(`Pausing audio for article ${articleId}`);
      audioRef.current.pause();
      // The pause event handler will update the global state
    }
  };

  const seek = (time: number) => {
    if (!audioRef?.current) return;
    console.log(`Seeking to ${time} for article ${articleId}`);
    audioRef.current.currentTime = time;
  };

  const setVolume = (newVolume: number) => {
    if (!audioRef?.current) return;
    console.log(`Setting volume to ${newVolume} for article ${articleId}`);
    audioRef.current.volume = newVolume;
  };

  const setPlaybackSpeed = (speed: number) => {
    if (!audioRef?.current) return;
    console.log(`Setting playback speed to ${speed} for article ${articleId}`);
    audioRef.current.playbackRate = speed;
  };

  return {
    togglePlay,
    seek,
    setVolume,
    setPlaybackSpeed
  };
};
