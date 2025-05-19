
import { useState, useRef, useCallback } from "react";
import { Highlighter, Pencil, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TextHighlighterProps {
  onHighlight: (text: string, color: string) => void;
  onAnnotate: (text: string, note: string) => void;
  compact?: boolean;
}

export const TextHighlighter = ({ 
  onHighlight, 
  onAnnotate, 
  compact = false 
}: TextHighlighterProps) => {
  const [isHighlighting, setIsHighlighting] = useState(false);
  const [isAnnotating, setIsAnnotating] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [highlightColor, setHighlightColor] = useState("#FFEB3B");
  const [annotation, setAnnotation] = useState("");
  const noteInputRef = useRef<HTMLTextAreaElement>(null);

  const colors = [
    { value: "#FFEB3B", label: "Amarelo" },
    { value: "#4CAF50", label: "Verde" },
    { value: "#2196F3", label: "Azul" },
    { value: "#F44336", label: "Vermelho" },
    { value: "#9C27B0", label: "Roxo" }
  ];

  const handleHighlightClick = useCallback(() => {
    setIsHighlighting(prev => !prev);
    setIsAnnotating(false);
  }, []);

  const handleAnnotateClick = useCallback(() => {
    setIsAnnotating(prev => !prev);
    setIsHighlighting(false);
  }, []);

  const handleMouseUp = useCallback(() => {
    if (!isHighlighting && !isAnnotating) return;

    const selection = window.getSelection();
    if (selection && selection.toString().trim() !== "") {
      const text = selection.toString().trim();
      setSelectedText(text);

      if (isHighlighting) {
        onHighlight(text, highlightColor);
        selection.removeAllRanges();
      } else if (isAnnotating && noteInputRef.current) {
        noteInputRef.current.focus();
      }
    }
  }, [isHighlighting, isAnnotating, highlightColor, onHighlight]);

  const handleAnnotationSave = useCallback(() => {
    if (selectedText && annotation.trim()) {
      onAnnotate(selectedText, annotation);
      setAnnotation("");
      setSelectedText("");
      setIsAnnotating(false);
    }
  }, [selectedText, annotation, onAnnotate]);

  const handleAnnotationCancel = useCallback(() => {
    setAnnotation("");
    setSelectedText("");
    setIsAnnotating(false);
  }, []);

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2" onMouseUp={handleMouseUp}>
        {/* Highlight button */}
        <Popover>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <Button
                  onClick={handleHighlightClick}
                  variant={isHighlighting ? "default" : "outline"}
                  size={compact ? "sm" : "default"}
                  className={`flex gap-1 items-center ${compact ? "h-7 px-2 text-xs rounded-full" : ""} ${
                    isHighlighting 
                      ? "bg-law-accent border-law-accent hover:bg-law-accent/90" 
                      : "bg-gray-800 border-gray-700 hover:bg-gray-700"
                  }`}
                >
                  <Highlighter className={`${compact ? "h-3.5 w-3.5" : "h-4 w-4"}`} />
                  {!compact && <span>Grifar</span>}
                </Button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isHighlighting ? "Clique para desativar modo de grifar" : "Ativar modo de grifar"}</p>
            </TooltipContent>
          </Tooltip>
          <PopoverContent className="w-auto p-2">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium mb-1">Cor do destaque:</p>
              <div className="flex gap-2">
                {colors.map((color) => (
                  <Tooltip key={color.value}>
                    <TooltipTrigger asChild>
                      <button
                        key={color.value}
                        className={`w-6 h-6 rounded-full border ${
                          highlightColor === color.value ? "ring-2 ring-offset-2 ring-offset-background ring-law-accent" : ""
                        }`}
                        style={{ backgroundColor: color.value }}
                        onClick={() => setHighlightColor(color.value)}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{color.label}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Annotate button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={handleAnnotateClick}
              variant={isAnnotating ? "default" : "outline"}
              size={compact ? "sm" : "default"}
              className={`flex gap-1 items-center ${compact ? "h-7 px-2 text-xs rounded-full" : ""} ${
                isAnnotating 
                  ? "bg-law-accent border-law-accent hover:bg-law-accent/90" 
                  : "bg-gray-800 border-gray-700 hover:bg-gray-700"
              }`}
            >
              <Pencil className={`${compact ? "h-3.5 w-3.5" : "h-4 w-4"}`} />
              {!compact && <span>Anotar</span>}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isAnnotating ? "Clique para desativar modo de anotar" : "Ativar modo de anotar"}</p>
          </TooltipContent>
        </Tooltip>

        {/* Annotation input */}
        {isAnnotating && selectedText && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-md overflow-y-auto rounded-lg bg-background-dark border border-gray-700 shadow-xl animate-in slide-in-from-bottom-10 duration-300">
              <div className="p-4">
                <h3 className="text-lg font-medium mb-2">Adicionar anotação</h3>
                <p className="text-sm text-gray-400 mb-2">Texto selecionado:</p>
                <div className="p-2 bg-gray-800 rounded mb-3 text-sm">
                  "{selectedText}"
                </div>
                <textarea
                  ref={noteInputRef}
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-law-accent resize-none h-24 text-sm"
                  placeholder="Digite sua anotação aqui..."
                  value={annotation}
                  onChange={(e) => setAnnotation(e.target.value)}
                />
                <div className="flex justify-end gap-2 mt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleAnnotationCancel}
                    className="gap-1"
                  >
                    <X className="h-4 w-4" />
                    Cancelar
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleAnnotationSave}
                    className="bg-law-accent hover:bg-law-accent/90 gap-1"
                  >
                    <Check className="h-4 w-4" />
                    Salvar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

export default TextHighlighter;
