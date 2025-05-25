
import { useState, useRef, useEffect, useCallback } from 'react';
import { globalAudioState } from '@/components/AudioCommentPlaylist';
import { preloadAudio } from '@/services/audioPreloadService';
import { toast } from 'sonner';

export const useAudioControl = (articleId: string, audioUrl?: string) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showMiniPlayer, setShowMiniPlayer] = useState(false);
  const [minimizedPlayer, setMinimizedPlayer] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Memoized event handlers to prevent unnecessary re-renders
  const handleAudioPlay = useCallback(() => {
    setIsPlaying(true);
  }, []);
  
  const handleAudioPause = useCallback(() => {
    setIsPlaying(false);
  }, []);
  
  const handleAudioEnded = useCallback(() => {
    setIsPlaying(false);
    globalAudioState.currentAudioId = "";
    globalAudioState.isPlaying = false;
    globalAudioState.isMinimized = false;
  }, []);
  
  const handleAudioError = useCallback((e: any) => {
    setIsPlaying(false);
    setAudioError("Erro ao reproduzir áudio");
    toast.error("Não foi possível reproduzir o áudio da análise");
    
    globalAudioState.currentAudioId = "";
    globalAudioState.isPlaying = false;
    globalAudioState.isMinimized = false;
  }, []);

  // Check if this article is currently playing in the global audio state
  useEffect(() => {
    setIsPlaying(globalAudioState.currentAudioId === articleId);
    
    const checkInterval = setInterval(() => {
      setIsPlaying(globalAudioState.currentAudioId === articleId);
      
      if (globalAudioState.currentAudioId === articleId && globalAudioState.isMinimized) {
        setMinimizedPlayer(true);
        setShowMiniPlayer(true);
      }
    }, 500);
    
    return () => clearInterval(checkInterval);
  }, [articleId]);

  // Pre-load audio on component mount
  useEffect(() => {
    if (!audioUrl) return;

    preloadAudio(audioUrl)
      .then(audio => {
        audioRef.current = audio;
        
        audio.addEventListener('play', handleAudioPlay);
        audio.addEventListener('pause', handleAudioPause);
        audio.addEventListener('ended', handleAudioEnded);
        audio.addEventListener('error', handleAudioError);
      })
      .catch(() => {
        setAudioError("Erro ao carregar áudio");
      });

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('play', handleAudioPlay);
        audioRef.current.removeEventListener('pause', handleAudioPause);
        audioRef.current.removeEventListener('ended', handleAudioEnded);
        audioRef.current.removeEventListener('error', handleAudioError);
      }
    };
  }, [audioUrl, articleId, handleAudioPlay, handleAudioPause, handleAudioEnded, handleAudioError]);
  
  const toggleAudioPlay = useCallback(() => {
    if (showMiniPlayer && globalAudioState.currentAudioId === articleId) {
      setShowMiniPlayer(false);
      setMinimizedPlayer(false);
      globalAudioState.isMinimized = false;
      if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
        globalAudioState.currentAudioId = "";
        globalAudioState.isPlaying = false;
      }
      return;
    }
    
    globalAudioState.stopCurrentAudio();
    setShowMiniPlayer(true);
    setMinimizedPlayer(false);
    globalAudioState.isMinimized = false;
  }, [articleId, showMiniPlayer]);
  
  const handleCloseMiniPlayer = useCallback(() => {
    setShowMiniPlayer(false);
    setMinimizedPlayer(false);
    globalAudioState.isMinimized = false;
    
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      globalAudioState.currentAudioId = "";
      globalAudioState.isPlaying = false;
    }
  }, []);
  
  const handleMinimizePlayer = useCallback(() => {
    setMinimizedPlayer(true);
    globalAudioState.isMinimized = true;
  }, []);

  return {
    isPlaying,
    showMiniPlayer,
    minimizedPlayer,
    audioError,
    toggleAudioPlay,
    handleCloseMiniPlayer,
    handleMinimizePlayer
  };
};

export default useAudioControl;
