
import { useState, useRef, useEffect } from 'react';
import { useAudioPlayerStore } from '@/store/audioPlayerStore';
import { preloadAudio } from '@/services/audioPreloadService';
import { toast } from 'sonner';

/**
 * Hook for managing audio playback controls
 */
export const useAudioControl = (articleId: string, audioUrl?: string) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showMiniPlayer, setShowMiniPlayer] = useState(false);
  const [minimizedPlayer, setMinimizedPlayer] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const { currentAudioId, isMinimized, stopCurrentAudio } = useAudioPlayerStore();

  // Check if this article is currently playing in the store state
  useEffect(() => {
    setIsPlaying(currentAudioId === articleId);
    
    // Set up interval to check store audio state
    const checkInterval = setInterval(() => {
      setIsPlaying(currentAudioId === articleId);
      
      // Also check if player is minimized but still playing this article
      if (currentAudioId === articleId && isMinimized) {
        setMinimizedPlayer(true);
        setShowMiniPlayer(true);
      }
    }, 500);
    
    return () => clearInterval(checkInterval);
  }, [articleId, currentAudioId, isMinimized]);

  // Pre-load audio on component mount
  useEffect(() => {
    if (!audioUrl) return;

    preloadAudio(audioUrl)
      .then(audio => {
        audioRef.current = audio;
        console.log(`Áudio pré-carregado com sucesso para artigo ${articleId}`);
        
        // Set up event listeners
        audio.addEventListener('play', handleAudioPlay);
        audio.addEventListener('pause', handleAudioPause);
        audio.addEventListener('ended', handleAudioEnded);
        audio.addEventListener('error', handleAudioError);
      })
      .catch(error => {
        console.error(`Erro ao pré-carregar áudio para artigo ${articleId}:`, error);
        setAudioError("Erro ao carregar áudio");
      });

    // Cleanup function to remove event listeners
    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('play', handleAudioPlay);
        audioRef.current.removeEventListener('pause', handleAudioPause);
        audioRef.current.removeEventListener('ended', handleAudioEnded);
        audioRef.current.removeEventListener('error', handleAudioError);

        // Don't automatically pause audio on unmount - let the player decide
      }
    };
  }, [audioUrl, articleId]);
  
  const toggleAudioPlay = () => {
    if (showMiniPlayer && currentAudioId === articleId) {
      setShowMiniPlayer(false);
      setMinimizedPlayer(false);
      if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
        stopCurrentAudio();
      }
      return;
    }
    
    // Stop any currently playing audio before showing mini player
    stopCurrentAudio();
    
    // Show mini player instead of playing directly
    setShowMiniPlayer(true);
    setMinimizedPlayer(false);
  };
  
  const handleAudioPlay = () => {
    console.log(`Audio started playing for article ${articleId}`);
    setIsPlaying(true);
  };
  
  const handleAudioPause = () => {
    console.log(`Audio paused for article ${articleId}`);
    setIsPlaying(false);
  };
  
  const handleAudioEnded = () => {
    console.log(`Audio ended for article ${articleId}`);
    setIsPlaying(false);
    
    // Reset store state
    stopCurrentAudio();
  };
  
  const handleAudioError = (e: any) => {
    console.error(`Audio error for article ${articleId}:`, e);
    setIsPlaying(false);
    setAudioError("Erro ao reproduzir áudio");
    toast.error("Não foi possível reproduzir o áudio do comentário");
    
    // Reset store state on error
    stopCurrentAudio();
  };
  
  const handleCloseMiniPlayer = () => {
    setShowMiniPlayer(false);
    setMinimizedPlayer(false);
    
    // Pause audio if it's playing
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      stopCurrentAudio();
    }
  };
  
  const handleMinimizePlayer = () => {
    setMinimizedPlayer(true);
    // Don't stop the audio - allow it to continue playing
  };

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
