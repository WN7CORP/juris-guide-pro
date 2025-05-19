import { useState, useRef, useEffect } from "react";
import { Bookmark, BookmarkCheck, Info, BookText, BookOpen, X, Highlighter, Volume2, VolumeX, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFavoritesStore } from "@/store/favoritesStore";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { 
  Popover, 
  PopoverTrigger, 
  PopoverContent 
} from "@/components/ui/popover";
import { 
  Tooltip, 
  TooltipTrigger,
  TooltipContent,
  TooltipProvider
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent
} from "@/components/ui/hover-card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Article {
  id: string;
  number?: string;
  title?: string;
  content: string;
  items?: string[];
  paragraphs?: string[];
  explanation?: string;
  formalExplanation?: string;
  practicalExample?: string;
}

interface ArticleViewProps {
  article: Article;
  onNarrate: (narrating: boolean) => void;
}

interface Highlight {
  id: string;
  text: string;
  color: string;
  articleId: string;
  startOffset: number;
  endOffset: number;
}

interface Annotation {
  id: string;
  text: string;
  highlightId: string;
  articleId: string;
}

const colorOptions = [
  { name: "Amarelo", value: "#FFEB3B" },
  { name: "Verde", value: "#4CAF50" },
  { name: "Azul", value: "#2196F3" },
  { name: "Rosa", value: "#E91E63" }
];

export const ArticleView = ({ article, onNarrate }: ArticleViewProps) => {
  const { isFavorite, addFavorite, removeFavorite } = useFavoritesStore();
  const articleIsFavorite = isFavorite(article.id);
  
  // State for modal dialogs
  const [activeDialog, setActiveDialog] = useState<string | null>(null);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [selectedText, setSelectedText] = useState("");
  const [selectedHighlightId, setSelectedHighlightId] = useState<string | null>(null);
  const [highlightColor, setHighlightColor] = useState("#FFEB3B");
  const [annotationText, setAnnotationText] = useState("");
  const [showAnnotationDialog, setShowAnnotationDialog] = useState(false);
  const [showHighlightOptions, setShowHighlightOptions] = useState(false);
  const [selectionPosition, setSelectionPosition] = useState({ x: 0, y: 0 });
  const [isNarrating, setIsNarrating] = useState(false);
  
  const contentRef = useRef<HTMLDivElement>(null);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Load highlights and annotations from Supabase
  useEffect(() => {
    const loadUserData = async () => {
      try {
        // This would be implemented when user authentication is added
        // For now, we'll use local state
        // const { data: highlightsData } = await supabase
        //   .from('article_highlights')
        //   .select('*')
        //   .eq('article_id', article.id);
        
        // const { data: annotationsData } = await supabase
        //   .from('article_annotations')
        //   .select('*')
        //   .eq('article_id', article.id);
        
        // if (highlightsData) setHighlights(highlightsData);
        // if (annotationsData) setAnnotations(annotationsData);
      } catch (error) {
        console.error("Failed to load user data:", error);
      }
    };

    loadUserData();
  }, [article.id]);
  
  const toggleFavorite = () => {
    if (articleIsFavorite) {
      removeFavorite(article.id);
    } else {
      addFavorite(article.id);
    }
  };

  // Handle text selection for highlighting
  const handleTextSelection = () => {
    const selection = window.getSelection();
    
    if (selection && !selection.isCollapsed && contentRef.current) {
      const range = selection.getRangeAt(0);
      const text = selection.toString();
      
      if (text && text.trim().length > 0) {
        // Get position for the highlight popup
        const rect = range.getBoundingClientRect();
        setSelectionPosition({ 
          x: rect.x + window.scrollX, 
          y: rect.y + window.scrollY 
        });
        
        setSelectedText(text.trim());
        setShowHighlightOptions(true);
      }
    }
  };

  // Add new highlight
  const addHighlight = () => {
    if (selectedText) {
      const newHighlight: Highlight = {
        id: crypto.randomUUID(),
        text: selectedText,
        color: highlightColor,
        articleId: article.id,
        startOffset: 0, // We would calculate these properly in a full implementation
        endOffset: 0
      };
      
      setHighlights([...highlights, newHighlight]);
      setSelectedHighlightId(newHighlight.id);
      setShowHighlightOptions(false);
      setShowAnnotationDialog(true);
      
      // In a full implementation, we would save to Supabase here
      // saveHighlight(newHighlight);
    }
  };

  // Add annotation to highlight
  const addAnnotation = () => {
    if (selectedHighlightId && annotationText) {
      const newAnnotation: Annotation = {
        id: crypto.randomUUID(),
        text: annotationText,
        highlightId: selectedHighlightId,
        articleId: article.id
      };
      
      setAnnotations([...annotations, newAnnotation]);
      setAnnotationText("");
      setShowAnnotationDialog(false);
      
      // In a full implementation, we would save to Supabase here
      // saveAnnotation(newAnnotation);
      
      toast.success("Anotação adicionada com sucesso");
    }
  };

  // Handle narration of article content
  const handleNarration = (text: string, title: string = "") => {
    if (isNarrating) {
      if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
      }
      setIsNarrating(false);
      onNarrate(false);
      return;
    }

    // Create utterance
    const utterance = new SpeechSynthesisUtterance();
    utterance.text = title ? `${title}. ${text}` : text;
    utterance.lang = "pt-BR";
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    // Store reference to current utterance
    speechRef.current = utterance;
    
    // Handle end of speech
    utterance.onend = () => {
      setIsNarrating(false);
      onNarrate(false);
    };
    
    // Handle speech errors
    utterance.onerror = () => {
      setIsNarrating(false);
      onNarrate(false);
      toast.error("Erro ao reproduzir narração");
    };
    
    // Start speaking
    speechSynthesis.speak(utterance);
    setIsNarrating(true);
    onNarrate(true);
  };

  // Split content by line breaks to respect original formatting
  const contentLines = article.content.split('\n').filter(line => line.trim() !== '');

  // Check if we have any explanations available
  const hasExplanations = article.explanation || article.formalExplanation || article.practicalExample;

  const renderDialog = () => {
    if (!activeDialog) return null;
    
    let title = '';
    let content = '';
    let IconComponent = Info;
    
    switch(activeDialog) {
      case 'explanation':
        title = 'Explicação Técnica';
        content = article.explanation || '';
        IconComponent = Info;
        break;
      case 'formal':
        title = 'Explicação Formal';
        content = article.formalExplanation || '';
        IconComponent = BookText;
        break;
      case 'example':
        title = 'Exemplo Prático';
        content = article.practicalExample || '';
        IconComponent = BookOpen;
        break;
    }
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-lg bg-background-dark border border-gray-700 shadow-xl animate-in slide-in-from-bottom-10 duration-300">
          <div className="sticky top-0 bg-background-dark border-b border-gray-700 px-4 py-3 flex items-center justify-between z-10">
            <div className="flex items-center gap-2 text-law-accent">
              <IconComponent className="h-5 w-5" />
              <h3 className="font-medium text-lg">{title}</h3>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleNarration(content, title)}
                className="rounded-full p-1 h-auto w-auto hover:bg-gray-800"
              >
                {isNarrating ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                <span className="sr-only">Narrar texto</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setActiveDialog(null)}
                className="rounded-full p-1 h-auto w-auto hover:bg-gray-800"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Fechar</span>
              </Button>
            </div>
          </div>
          <div className="p-4 text-sm text-gray-300">
            <ReactMarkdown>
              {content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    );
  };

  return (
    <article className="legal-article bg-background-dark p-4 rounded-md border border-gray-800 mb-6 transition-all hover:border-gray-700 relative">
      <div className="flex justify-between items-start mb-3 gap-2">
        <div>
          {article.number && (
            <h3 className="legal-article-number font-serif text-lg font-bold text-law-accent">
              Art. {article.number}
            </h3>
          )}
          {article.title && !article.number && (
            <h4 className="legal-article-title">{article.title}</h4>
          )}
        </div>
        <div className="flex items-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-law-accent hover:bg-transparent"
                  onClick={() => handleNarration(article.content, article.number ? `Artigo ${article.number}` : article.title)}
                >
                  {isNarrating ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                {isNarrating ? "Parar narração" : "Narrar artigo"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-law-accent hover:bg-transparent"
                  onClick={toggleFavorite}
                >
                  {articleIsFavorite ? (
                    <BookmarkCheck className="h-5 w-5" />
                  ) : (
                    <Bookmark className="h-5 w-5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                {articleIsFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div 
        className="legal-article-content text-sm whitespace-pre-line mb-3"
        onMouseUp={handleTextSelection}
        ref={contentRef}
      >
        {contentLines.map((line, index) => (
          <p key={index} className="mb-1.5">{line}</p>
        ))}
      </div>

      {article.items && article.items.length > 0 && (
        <div className="legal-article-section pl-4 mb-3 border-l-2 border-gray-700">
          {article.items.map((item, index) => (
            <p key={index} className="mb-1 text-sm">
              {item}
            </p>
          ))}
        </div>
      )}

      {article.paragraphs && article.paragraphs.length > 0 && (
        <div className="legal-article-section pl-4 mb-3 border-l-2 border-gray-700">
          {article.paragraphs.map((paragraph, index) => (
            <p key={index} className="mb-1 text-sm italic">
              {paragraph}
            </p>
          ))}
        </div>
      )}

      {hasExplanations && (
        <div className="flex flex-wrap gap-2 mt-4 justify-end">
          {article.explanation && (
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs flex gap-1 h-7 px-2.5 rounded-full bg-gray-800/60 border-gray-700 hover:bg-gray-700"
              onClick={() => setActiveDialog('explanation')}
            >
              <Info className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Explicação Técnica</span>
              <span className="sm:hidden">Técnica</span>
            </Button>
          )}

          {article.formalExplanation && (
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs flex gap-1 h-7 px-2.5 rounded-full bg-gray-800/60 border-gray-700 hover:bg-gray-700"
              onClick={() => setActiveDialog('formal')}
            >
              <BookText className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Explicação Formal</span>
              <span className="sm:hidden">Formal</span>
            </Button>
          )}

          {article.practicalExample && (
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs flex gap-1 h-7 px-2.5 rounded-full bg-gray-800/60 border-gray-700 hover:bg-gray-700"
              onClick={() => setActiveDialog('example')}
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Exemplo Prático</span>
              <span className="sm:hidden">Exemplo</span>
            </Button>
          )}
        </div>
      )}
      
      {/* Highlight/Annotation Popover */}
      {showHighlightOptions && (
        <div
          className="absolute z-50 p-2 bg-background-dark rounded-md border border-gray-700 shadow-lg"
          style={{
            left: `${selectionPosition.x}px`,
            top: `${selectionPosition.y - 50}px`,
          }}
        >
          <div className="flex items-center gap-1">
            {colorOptions.map(color => (
              <button
                key={color.value}
                className={cn(
                  "w-6 h-6 rounded-full transition-transform",
                  highlightColor === color.value ? "scale-125 ring-1 ring-white" : ""
                )}
                style={{ backgroundColor: color.value }}
                onClick={() => setHighlightColor(color.value)}
                aria-label={`Selecionar cor ${color.name}`}
              />
            ))}
            <Button
              size="sm"
              variant="outline"
              className="ml-1 h-6 w-6 p-1 rounded-full border-gray-700"
              onClick={addHighlight}
            >
              <Highlighter className="h-3 w-3" />
              <span className="sr-only">Destacar</span>
            </Button>
          </div>
        </div>
      )}

      {/* Annotation Dialog */}
      <Dialog open={showAnnotationDialog} onOpenChange={setShowAnnotationDialog}>
        <DialogContent className="bg-background-dark border-gray-700">
          <DialogHeader>
            <DialogTitle>Adicionar Anotação</DialogTitle>
            <DialogDescription>
              Adicione uma anotação para o texto destacado.
            </DialogDescription>
          </DialogHeader>
          <div className="p-2 bg-gray-800/50 rounded-md text-sm text-gray-300">
            "{selectedText}"
          </div>
          <textarea
            className="w-full h-24 p-2 rounded-md bg-gray-800/50 border border-gray-700 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-law-accent"
            placeholder="Escreva sua anotação aqui..."
            value={annotationText}
            onChange={(e) => setAnnotationText(e.target.value)}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAnnotationDialog(false)}
              className="border-gray-700"
            >
              Cancelar
            </Button>
            <Button onClick={addAnnotation}>Salvar Anotação</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {renderDialog()}
    </article>
  );
};

export default ArticleView;
