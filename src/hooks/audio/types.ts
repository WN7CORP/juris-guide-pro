
export interface UseAudioPlayerOptions {
  articleId: string;
  articleNumber?: string;
  codeId?: string;
  audioUrl: string;
  autoPlay?: boolean;
  onEnded?: () => void;
}

export interface AudioPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playbackSpeed: number;
  error: string | null;
  isReady: boolean;
  audioElement: HTMLAudioElement | null;
}

export interface AudioPlayerControls {
  togglePlay: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  setPlaybackSpeed: (speed: number) => void;
}

export type UseAudioPlayerReturn = AudioPlayerState & AudioPlayerControls;
