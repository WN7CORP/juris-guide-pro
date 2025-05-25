
import { useState, useEffect, useRef } from "react";
import { globalAudioState } from "@/components/AudioCommentPlaylist";
import { UseAudioPlayerOptions, UseAudioPlayerReturn } from "./audio/types";

// Re-export types for convenience
export type { UseAudioPlayerOptions, UseAudioPlayerReturn };

export const useAudioPlayer = ({
  articleId,
  articleNumber,
  codeId,
  audioUrl,
  autoPlay = false,
  onEnded
}: UseAudioPlayerOptions): UseAudioPlayerReturn => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<number>();
  const isInitializedRef = useRef(false);
  
  console.log(`useAudioPlayer initialized for article ${articleId}`);
  
  // Sync with global state - simplified and less frequent
  useEffect(() => {
    const checkGlobalState = () => {
      const isCurrentlyPlaying = globalAudioState.currentAudioId === articleId && globalAudioState.isPlaying;
      console.log(`Global state check for ${articleId}: currentId=${globalAudioState.currentAudioId}, isPlaying=${globalAudioState.isPlaying}, result=${isCurrentlyPlaying}`);
      
      if (isCurrentlyPlaying !== isPlaying) {
        setIsPlaying(isCurrentlyPlaying);
      }
    };
    
    // Check immediately and then every 500ms (less frequent to avoid conflicts)
    checkGlobalState();
    const interval = setInterval(checkGlobalState, 500);
    
    return () => clearInterval(interval);
  }, [articleId, isPlaying]);
  
  // Initialize audio element
  useEffect(() => {
    if (!audioUrl || isInitializedRef.current) return;
    
    console.log(`Initializing audio for article ${articleId} with URL: ${audioUrl}`);
    
    // Check if there's already a global audio element for this article
    if (globalAudioState.currentAudioId === articleId && globalAudioState.audioElement) {
      console.log(`Using existing global audio element for ${articleId}`);
      audioRef.current = globalAudioState.audioElement;
      setCurrentTime(audioRef.current.currentTime || 0);
      setDuration(audioRef.current.duration || 0);
      setIsReady(true);
      isInitializedRef.current = true;
      return;
    }
    
    // Create new audio element
    const audio = new Audio(audioUrl);
    audio.preload = 'metadata';
    audio.volume = volume;
    audio.playbackRate = playbackSpeed;
    
    const handleLoadedMetadata = () => {
      console.log(`Audio metadata loaded for ${articleId}, duration: ${audio.duration}`);
      setDuration(audio.duration);
      setIsReady(true);
    };
    
    const handleCanPlayThrough = () => {
      console.log(`Audio can play through for ${articleId}`);
      setIsReady(true);
    };
    
    const handlePlay = () => {
      console.log(`Audio PLAY event for ${articleId}`);
      setIsPlaying(true);
      globalAudioState.currentAudioId = articleId;
      globalAudioState.isPlaying = true;
      globalAudioState.audioElement = audio;
      
      // Update minimal player info
      globalAudioState.minimalPlayerInfo = {
        articleId,
        articleNumber,
        codeId,
        audioUrl
      };
      
      // Start time update interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      intervalRef.current = window.setInterval(() => {
        if (audio && !audio.paused) {
          setCurrentTime(audio.currentTime);
        }
      }, 100);
    };
    
    const handlePause = () => {
      console.log(`Audio PAUSE event for ${articleId}`);
      setIsPlaying(false);
      globalAudioState.isPlaying = false;
      globalAudioState.currentAudioId = "";
      
      // Clear time update interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = undefined;
      }
    };
    
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };
    
    const handleEnded = () => {
      console.log(`Audio ENDED event for ${articleId}`);
      setIsPlaying(false);
      setCurrentTime(0);
      globalAudioState.currentAudioId = "";
      globalAudioState.isPlaying = false;
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = undefined;
      }
      
      if (onEnded) onEnded();
    };
    
    const handleError = (e: any) => {
      console.error(`Audio error for ${articleId}:`, e);
      setIsPlaying(false);
      setError("Erro ao reproduzir áudio");
      globalAudioState.currentAudioId = "";
      globalAudioState.isPlaying = false;
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = undefined;
      }
    };
    
    // Add event listeners
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('canplaythrough', handleCanPlayThrough);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    
    audioRef.current = audio;
    isInitializedRef.current = true;
    
    // Cleanup function
    return () => {
      console.log(`Cleaning up audio for ${articleId}`);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = undefined;
      }
      
      if (audio) {
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.removeEventListener('canplaythrough', handleCanPlayThrough);
        audio.removeEventListener('play', handlePlay);
        audio.removeEventListener('pause', handlePause);
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('error', handleError);
        
        // Only pause if this audio is currently playing globally
        if (globalAudioState.currentAudioId === articleId && !audio.paused) {
          audio.pause();
          globalAudioState.currentAudioId = "";
          globalAudioState.isPlaying = false;
        }
      }
    };
  }, [articleId, audioUrl, volume, playbackSpeed, articleNumber, codeId, onEnded]);

  // Handle autoPlay
  useEffect(() => {
    if (autoPlay && isReady && audioRef.current && !isPlaying && globalAudioState.currentAudioId !== articleId) {
      console.log(`Auto-playing audio for ${articleId}`);
      
      // Stop any currently playing audio first
      globalAudioState.stopCurrentAudio();
      
      // Small delay to ensure state is clear
      setTimeout(() => {
        if (audioRef.current && audioRef.current.paused) {
          audioRef.current.play().catch(error => {
            console.error("AutoPlay failed:", error);
            setError("Erro ao reproduzir áudio automaticamente");
          });
        }
      }, 100);
    }
  }, [autoPlay, isReady, articleId, isPlaying]);
  
  // Control functions
  const togglePlay = () => {
    if (!audioRef.current) {
      console.warn(`No audio element for ${articleId}`);
      return;
    }
    
    console.log(`Toggle play called for ${articleId}, current paused state:`, audioRef.current.paused);
    
    if (audioRef.current.paused) {
      // Stop any other audio first
      globalAudioState.stopCurrentAudio();
      
      // Play this audio
      audioRef.current.play().catch(error => {
        console.error("Play failed:", error);
        setError("Erro ao reproduzir áudio");
      });
    } else {
      // Pause this audio
      audioRef.current.pause();
    }
  };

  const seek = (time: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = time;
  };

  const setVolumeControl = (newVolume: number) => {
    if (!audioRef.current) return;
    audioRef.current.volume = newVolume;
    setVolume(newVolume);
  };

  const setPlaybackSpeedControl = (speed: number) => {
    if (!audioRef.current) return;
    audioRef.current.playbackRate = speed;
    setPlaybackSpeed(speed);
  };
  
  return {
    isPlaying,
    currentTime,
    duration,
    volume,
    playbackSpeed,
    error,
    isReady,
    audioElement: audioRef.current,
    togglePlay,
    seek,
    setVolume: setVolumeControl,
    setPlaybackSpeed: setPlaybackSpeedControl
  };
};

export default useAudioPlayer;
