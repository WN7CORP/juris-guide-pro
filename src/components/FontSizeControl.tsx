
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Type, Plus, Minus } from "lucide-react";
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
        "fixed left-4 bottom-28 md:bottom-16 z-20 transition-all duration-500 transform",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}
    >
      <TooltipProvider>
        <div className="font-size-controls">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="font-control-button"
                onClick={onIncrease}
                disabled={currentSize >= maxSize}
                aria-label="Aumentar tamanho da fonte"
              >
                <Type className="h-4 w-4" />
                <Plus className="h-3 w-3 absolute right-2 bottom-1" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-gray-900 text-white border-gray-700">
              <p>Aumentar fonte</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="font-control-button" 
                onClick={onDecrease}
                disabled={currentSize <= minSize}
                aria-label="Diminuir tamanho da fonte"
              >
                <Type className="h-4 w-4" />
                <Minus className="h-3 w-3 absolute right-2 bottom-1" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-gray-900 text-white border-gray-700">
              <p>Diminuir fonte</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  );
};

export default FontSizeControl;
