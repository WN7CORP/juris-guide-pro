
import { useState, useEffect, useRef } from "react";
import { globalAudioState } from "@/components/AudioCommentPlaylist";

export interface UseAudioPlayerOptions {
  articleId: string;
  articleNumber?: string;
  codeId?: string;
  audioUrl: string;
  autoPlay?: boolean;
  onEnded?: () => void;
}

export const useAudioPlayer = ({
  articleId,
  articleNumber,
  codeId,
  audioUrl,
  autoPlay = false,
  onEnded
}: UseAudioPlayerOptions) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timeUpdateIntervalRef = useRef<number>();
  const hasAutoPlayedRef = useRef(false);
  
  useEffect(() => {
    // Check if this article is currently playing in the global audio state
    const checkCurrentAudio = () => {
      const isCurrentlyPlaying = globalAudioState.currentAudioId === articleId && globalAudioState.isPlaying;
      
      // Update state immediately when it changes
      setIsPlaying(isCurrentlyPlaying);
      
      // If the global audio element exists and it's this article, update our reference
      if (globalAudioState.currentAudioId === articleId && globalAudioState.audioElement) {
        audioRef.current = globalAudioState.audioElement;
        setCurrentTime(audioRef.current.currentTime || 0);
        setDuration(audioRef.current.duration || 0);
        
        // Start our own time update interval for this component
        if (!timeUpdateIntervalRef.current && !audioRef.current.paused) {
          timeUpdateIntervalRef.current = window.setInterval(() => {
            if (audioRef.current && !audioRef.current.paused) {
              setCurrentTime(audioRef.current.currentTime || 0);
              setDuration(audioRef.current.duration || 0);
            }
          }, 100);
        }
      } else if (timeUpdateIntervalRef.current) {
        // Clear interval if this article is not playing
        clearInterval(timeUpdateIntervalRef.current);
        timeUpdateIntervalRef.current = undefined;
      }
    };
    
    // Initial check
    checkCurrentAudio();
    
    // Set up interval to check global audio state more frequently for better responsiveness
    const checkInterval = setInterval(checkCurrentAudio, 50);
    
    return () => {
      clearInterval(checkInterval);
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current);
      }
    };
  }, [articleId]);
  
  useEffect(() => {
    if (!audioUrl) return;
    
    // Create audio element if it doesn't exist
    if (!audioRef.current) {
      const audio = new Audio(audioUrl);
      
      // Set up event listeners
      const handlePlay = () => {
        console.log(`Audio PLAY event for article ${articleId}`);
        setIsPlaying(true);
        globalAudioState.isPlaying = true;
        
        // Start time update interval
        timeUpdateIntervalRef.current = window.setInterval(() => {
          if (audio && !audio.paused) {
            setCurrentTime(audio.currentTime);
            setDuration(audio.duration || 0);
          }
        }, 100);
      };
      
      const handlePause = () => {
        console.log(`Audio PAUSE event for article ${articleId}`);
        setIsPlaying(false);
        globalAudioState.isPlaying = false;
        
        // Clear interval when paused
        if (timeUpdateIntervalRef.current) {
          clearInterval(timeUpdateIntervalRef.current);
          timeUpdateIntervalRef.current = undefined;
        }
      };
      
      const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
      
      const handleLoadedMetadata = () => {
        setDuration(audio.duration);
        setIsReady(true);
      };
      
      const handleCanPlayThrough = () => {
        setIsReady(true);
      };
      
      const handleEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
        
        // Clear interval when ended
        if (timeUpdateIntervalRef.current) {
          clearInterval(timeUpdateIntervalRef.current);
          timeUpdateIntervalRef.current = undefined;
        }
        
        // Reset global state
        globalAudioState.currentAudioId = "";
        globalAudioState.isPlaying = false;
        
        // Call onEnded callback if provided
        if (onEnded) onEnded();
      };
      
      const handleError = (e: any) => {
        console.error(`Audio error for article ${articleId}:`, e);
        setIsPlaying(false);
        setError("Erro ao reproduzir áudio");
        
        // Clear interval on error
        if (timeUpdateIntervalRef.current) {
          clearInterval(timeUpdateIntervalRef.current);
          timeUpdateIntervalRef.current = undefined;
        }
        
        // Reset global state on error
        globalAudioState.currentAudioId = "";
        globalAudioState.isPlaying = false;
      };
      
      audio.addEventListener('play', handlePlay);
      audio.addEventListener('pause', handlePause);
      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.addEventListener('canplaythrough', handleCanPlayThrough);
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('error', handleError);
      
      audioRef.current = audio;
      
      // Clean up on unmount
      return () => {
        if (timeUpdateIntervalRef.current) {
          clearInterval(timeUpdateIntervalRef.current);
        }
        
        audio.removeEventListener('play', handlePlay);
        audio.removeEventListener('pause', handlePause);
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.removeEventListener('canplaythrough', handleCanPlayThrough);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('error', handleError);
        
        // Pause audio if it's playing and it's this article
        if (!audio.paused && globalAudioState.currentAudioId === articleId) {
          audio.pause();
          globalAudioState.currentAudioId = "";
          globalAudioState.isPlaying = false;
        }
      };
    }
  }, [articleId, audioUrl, onEnded]);

  // Handle autoPlay when audio is ready
  useEffect(() => {
    if (autoPlay && isReady && !hasAutoPlayedRef.current && audioRef.current) {
      hasAutoPlayedRef.current = true;
      
      // Small delay to ensure everything is ready
      const timer = setTimeout(() => {
        if (audioRef.current && audioRef.current.paused) {
          // First, stop any currently playing audio globally
          globalAudioState.stopCurrentAudio();
          
          // Then play this audio
          audioRef.current.play().then(() => {
            globalAudioState.audioElement = audioRef.current;
            globalAudioState.currentAudioId = articleId;
            globalAudioState.isPlaying = true;
            
            // Update minimal player info
            globalAudioState.minimalPlayerInfo = {
              articleId,
              articleNumber,
              codeId,
              audioUrl
            };
          }).catch(error => {
            console.error("AutoPlay failed:", error);
            setError("Erro ao reproduzir áudio automaticamente");
          });
        }
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, [autoPlay, isReady, articleId, articleNumber, codeId, audioUrl]);
  
  const togglePlay = () => {
    if (!audioRef.current) return;
    
    console.log(`Toggle play called for article ${articleId}, current paused state:`, audioRef.current.paused);
    
    if (audioRef.current.paused) {
      // First, stop any currently playing audio globally
      globalAudioState.stopCurrentAudio();
      
      // Then play this audio
      console.log(`Starting play for article ${articleId}`);
      audioRef.current.play().then(() => {
        globalAudioState.audioElement = audioRef.current;
        globalAudioState.currentAudioId = articleId;
        globalAudioState.isPlaying = true;
        setIsPlaying(true);
        
        // Update minimal player info
        globalAudioState.minimalPlayerInfo = {
          articleId,
          articleNumber,
          codeId,
          audioUrl
        };
      }).catch(error => {
        console.error("Play failed:", error);
        setError("Erro ao reproduzir áudio");
      });
    } else {
      console.log(`Pausing audio for article ${articleId}`);
      audioRef.current.pause();
      globalAudioState.isPlaying = false;
      setIsPlaying(false);
    }
  };
  
  const seek = (time: number) => {
    if (!audioRef.current) return;
    
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };
  
  const setAudioVolume = (newVolume: number) => {
    if (!audioRef.current) return;
    
    audioRef.current.volume = newVolume;
    setVolume(newVolume);
  };
  
  const setAudioPlaybackSpeed = (speed: number) => {
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
    setVolume: setAudioVolume,
    setPlaybackSpeed: setAudioPlaybackSpeed
  };
};

export default useAudioPlayer;
