
import { create } from 'zustand';

export interface AudioPlayerState {
  // Current playback state
  currentAudioId: string;
  isPlaying: boolean;
  isMinimized: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playbackSpeed: number;
  
  // Audio element reference
  audioElement: HTMLAudioElement | null;
  
  // Article information
  articleInfo: {
    articleId: string;
    articleNumber?: string;
    codeId?: string;
    audioUrl: string;
    codeTitle?: string;
  } | null;
  
  // Playback history and preferences
  playbackHistory: string[];
  userPreferences: {
    defaultVolume: number;
    defaultSpeed: number;
    autoPlay: boolean;
  };
  
  // Actions
  setCurrentAudio: (audioId: string, articleInfo: NonNullable<AudioPlayerState['articleInfo']>) => void;
  setPlaybackState: (isPlaying: boolean) => void;
  setMinimized: (minimized: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  setPlaybackSpeed: (speed: number) => void;
  setAudioElement: (element: HTMLAudioElement | null) => void;
  stopCurrentAudio: () => void;
  addToHistory: (audioId: string) => void;
  updatePreferences: (preferences: Partial<AudioPlayerState['userPreferences']>) => void;
}

export const useAudioPlayerStore = create<AudioPlayerState>((set, get) => ({
  // Initial state
  currentAudioId: '',
  isPlaying: false,
  isMinimized: false,
  currentTime: 0,
  duration: 0,
  volume: 0.8,
  playbackSpeed: 1,
  audioElement: null,
  articleInfo: null,
  playbackHistory: [],
  userPreferences: {
    defaultVolume: 0.8,
    defaultSpeed: 1,
    autoPlay: false
  },
  
  // Actions
  setCurrentAudio: (audioId, articleInfo) => set({
    currentAudioId: audioId,
    articleInfo,
    currentTime: 0
  }),
  
  setPlaybackState: (isPlaying) => {
    set({ isPlaying });
    if (isPlaying) {
      const { currentAudioId } = get();
      get().addToHistory(currentAudioId);
    }
  },
  
  setMinimized: (minimized) => set({ isMinimized: minimized }),
  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration }),
  setVolume: (volume) => set({ volume }),
  setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),
  setAudioElement: (element) => set({ audioElement: element }),
  
  stopCurrentAudio: () => {
    const { audioElement } = get();
    if (audioElement && !audioElement.paused) {
      audioElement.pause();
      audioElement.currentTime = 0;
    }
    set({
      currentAudioId: '',
      isPlaying: false,
      audioElement: null,
      isMinimized: false,
      articleInfo: null,
      currentTime: 0
    });
  },
  
  addToHistory: (audioId) => {
    if (!audioId) return;
    const { playbackHistory } = get();
    const newHistory = [audioId, ...playbackHistory.filter(id => id !== audioId)].slice(0, 20);
    set({ playbackHistory: newHistory });
  },
  
  updatePreferences: (preferences) => set(state => ({
    userPreferences: { ...state.userPreferences, ...preferences }
  }))
}));
