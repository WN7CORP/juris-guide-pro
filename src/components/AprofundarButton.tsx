
import { useState } from "react";
import { ChevronDown, Info, FileText, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AprofundarButtonProps {
  hasTecnica: boolean;
  hasFormal: boolean;
  hasExemplo: boolean;
  onSelectTecnica: () => void;
  onSelectFormal: () => void;
  onSelectExemplo: () => void;
}

const AprofundarButton = ({
  hasTecnica,
  hasFormal,
  hasExemplo,
  onSelectTecnica,
  onSelectFormal,
  onSelectExemplo,
}: AprofundarButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!hasTecnica && !hasFormal && !hasExemplo) {
    return null;
  }

  return (
    <TooltipProvider>
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="relative"
      >
        <CollapsibleTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="text-xs flex gap-1 h-7 px-2.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-600 text-white border-none hover:opacity-90"
          >
            <span>Aprofundar</span>
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="absolute z-10 mt-2 right-0 p-1.5 bg-gray-800 rounded-lg border border-gray-700 shadow-lg animate-in fade-in">
          <div className="flex flex-col gap-1 min-w-32">
            {hasTecnica && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs justify-start gap-2 h-8 hover:bg-gray-700"
                    onClick={() => {
                      onSelectTecnica();
                      setIsOpen(false);
                    }}
                  >
                    <Info className="h-3.5 w-3.5" />
                    <span>Explicação Técnica</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Ver explicação técnica</TooltipContent>
              </Tooltip>
            )}
            
            {hasFormal && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs justify-start gap-2 h-8 hover:bg-gray-700"
                    onClick={() => {
                      onSelectFormal();
                      setIsOpen(false);
                    }}
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span>Explicação Formal</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Ver explicação formal</TooltipContent>
              </Tooltip>
            )}
            
            {hasExemplo && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs justify-start gap-2 h-8 hover:bg-gray-700"
                    onClick={() => {
                      onSelectExemplo();
                      setIsOpen(false);
                    }}
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>Exemplo Prático</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Ver exemplo prático</TooltipContent>
              </Tooltip>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </TooltipProvider>
  );
};

export default AprofundarButton;
