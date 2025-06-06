
import React from "react";
import { LegalArticle } from "@/services/legalCodeService";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { Play, Pause } from "lucide-react";

// Create a global state for audio management across the application
export const globalAudioState = {
  audioElement: null as HTMLAudioElement | null,
  currentAudioId: "",
  isPlaying: false,
  isMinimized: false, // New property to track minimized state
  minimalPlayerInfo: null as {
    articleId: string;
    articleNumber?: string;
    codeId?: string;
    audioUrl: string;
  } | null,
  
  stopCurrentAudio() {
    console.log(`Stopping current audio. Current ID: ${this.currentAudioId}, isPlaying: ${this.isPlaying}`);
    
    if (this.audioElement && !this.audioElement.paused) {
      console.log(`Pausing audio element`);
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
    }
    
    // Force clear all state
    this.currentAudioId = "";
    this.isPlaying = false;
    this.audioElement = null;
    this.isMinimized = false;
    this.minimalPlayerInfo = null;
    
    console.log(`Audio state cleared completely`);
  }
};

interface AudioCommentPlaylistProps {
  articlesMap: Record<string, LegalArticle[]>;
  onArticleSelect?: (article: LegalArticle) => void;
}

const AudioCommentPlaylist: React.FC<AudioCommentPlaylistProps> = ({ 
  articlesMap,
  onArticleSelect
}) => {
  const handleArticleSelect = (article: LegalArticle, codeId: string) => {
    if (onArticleSelect) {
      onArticleSelect(article);
    }
  };

  return (
    <div className="space-y-4">
      {Object.entries(articlesMap).map(([codeId, articles]) => (
        <div key={codeId} className="space-y-2">
          {articles.map((article) => {
            // Only proceed if the article has an audio comment
            if (!article.comentario_audio) return null;
            
            const audioUrl = article.comentario_audio;
            const articleId = article.id?.toString() || "";
            const articleNumber = article.numero?.toString();
            const isCurrentlyPlaying = globalAudioState.currentAudioId === articleId;
            
            return (
              <div 
                key={articleId}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  isCurrentlyPlaying 
                    ? 'bg-law-accent/30 border border-law-accent/50' 
                    : 'bg-gray-800/50 border border-gray-700 hover:bg-gray-800'
                }`}
                onClick={() => handleArticleSelect(article, codeId)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <div className="font-medium text-law-accent">
                      {articleNumber ? <><strong>Art. {articleNumber}</strong></> : 'Artigo'}
                    </div>
                    <div className="text-sm text-gray-300 line-clamp-2">
                      {article.artigo}
                    </div>
                  </div>
                  
                  <div className={`flex items-center justify-center rounded-full w-8 h-8 ${
                    isCurrentlyPlaying ? 'bg-law-accent/30' : 'bg-gray-700'
                  }`}>
                    {isCurrentlyPlaying ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default AudioCommentPlaylist;
