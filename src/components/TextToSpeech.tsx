
import { useState, useRef } from "react";
import { Volume2, VolumeX, Pause, Play, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TextToSpeechProps {
  text: string;
  label?: string;
  tooltipText?: string;
  compact?: boolean;
}

export const TextToSpeech = ({
  text,
  label = "Narrar",
  tooltipText = "Narrar texto",
  compact = false,
}: TextToSpeechProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [rate, setRate] = useState(1);
  const audioRef = useRef<SpeechSynthesisUtterance | null>(null);

  const togglePlay = () => {
    if (!audioRef.current) {
      // Initialize speech synthesis
      audioRef.current = new SpeechSynthesisUtterance(text);
      audioRef.current.lang = "pt-BR";
      audioRef.current.rate = rate;
      
      // Set up event listeners
      audioRef.current.onend = () => {
        setIsPlaying(false);
      };
      audioRef.current.onerror = () => {
        setIsPlaying(false);
      };
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      // Update the rate in case it changed
      if (audioRef.current) {
        audioRef.current.rate = rate;
      }
      window.speechSynthesis.speak(audioRef.current);
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 1 : 0;
    }
  };

  const changeRate = (newRate: number) => {
    setRate(newRate);
    if (audioRef.current) {
      audioRef.current.rate = newRate;
      if (isPlaying) {
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(audioRef.current);
      }
    }
  };

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={togglePlay}
              variant="outline"
              size={compact ? "sm" : "default"}
              className={`flex gap-1 items-center ${compact ? "h-7 px-2 text-xs rounded-full" : ""} bg-gray-800 border-gray-700 hover:bg-gray-700`}
            >
              {isPlaying ? (
                <Pause className={`${compact ? "h-3.5 w-3.5" : "h-4 w-4"}`} />
              ) : (
                <Play className={`${compact ? "h-3.5 w-3.5" : "h-4 w-4"}`} />
              )}
              {!compact && <span>{label}</span>}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isPlaying ? "Pausar" : tooltipText}</p>
          </TooltipContent>
        </Tooltip>

        {isPlaying && !compact && (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={toggleMute}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                >
                  {isMuted ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isMuted ? "Ativar som" : "Desativar som"}</p>
              </TooltipContent>
            </Tooltip>

            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Velocidade de narração</p>
                </TooltipContent>
              </Tooltip>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => changeRate(0.7)}>
                  Lenta
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeRate(1)}>
                  Normal
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeRate(1.5)}>
                  Rápida
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeRate(2)}>
                  Muito rápida
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
      </div>
    </TooltipProvider>
  );
};

export default TextToSpeech;
