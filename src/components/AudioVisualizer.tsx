
import { useState, useEffect, useRef } from 'react';
import { cn } from "@/lib/utils";

interface AudioVisualizerProps {
  audioUrl: string;
  isPlaying: boolean;
  className?: string;
}

const AudioVisualizer = ({ audioUrl, isPlaying, className }: AudioVisualizerProps) => {
  const [visualization, setVisualization] = useState<number[]>(Array(20).fill(2));
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!audioUrl) return;
    
    // Create audio context and analyzer only once
    const setupAudio = async () => {
      try {
        if (!audioRef.current) {
          const audio = new Audio();
          audio.crossOrigin = "anonymous";
          audio.src = audioUrl;
          audio.preload = "metadata";
          audio.volume = 0;
          audioRef.current = audio;
          
          // Load metadata
          await new Promise((resolve) => {
            audio.addEventListener('loadedmetadata', resolve, { once: true });
            audio.addEventListener('error', (e) => {
              console.error("Audio load error:", e);
              resolve(null);
            }, { once: true });
          });
        }

        if (!analyserRef.current && audioRef.current) {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const source = audioContext.createMediaElementSource(audioRef.current);
          const analyser = audioContext.createAnalyser();
          analyser.fftSize = 64;
          
          source.connect(analyser);
          analyser.connect(audioContext.destination);
          analyserRef.current = analyser;
        }
      } catch (error) {
        console.error("Error setting up audio analyzer:", error);
      }
    };
    
    setupAudio();
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, [audioUrl]);

  // Update visualization based on play state
  useEffect(() => {
    if (!analyserRef.current || !audioRef.current) return;
    
    const updateVisualization = () => {
      if (!analyserRef.current) return;
      
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyserRef.current.getByteFrequencyData(dataArray);
      
      // Sample the frequency data to get 20 points
      const sampleStep = Math.floor(bufferLength / 20);
      const visualData = Array(20).fill(0).map((_, i) => {
        const index = i * sampleStep;
        return dataArray[index] / 128.0 * 30;
      });
      
      setVisualization(visualData);
      animationFrameRef.current = requestAnimationFrame(updateVisualization);
    };
    
    if (isPlaying) {
      // If we need to start or restart the audio
      if (audioRef.current.paused) {
        audioRef.current.currentTime = 0;
        audioRef.current.volume = 0; // Mute since we're just using for visualization
        
        const playPromise = audioRef.current.play();
        if (playPromise) {
          playPromise.catch(error => {
            console.error("Error playing audio for visualization:", error);
          });
        }
      }
      
      updateVisualization();
    } else {
      // Stop visualization
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      // Generate fake random visualization for idle state
      const idlePattern = Array(20).fill(0).map(() => Math.random() * 5 + 2);
      setVisualization(idlePattern);
      
      if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
      }
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, audioUrl]);

  return (
    <div className={cn("flex justify-center items-end h-12 gap-0.5", className)}>
      {visualization.map((value, index) => (
        <div
          key={index}
          className={cn(
            "w-1 bg-law-accent/70 rounded-t transition-all duration-150",
            isPlaying ? "animate-pulse" : ""
          )}
          style={{ 
            height: `${Math.max(2, value)}px`,
            opacity: isPlaying ? 0.8 : 0.3
          }}
        />
      ))}
    </div>
  );
};

export default AudioVisualizer;
