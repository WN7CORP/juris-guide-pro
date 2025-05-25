
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ALargeSmall, Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface FontSizeControlProps {
  onIncrease: () => void;
  onDecrease: () => void;
  currentSize: number;
  minSize: number;
  maxSize: number;
}

export const FontSizeControl = ({
  onIncrease,
  onDecrease,
  currentSize,
  minSize,
  maxSize
}: FontSizeControlProps) => {
  const [isVisible, setIsVisible] = useState(false);

  // Show the controls after a small delay for a nice entrance effect
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div 
      className={cn(
        "fixed left-4 bottom-4 z-20 transition-all duration-500 transform",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}
    >
      <TooltipProvider>
        <div className="flex flex-col gap-2 p-2 rounded-2xl bg-gray-900/95 backdrop-blur-md shadow-2xl border border-gray-700/50 ring-1 ring-white/10">
          {/* Font size indicator */}
          <div className="flex items-center justify-center px-3 py-1 rounded-xl bg-gray-800/60 border border-gray-600/30">
            <ALargeSmall className="h-4 w-4 text-gray-300 mr-2" />
            <span className="text-xs font-medium text-gray-300 min-w-[2ch] text-center">
              {currentSize}
            </span>
          </div>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                className="h-10 w-10 p-0 rounded-xl bg-gray-800/60 hover:bg-gray-700/80 border border-gray-600/30 hover:border-gray-500/50 text-gray-300 hover:text-white transition-all duration-200 hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
                onClick={onIncrease}
                disabled={currentSize >= maxSize}
                aria-label="Aumentar tamanho da fonte"
              >
                <Plus className="h-5 w-5" strokeWidth={2.5} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-gray-800 border-gray-600 text-white">
              <p className="font-medium">Aumentar fonte</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                className="h-10 w-10 p-0 rounded-xl bg-gray-800/60 hover:bg-gray-700/80 border border-gray-600/30 hover:border-gray-500/50 text-gray-300 hover:text-white transition-all duration-200 hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
                onClick={onDecrease}
                disabled={currentSize <= minSize}
                aria-label="Diminuir tamanho da fonte"
              >
                <Minus className="h-5 w-5" strokeWidth={2.5} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-gray-800 border-gray-600 text-white">
              <p className="font-medium">Diminuir fonte</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  );
};

export default FontSizeControl;
