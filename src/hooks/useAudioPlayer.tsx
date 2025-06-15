
import { useState, useEffect, useRef } from "react";
import { useAudioPlayerStore } from "@/store/audioPlayerStore";
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
  
  // Get store actions
  const store = useAudioPlayerStore();
  
  console.log(`useAudioPlayer initialized for article ${articleId}`);
  
  // Sync with store state
  useEffect(() => {
    const checkStoreState = () => {
      const isCurrentlyPlaying = store.currentAudioId === articleId && store.isPlaying;
      
      if (isCurrentlyPlaying !== isPlaying) {
        console.log(`Updating isPlaying for ${articleId} from ${isPlaying} to ${isCurrentlyPlaying}`);
        setIsPlaying(isCurrentlyPlaying);
      }
    };
    
    checkStoreState();
    const interval = setInterval(checkStoreState, 500);
    
    return () => clearInterval(interval);
  }, [articleId, isPlaying, store.currentAudioId, store.isPlaying]);
  
  // Initialize audio element
  useEffect(() => {
    if (!audioUrl || isInitializedRef.current) return;
    
    console.log(`Initializing audio for article ${articleId} with URL: ${audioUrl}`);
    
    // Check if there's already a store audio element for this article
    if (store.currentAudioId === articleId && store.audioElement) {
      console.log(`Using existing store audio element for ${articleId}`);
      audioRef.current = store.audioElement;
      setCurrentTime(audioRef.current.currentTime || 0);
      setDuration(audioRef.current.duration || 0);
      setIsReady(true);
      isInitializedRef.current = true;
      return;
    }
    
    // Create new audio element
    const audio = new Audio(audioUrl);
    audio.preload = 'metadata';
    audio.volume = store.userPreferences.defaultVolume;
    audio.playbackRate = store.userPreferences.defaultSpeed;
    
    const handleLoadedMetadata = () => {
      console.log(`Audio metadata loaded for ${articleId}, duration: ${audio.duration}`);
      setDuration(audio.duration);
      store.setDuration(audio.duration);
      setIsReady(true);
    };
    
    const handleCanPlayThrough = () => {
      console.log(`Audio can play through for ${articleId}`);
      setIsReady(true);
    };
    
    const handlePlay = () => {
      console.log(`Audio PLAY event for ${articleId}`);
      setIsPlaying(true);
      
      // Update store state
      store.setCurrentAudio(articleId, {
        articleId,
        articleNumber,
        codeId,
        audioUrl
      });
      store.setPlaybackState(true);
      store.setAudioElement(audio);
      
      // Start time update interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      intervalRef.current = window.setInterval(() => {
        if (audio && !audio.paused) {
          const time = audio.currentTime;
          setCurrentTime(time);
          store.setCurrentTime(time);
        }
      }, 100);
    };
    
    const handlePause = () => {
      console.log(`Audio PAUSE event for ${articleId}`);
      setIsPlaying(false);
      
      // Update store state
      store.setPlaybackState(false);
      store.stopCurrentAudio();
      
      // Clear time update interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = undefined;
      }
    };
    
    const handleTimeUpdate = () => {
      if (store.currentAudioId === articleId) {
        const time = audio.currentTime;
        setCurrentTime(time);
        store.setCurrentTime(time);
      }
    };
    
    const handleEnded = () => {
      console.log(`Audio ENDED event for ${articleId}`);
      setIsPlaying(false);
      setCurrentTime(0);
      
      // Clear store state
      store.stopCurrentAudio();
      
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
      
      // Clear store state on error
      store.stopCurrentAudio();
      
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
        
        // Only pause and clear store state if this audio is currently playing
        if (store.currentAudioId === articleId && !audio.paused) {
          console.log(`Pausing and clearing store state for ${articleId} during cleanup`);
          audio.pause();
          store.stopCurrentAudio();
        }
      }
    };
  }, [articleId, audioUrl, articleNumber, codeId, onEnded, store]);

  // Handle autoPlay
  useEffect(() => {
    if (autoPlay && isReady && audioRef.current && !isPlaying && store.currentAudioId !== articleId) {
      console.log(`Auto-playing audio for ${articleId}`);
      
      // Stop any currently playing audio first
      if (store.audioElement && !store.audioElement.paused) {
        console.log(`Stopping current audio before auto-play`);
        store.stopCurrentAudio();
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
  }, [autoPlay, isReady, articleId, isPlaying, store]);
  
  // Control functions
  const togglePlay = () => {
    if (!audioRef.current) {
      console.warn(`No audio element for ${articleId}`);
      return;
    }
    
    console.log(`Toggle play called for ${articleId}, current paused state:`, audioRef.current.paused);
    
    if (audioRef.current.paused) {
      // Stop any other audio first
      if (store.audioElement && store.audioElement !== audioRef.current) {
        console.log(`Stopping other audio before playing ${articleId}`);
        store.stopCurrentAudio();
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
    store.setCurrentTime(time);
  };

  const setVolumeControl = (newVolume: number) => {
    if (!audioRef.current) return;
    console.log(`Setting volume to ${newVolume} for ${articleId}`);
    audioRef.current.volume = newVolume;
    setVolume(newVolume);
    store.setVolume(newVolume);
  };

  const setPlaybackSpeedControl = (speed: number) => {
    if (!audioRef.current) return;
    console.log(`Setting playback speed to ${speed} for ${articleId}`);
    audioRef.current.playbackRate = speed;
    setPlaybackSpeed(speed);
    store.setPlaybackSpeed(speed);
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
