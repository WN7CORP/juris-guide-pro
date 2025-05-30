
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
  
  // Sync with global state - check if this article is currently playing
  useEffect(() => {
    const checkGlobalState = () => {
      const isCurrentlyPlaying = globalAudioState.currentAudioId === articleId && globalAudioState.isPlaying;
      console.log(`Global state check for ${articleId}: currentId=${globalAudioState.currentAudioId}, isPlaying=${globalAudioState.isPlaying}, result=${isCurrentlyPlaying}`);
      
      if (isCurrentlyPlaying !== isPlaying) {
        console.log(`Updating isPlaying for ${articleId} from ${isPlaying} to ${isCurrentlyPlaying}`);
        setIsPlaying(isCurrentlyPlaying);
      }
    };
    
    // Check immediately and then every 300ms
    checkGlobalState();
    const interval = setInterval(checkGlobalState, 300);
    
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
      
      // Update global state immediately
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
      
      // CRITICAL: Clear global state immediately on pause
      globalAudioState.isPlaying = false;
      globalAudioState.currentAudioId = "";
      globalAudioState.audioElement = null;
      
      // Clear time update interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = undefined;
      }
    };
    
    const handleTimeUpdate = () => {
      // Only update if this is the currently playing audio
      if (globalAudioState.currentAudioId === articleId) {
        setCurrentTime(audio.currentTime);
      }
    };
    
    const handleEnded = () => {
      console.log(`Audio ENDED event for ${articleId}`);
      setIsPlaying(false);
      setCurrentTime(0);
      
      // Clear global state
      globalAudioState.currentAudioId = "";
      globalAudioState.isPlaying = false;
      globalAudioState.audioElement = null;
      
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
      
      // Clear global state on error
      globalAudioState.currentAudioId = "";
      globalAudioState.isPlaying = false;
      globalAudioState.audioElement = null;
      
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
        
        // Only pause and clear global state if this audio is currently playing
        if (globalAudioState.currentAudioId === articleId && !audio.paused) {
          console.log(`Pausing and clearing global state for ${articleId} during cleanup`);
          audio.pause();
          globalAudioState.currentAudioId = "";
          globalAudioState.isPlaying = false;
          globalAudioState.audioElement = null;
        }
      }
    };
  }, [articleId, audioUrl, volume, playbackSpeed, articleNumber, codeId, onEnded]);

  // Handle autoPlay
  useEffect(() => {
    if (autoPlay && isReady && audioRef.current && !isPlaying && globalAudioState.currentAudioId !== articleId) {
      console.log(`Auto-playing audio for ${articleId}`);
      
      // Stop any currently playing audio first
      if (globalAudioState.audioElement && !globalAudioState.audioElement.paused) {
        console.log(`Stopping current audio before auto-play`);
        globalAudioState.audioElement.pause();
        globalAudioState.currentAudioId = "";
        globalAudioState.isPlaying = false;
        globalAudioState.audioElement = null;
      }
      
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
      if (globalAudioState.audioElement && globalAudioState.audioElement !== audioRef.current) {
        console.log(`Stopping other audio before playing ${articleId}`);
        globalAudioState.audioElement.pause();
        globalAudioState.currentAudioId = "";
        globalAudioState.isPlaying = false;
        globalAudioState.audioElement = null;
      }
      
      // Play this audio
      audioRef.current.play().catch(error => {
        console.error("Play failed:", error);
        setError("Erro ao reproduzir áudio");
      });
    } else {
      // Pause this audio
      console.log(`Pausing audio ${articleId}`);
      audioRef.current.pause();
    }
  };

  const seek = (time: number) => {
    if (!audioRef.current) return;
    console.log(`Seeking to ${time} for ${articleId}`);
    audioRef.current.currentTime = time;
  };

  const setVolumeControl = (newVolume: number) => {
    if (!audioRef.current) return;
    console.log(`Setting volume to ${newVolume} for ${articleId}`);
    audioRef.current.volume = newVolume;
    setVolume(newVolume);
  };

  const setPlaybackSpeedControl = (speed: number) => {
    if (!audioRef.current) return;
    console.log(`Setting playback speed to ${speed} for ${articleId}`);
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
