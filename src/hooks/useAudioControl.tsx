
import { useState, useRef, useEffect } from 'react';
import { globalAudioState } from '@/components/AudioCommentPlaylist';
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

  // Check if this article is currently playing in the global audio state
  useEffect(() => {
    setIsPlaying(globalAudioState.currentAudioId === articleId);
    
    // Set up interval to check global audio state
    const checkInterval = setInterval(() => {
      setIsPlaying(globalAudioState.currentAudioId === articleId);
    }, 500);
    
    return () => clearInterval(checkInterval);
  }, [articleId]);

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

        // Pause audio if it's playing
        if (!audioRef.current.paused) {
          audioRef.current.pause();
        }
      }
    };
  }, [audioUrl, articleId]);
  
  const toggleAudioPlay = () => {
    if (showMiniPlayer) {
      setShowMiniPlayer(false);
      setMinimizedPlayer(false);
      if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
        globalAudioState.currentAudioId = "";
        globalAudioState.isPlaying = false;
      }
      return;
    }
    
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
    
    // Reset global state
    globalAudioState.currentAudioId = "";
    globalAudioState.isPlaying = false;
  };
  
  const handleAudioError = (e: any) => {
    console.error(`Audio error for article ${articleId}:`, e);
    setIsPlaying(false);
    setAudioError("Erro ao reproduzir áudio");
    toast.error("Não foi possível reproduzir o áudio do comentário");
    
    // Reset global state on error
    globalAudioState.currentAudioId = "";
    globalAudioState.isPlaying = false;
  };
  
  const handleCloseMiniPlayer = () => {
    setShowMiniPlayer(false);
    setMinimizedPlayer(false);
    
    // Pause audio if it's playing
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      globalAudioState.currentAudioId = "";
      globalAudioState.isPlaying = false;
    }
  };
  
  const handleMinimizePlayer = () => {
    setMinimizedPlayer(true);
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
