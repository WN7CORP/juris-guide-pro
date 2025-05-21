
import { useState, useEffect } from "react";
import { ArrowLeft, BookOpen, Download, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LegalArticle } from "@/services/legalCodeService";
import { globalAudioState } from "@/components/AudioCommentPlaylist";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { formatTime } from "@/utils/formatters";

interface AudioFocusModeProps {
  article: LegalArticle;
  codeTitle: string;
  onBack: () => void;
}

export const AudioFocusMode = ({
  article,
  codeTitle,
  onBack
}: AudioFocusModeProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audioElement = globalAudioState.audioElement;
    if (!audioElement) return;

    // Initial values
    setIsPlaying(!audioElement.paused);
    setCurrentTime(audioElement.currentTime || 0);
    setDuration(audioElement.duration || 0);

    // Set up event listeners
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => setCurrentTime(audioElement.currentTime || 0);
    const handleDurationChange = () => setDuration(audioElement.duration || 0);
    const handleEnded = () => setIsPlaying(false);

    audioElement.addEventListener('play', handlePlay);
    audioElement.addEventListener('pause', handlePause);
    audioElement.addEventListener('timeupdate', handleTimeUpdate);
    audioElement.addEventListener('durationchange', handleDurationChange);
    audioElement.addEventListener('ended', handleEnded);

    return () => {
      audioElement.removeEventListener('play', handlePlay);
      audioElement.removeEventListener('pause', handlePause);
      audioElement.removeEventListener('timeupdate', handleTimeUpdate);
      audioElement.removeEventListener('durationchange', handleDurationChange);
      audioElement.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    if (!globalAudioState.audioElement) return;
    
    if (globalAudioState.audioElement.paused) {
      globalAudioState.audioElement.play();
      globalAudioState.isPlaying = true;
    } else {
      globalAudioState.audioElement.pause();
      globalAudioState.isPlaying = false;
    }
  };
  
  const seekAudio = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!globalAudioState.audioElement) return;
    
    const newTime = parseFloat(e.target.value);
    globalAudioState.audioElement.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleDownload = () => {
    if (!article.comentario_audio) return;
    
    const a = document.createElement('a');
    a.href = article.comentario_audio;
    a.download = `comentario-${codeTitle.toLowerCase().replace(/\s+/g, '-')}-art-${article.numero || 'sem-numero'}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    toast.success("Download do comentário em áudio iniciado");
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Comentário Art. ${article.numero || 'sem número'} - ${codeTitle}`,
          text: `Ouça o comentário em áudio do Art. ${article.numero || 'sem número'} do ${codeTitle}.`,
          url: window.location.href,
        });
        toast.success("Compartilhado com sucesso");
      } catch (err) {
        console.error('Erro ao compartilhar:', err);
      }
    } else {
      toast.info("Compartilhamento não disponível neste navegador");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900/80 backdrop-blur-md rounded-lg border border-gray-800 p-5 mb-6"
    >
      <div className="flex justify-between items-center mb-4">
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center gap-1 text-gray-300"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Voltar à lista</span>
        </Button>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleDownload}
            className="text-gray-300 hover:text-white"
          >
            <Download className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleShare}
            className="text-gray-300 hover:text-white"
          >
            <Share2 className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      <div className="mb-4 text-center">
        <h2 className="text-lg font-medium text-law-accent mb-1 flex items-center justify-center gap-1">
          <BookOpen className="h-5 w-5" />
          {codeTitle}
        </h2>
        <h3 className="text-2xl font-serif font-medium">
          Art. {article.numero || "Sem número"}
        </h3>
      </div>
      
      <div className="bg-gray-800/50 border border-gray-700 rounded-md p-4 mb-6 text-white">
        {article.artigo?.split('\n').map((paragraph, i) => (
          <p key={i} className="mb-2 last:mb-0 leading-relaxed">{paragraph}</p>
        ))}
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between text-sm text-gray-400">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
        
        <input 
          type="range"
          min={0}
          max={duration || 0}
          value={currentTime}
          onChange={seekAudio}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          style={{
            backgroundSize: `${(currentTime / (duration || 1)) * 100}% 100%`,
            backgroundImage: 'linear-gradient(to right, #3b82f6, #1d4ed8)'
          }}
        />
        
        <div className="flex justify-center">
          <Button 
            variant="outline"
            size="lg"
            className={`rounded-full h-16 w-16 ${isPlaying ? 'bg-law-accent text-white border-law-accent' : 'border-law-accent text-law-accent'}`}
            onClick={togglePlay}
          >
            {isPlaying ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default AudioFocusMode;
