
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Plus, Minus } from "lucide-react";
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
        "fixed left-4 bottom-4 z-20 flex flex-col gap-1 transition-all duration-500 transform",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}
    >
      <TooltipProvider>
        <div className="flex flex-col gap-1 p-2 rounded-lg bg-gray-900/60 backdrop-blur-sm shadow-lg border border-gray-700/30">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-8 w-8 rounded-lg bg-gray-700/40 hover:bg-gray-600/60 text-gray-300 hover:text-white shadow-sm transition-all duration-200 hover:scale-105 flex items-center justify-center"
                onClick={onIncrease}
                disabled={currentSize >= maxSize}
                aria-label="Aumentar tamanho da fonte"
              >
                <Plus className="h-4 w-4" strokeWidth={2} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Aumentar fonte</p>
            </TooltipContent>
          </Tooltip>
          
          <div className="text-center px-1">
            <span className="text-[10px] text-gray-400 font-medium bg-gray-800/40 px-1.5 py-0.5 rounded-sm">
              {currentSize}px
            </span>
          </div>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-8 w-8 rounded-lg bg-gray-700/40 hover:bg-gray-600/60 text-gray-300 hover:text-white shadow-sm transition-all duration-200 hover:scale-105 flex items-center justify-center" 
                onClick={onDecrease}
                disabled={currentSize <= minSize}
                aria-label="Diminuir tamanho da fonte"
              >
                <Minus className="h-4 w-4" strokeWidth={2} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Diminuir fonte</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  );
};

export default FontSizeControl;
