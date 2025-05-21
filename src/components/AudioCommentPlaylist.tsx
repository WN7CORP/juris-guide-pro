
// Create a global state for audio management across the application
export const globalAudioState = {
  audioElement: null as HTMLAudioElement | null,
  currentAudioId: "",
  isPlaying: false,
  minimalPlayerInfo: null as {
    articleId: string;
    articleNumber?: string;
    codeId?: string;
    audioUrl: string;
  } | null,
  
  stopCurrentAudio() {
    if (this.audioElement && !this.audioElement.paused) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
      this.isPlaying = false;
    }
  }
};

export default globalAudioState;
