
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';

interface AudioContextState {
  currentPlayingArticleId: string | null;
  audioUrl: string | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  error: string | null;
  playAudio: (articleId: string, url: string) => void;
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

  const playAudio = (articleId: string, url: string) => {
    setError(null);
    
    // If we already have an audio element playing, stop it
    if (audioRef.current) {
      audioRef.current.pause();
      clearProgressInterval();
    }
    
    // Create a new audio element
    const audio = new Audio(url);
    audioRef.current = audio;
    
    // Set up event listeners
    audio.addEventListener('loadedmetadata', () => {
      setDuration(audio.duration);
    });
    
    audio.addEventListener('ended', handleAudioEnded);
    
    audio.addEventListener('error', (e) => {
      const errorAudio = e.target as HTMLAudioElement;
      const errorMessage = errorAudio.error ? `Error: ${errorAudio.error.code}` : 'Unknown error';
      setError(errorMessage);
      setIsPlaying(false);
      clearProgressInterval();
      toast.error("Não foi possível reproduzir o áudio");
    });
    
    // Start playing
    audio.play().then(() => {
      setCurrentPlayingArticleId(articleId);
      setAudioUrl(url);
      setIsPlaying(true);
      setupProgressTracking();
    }).catch((error) => {
      setError(`Failed to play: ${error.message}`);
      setIsPlaying(false);
      toast.error("Erro ao reproduzir áudio");
    });
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
