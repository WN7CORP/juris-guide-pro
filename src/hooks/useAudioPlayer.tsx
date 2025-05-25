import { useState, useEffect, useRef } from "react";
import { globalAudioState } from "@/components/AudioCommentPlaylist";
import { UseAudioPlayerOptions, UseAudioPlayerReturn } from "./audio/types";
import { createAudioEventHandlers } from "./audio/audioEventHandlers";
import { createAudioControls } from "./audio/audioControls";
import { useAudioStateSynchronizer } from "./audio/audioStateSynchronizer";

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
  const timeUpdateIntervalRef = useRef<number>();
  const hasAutoPlayedRef = useRef(false);
  
  // Use the state synchronizer
  useAudioStateSynchronizer(
    articleId,
    audioRef,
    setIsPlaying,
    setCurrentTime,
    setDuration,
    timeUpdateIntervalRef
  );
  
  useEffect(() => {
    if (!audioUrl) return;
    
    // Create audio element if it doesn't exist
    if (!audioRef.current) {
      const audio = new Audio(audioUrl);
      
      // Create event handlers
      const {
        handlePlay,
        handlePause,
        handleTimeUpdate,
        handleLoadedMetadata,
        handleCanPlayThrough,
        handleEnded,
        handleError
      } = createAudioEventHandlers(
        articleId,
        setIsPlaying,
        setCurrentTime,
        setDuration,
        setIsReady,
        setError,
        timeUpdateIntervalRef,
        onEnded
      );
      
      // Set up event listeners
      audio.addEventListener('play', handlePlay(audio));
      audio.addEventListener('pause', handlePause);
      audio.addEventListener('timeupdate', handleTimeUpdate(audio));
      audio.addEventListener('loadedmetadata', handleLoadedMetadata(audio));
      audio.addEventListener('canplaythrough', handleCanPlayThrough);
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('error', handleError);
      
      audioRef.current = audio;
      
      // Clean up on unmount
      return () => {
        if (timeUpdateIntervalRef.current) {
          clearInterval(timeUpdateIntervalRef.current);
        }
        
        audio.removeEventListener('play', handlePlay(audio));
        audio.removeEventListener('pause', handlePause);
        audio.removeEventListener('timeupdate', handleTimeUpdate(audio));
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata(audio));
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
  
  // Create control functions
  const { togglePlay, seek, setVolume: setAudioVolume, setPlaybackSpeed: setAudioPlaybackSpeed } = createAudioControls(
    articleId,
    articleNumber,
    codeId,
    audioUrl,
    audioRef,
    setIsPlaying,
    setError
  );
  
  // Update local volume state when changed
  const handleVolumeChange = (newVolume: number) => {
    setAudioVolume(newVolume);
    setVolume(newVolume);
  };
  
  // Update local playback speed state when changed
  const handlePlaybackSpeedChange = (speed: number) => {
    setAudioPlaybackSpeed(speed);
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
    setVolume: handleVolumeChange,
    setPlaybackSpeed: handlePlaybackSpeedChange
  };
};

export default useAudioPlayer;
