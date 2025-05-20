
import { create } from 'zustand';

interface AudioState {
  currentAudioId: string;
  isPlaying: boolean;
  audioElement: HTMLAudioElement | null;
  minimalPlayerInfo: {
    articleId: string;
    articleNumber?: string;
    codeId: string;
    audioUrl: string;
  } | null;
  
  // Actions
  playAudio: (id: string, audioElement: HTMLAudioElement) => void;
  pauseAudio: () => void;
  stopAudio: () => void;
  setMinimalPlayerInfo: (info: { 
    articleId: string;
    articleNumber?: string;
    codeId: string;
    audioUrl: string;
  }) => void;
}

export const useAudioStore = create<AudioState>((set) => ({
  currentAudioId: '',
  isPlaying: false,
  audioElement: null,
  minimalPlayerInfo: null,
  
  playAudio: (id, audioElement) => set({
    currentAudioId: id,
    audioElement,
    isPlaying: true
  }),
  
  pauseAudio: () => {
    set(state => {
      if (state.audioElement && !state.audioElement.paused) {
        state.audioElement.pause();
      }
      return { isPlaying: false };
    });
  },
  
  stopAudio: () => {
    set(state => {
      if (state.audioElement) {
        state.audioElement.pause();
        state.audioElement.currentTime = 0;
      }
      return { 
        isPlaying: false,
        currentAudioId: '',
        audioElement: null
      };
    });
  },
  
  setMinimalPlayerInfo: (info) => set({ minimalPlayerInfo: info })
}));
