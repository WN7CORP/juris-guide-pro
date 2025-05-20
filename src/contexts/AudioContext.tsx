
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';

interface AudioContextState {
  currentPlayingArticleId: string | null;
  audioUrl: string | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  error: string | null;
  playAudio: (articleId: string, url: string) => Promise<void>;
  pauseAudio: () => void;
  stopAudio: () => void;
  seekTo: (percentage: number) => void;
}

const AudioContext = createContext<AudioContextState | undefined>(undefined);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [currentPlayingArticleId, setCurrentPlayingArticleId] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressIntervalRef = useRef<number | null>(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  const trackProgress = () => {
    if (audioRef.current && audioRef.current.duration) {
      const percentage = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(percentage);
    }
  };

  const clearProgressInterval = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  const setupProgressTracking = () => {
    clearProgressInterval();
    
    const intervalId = window.setInterval(() => {
      trackProgress();
    }, 100);
    
    progressIntervalRef.current = intervalId;
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setProgress(0);
    clearProgressInterval();
    setCurrentPlayingArticleId(null);
  };

  const playAudio = async (articleId: string, url: string) => {
    setError(null);
    
    // If we already have an audio element playing, stop it
    if (audioRef.current) {
      audioRef.current.pause();
      clearProgressInterval();
    }
    
    try {
      // Log the URL for debugging
      console.log(`Attempting to play audio: ${url}`);
      
      // Check if URL is valid
      if (!url || url.trim() === '') {
        throw new Error('URL de áudio inválida');
      }
      
      // Create a new audio element
      const audio = new Audio(url);
      audioRef.current = audio;
      
      // Set up event listeners
      audio.addEventListener('loadedmetadata', () => {
        console.log('Audio metadata loaded, duration:', audio.duration);
        setDuration(audio.duration);
      });
      
      audio.addEventListener('ended', handleAudioEnded);
      
      audio.addEventListener('error', (e) => {
        const errorAudio = e.target as HTMLAudioElement;
        let errorMessage = 'Erro desconhecido ao reproduzir áudio';
        
        if (errorAudio.error) {
          switch (errorAudio.error.code) {
            case MediaError.MEDIA_ERR_ABORTED:
              errorMessage = 'A reprodução foi abortada pelo usuário';
              break;
            case MediaError.MEDIA_ERR_NETWORK:
              errorMessage = 'Erro de rede ao baixar o áudio';
              break;
            case MediaError.MEDIA_ERR_DECODE:
              errorMessage = 'Erro ao decodificar áudio';
              break;
            case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
              errorMessage = 'Formato de áudio não suportado';
              break;
            default:
              errorMessage = `Erro de áudio: ${errorAudio.error.code}`;
              break;
          }
        }
        
        console.error("Audio error:", errorMessage, "URL:", url);
        setError(errorMessage);
        setIsPlaying(false);
        clearProgressInterval();
        toast.error("Não foi possível reproduzir o áudio: " + errorMessage);
      });
      
      // Start playing
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        await playPromise;
        
        setCurrentPlayingArticleId(articleId);
        setAudioUrl(url);
        setIsPlaying(true);
        setupProgressTracking();
        
        console.log(`Now playing audio for article ${articleId}`);
      }
    } catch (error) {
      let errorMessage = 'Falha ao reproduzir áudio';
      if (error instanceof Error) {
        errorMessage += `: ${error.message}`;
      }
      console.error("Failed to play audio:", error, "URL:", url);
      setError(errorMessage);
      setIsPlaying(false);
      toast.error(errorMessage);
      throw error;
    }
  };

  const pauseAudio = () => {
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      clearProgressInterval();
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setProgress(0);
      clearProgressInterval();
      setCurrentPlayingArticleId(null);
      setAudioUrl(null);
    }
  };

  const seekTo = (percentage: number) => {
    if (audioRef.current && !isNaN(audioRef.current.duration)) {
      const newTime = (percentage / 100) * audioRef.current.duration;
      audioRef.current.currentTime = newTime;
      setProgress(percentage);
    }
  };

  const value = {
    currentPlayingArticleId,
    audioUrl,
    isPlaying,
    progress,
    duration,
    error,
    playAudio,
    pauseAudio,
    stopAudio,
    seekTo
  };

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}
