
import { useState } from "react";
import { Info, BookText, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ArticleExplanationOptionsProps {
  hasTecnica: boolean;
  hasFormal: boolean;
  hasExemplo: boolean;
  onOptionClick: (optionType: string) => void;
}

export const ArticleExplanationOptions = ({ 
  hasTecnica, 
  hasFormal, 
  hasExemplo, 
  onOptionClick 
}: ArticleExplanationOptionsProps) => {
  const [open, setOpen] = useState(false);

  const handleClick = (type: string) => {
    onOptionClick(type);
    setOpen(false);
  };

  if (!hasTecnica && !hasFormal && !hasExemplo) {
    return null;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="text-xs flex gap-1 h-7 px-2.5 rounded-full bg-gray-800/60 border-gray-700 hover:bg-gray-700"
        >
          <Info className="h-3.5 w-3.5" />
          <span>Explicações</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-60 p-2 bg-netflix-dark border border-gray-800 animate-in fade-in-50 zoom-in-95 duration-200">
        <div className="flex flex-col gap-1">
          {hasTecnica && (
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center justify-start gap-2 text-sm rounded-md p-2 hover:bg-gray-800/80"
              onClick={() => handleClick('explanation')}
            >
              <Info className="h-4 w-4 text-law-accent" />
              <span>Explicação Técnica</span>
            </Button>
          )}
          {hasFormal && (
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center justify-start gap-2 text-sm rounded-md p-2 hover:bg-gray-800/80"
              onClick={() => handleClick('formal')}
            >
              <BookText className="h-4 w-4 text-law-accent" />
              <span>Explicação Formal</span>
            </Button>
          )}
          {hasExemplo && (
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center justify-start gap-2 text-sm rounded-md p-2 hover:bg-gray-800/80"
              onClick={() => handleClick('example')}
            >
              <BookOpen className="h-4 w-4 text-law-accent" />
              <span>Exemplo Prático</span>
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ArticleExplanationOptions;
