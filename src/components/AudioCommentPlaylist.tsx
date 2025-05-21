
// Global state for audio playback across the application
interface MinimalPlayerInfo {
  articleId: string;
  articleNumber?: string;
  codeId: string;
  audioUrl: string;
}

interface GlobalAudioState {
  audioElement: HTMLAudioElement | null;
  currentAudioId: string;
  isPlaying: boolean;
  minimalPlayerInfo: MinimalPlayerInfo | null;
  
  // Method to stop any currently playing audio
  stopCurrentAudio: () => void;
}

// Initialize global audio state
export const globalAudioState: GlobalAudioState = {
  audioElement: null,
  currentAudioId: "",
  isPlaying: false,
  minimalPlayerInfo: null,
  
  // Stop any currently playing audio before starting a new one
  stopCurrentAudio: () => {
    if (globalAudioState.audioElement && !globalAudioState.audioElement.paused) {
      globalAudioState.audioElement.pause();
      globalAudioState.audioElement.currentTime = 0;
      globalAudioState.isPlaying = false;
    }
  }
};
