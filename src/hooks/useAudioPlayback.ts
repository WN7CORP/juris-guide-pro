
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

export const useAudioPlayback = () => {
  const [currentPlaying, setCurrentPlaying] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioError, setAudioError] = useState<string | null>(null);
  const progressIntervalRef = useRef<number | null>(null);

  const handleAudioEnded = () => {
    console.log('Audio playback ended');
    setIsPlaying(false);
    setCurrentPlaying(null);
    clearProgressInterval();
  };

  const clearProgressInterval = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    setProgress(0);
  };

  const trackProgress = (audio: HTMLAudioElement) => {
    // Clear any existing interval
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    
    // Set up new progress tracking
    const intervalId = window.setInterval(() => {
      if (audio) {
        const percentage = (audio.currentTime / audio.duration) * 100;
        setProgress(percentage);
      }
    }, 100);
    
    progressIntervalRef.current = intervalId;
  };

  const playAudio = (articleId: string, audioUrl: string) => {
    // Validate the audio URL
    if (!audioUrl || audioUrl.trim() === '') {
      toast.error("URL de áudio inválida");
      return;
    }

    console.log(`Attempting to play audio from: ${audioUrl}`);
    setAudioError(null);

    // Stop current audio if playing
    if (audioElement) {
      audioElement.pause();
      audioElement.removeEventListener('ended', handleAudioEnded);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    }

    // Create new audio element
    const newAudio = new Audio(audioUrl);
    setAudioElement(newAudio);
    
    // Set up event listeners
    newAudio.addEventListener('loadedmetadata', () => {
      console.log(`Audio metadata loaded, duration: ${newAudio.duration}`);
      setDuration(newAudio.duration);
    });
    
    // Fix: Use proper type for event handler
    newAudio.addEventListener('ended', () => handleAudioEnded());
    
    newAudio.addEventListener('error', (e) => {
      console.error('Audio error:', e);
      const error = e.target as HTMLAudioElement;
      const errorMessage = error.error ? `Código: ${error.error.code}` : 'Erro desconhecido';
      setAudioError(errorMessage);
      toast.error("Não foi possível reproduzir o áudio");
      setIsPlaying(false);
      setCurrentPlaying(null);
      clearProgressInterval();
    });
    
    // Play the audio
    newAudio.play().then(() => {
      console.log('Audio playback started successfully');
      // Start progress tracking
      trackProgress(newAudio);
    }).catch((error) => {
      console.error('Error playing audio:', error);
      setAudioError(error.message);
      toast.error("Erro ao reproduzir áudio");
      setIsPlaying(false);
      setCurrentPlaying(null);
    });
    
    // Update state
    setCurrentPlaying(articleId);
    setIsPlaying(true);
  };

  const pauseAudio = () => {
    if (audioElement) {
      audioElement.pause();
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    }
    setIsPlaying(false);
  };

  // Clean up audio resources when unmounting
  useEffect(() => {
    return () => {
      if (audioElement) {
        audioElement.pause();
        audioElement.removeEventListener('ended', handleAudioEnded);
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

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
