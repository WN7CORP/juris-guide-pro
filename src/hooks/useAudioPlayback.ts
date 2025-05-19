
import { useAudio } from "@/contexts/AudioContext";

// This is now a thin wrapper around the AudioContext to maintain compatibility
export const useAudioPlayback = () => {
  const {
    currentPlayingArticleId: currentPlaying,
    isPlaying,
    progress,
    error: audioError,
    playAudio,
    pauseAudio,
    stopAudio: clearProgressInterval
  } = useAudio();

  return {
    currentPlaying,
    isPlaying,
    progress,
    audioError,
    playAudio,
    pauseAudio,
    clearProgressInterval
  };
};

export default useAudioPlayback;
