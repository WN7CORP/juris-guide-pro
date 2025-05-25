
import { useState, useEffect, useRef } from "react";
import { globalAudioState } from "@/components/AudioCommentPlaylist";

export interface UseAudioPlayerOptions {
  articleId: string;
  articleNumber?: string;
  codeId?: string;
  audioUrl: string;
  onEnded?: () => void;
}

export const useAudioPlayer = ({
  articleId,
  articleNumber,
  codeId,
  audioUrl,
  onEnded
}: UseAudioPlayerOptions) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timeUpdateIntervalRef = useRef<number>();
  
  useEffect(() => {
    // Check if this article is currently playing in the global audio state
    const checkCurrentAudio = () => {
      const isCurrentlyPlaying = globalAudioState.currentAudioId === articleId;
      setIsPlaying(isCurrentlyPlaying);
      
      // If the global audio element exists and it's this article, update our reference
      if (isCurrentlyPlaying && globalAudioState.audioElement) {
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
    
    // Set up interval to check global audio state
    const checkInterval = setInterval(checkCurrentAudio, 200);
    
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
        setIsPlaying(true);
        // Start time update interval
        timeUpdateIntervalRef.current = window.setInterval(() => {
          if (audio && !audio.paused) {
            setCurrentTime(audio.currentTime);
            setDuration(audio.duration || 0);
          }
        }, 100);
      };
      
      const handlePause = () => {
        setIsPlaying(false);
        // Clear interval when paused
        if (timeUpdateIntervalRef.current) {
          clearInterval(timeUpdateIntervalRef.current);
          timeUpdateIntervalRef.current = undefined;
        }
      };
      
      const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
      const handleLoadedMetadata = () => setDuration(audio.duration);
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
  
  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (audioRef.current.paused) {
      // First, stop any currently playing audio globally
      globalAudioState.stopCurrentAudio();
      
      // Then play this audio
      audioRef.current.play();
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
    } else {
      audioRef.current.pause();
      globalAudioState.isPlaying = false;
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
    audioElement: audioRef.current,
    togglePlay,
    seek,
    setVolume: setAudioVolume,
    setPlaybackSpeed: setAudioPlaybackSpeed
  };
};

export default useAudioPlayer;
