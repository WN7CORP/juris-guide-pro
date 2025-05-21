
import { useState, useEffect } from "react";
import { StickyNote, X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

interface ArticleAnnotationProps {
  articleId: string;
  articleNumber?: string;
}

const LOCAL_STORAGE_KEY = 'article-annotations';

interface Annotation {
  articleId: string;
  content: string;
  updatedAt: string;
}

export const ArticleAnnotation = ({
  articleId,
  articleNumber
}: ArticleAnnotationProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [annotation, setAnnotation] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Load saved annotation on mount
  useEffect(() => {
    if (!articleId) return;
    
    try {
      const savedAnnotations = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedAnnotations) {
        const annotations: Annotation[] = JSON.parse(savedAnnotations);
        const currentAnnotation = annotations.find(a => a.articleId === articleId);
        
        if (currentAnnotation) {
          setAnnotation(currentAnnotation.content);
        }
      }
    } catch (error) {
      console.error("Error loading annotations:", error);
    }
  }, [articleId]);

  const saveAnnotation = () => {
    if (!articleId) return;
    
    setIsSaving(true);
    
    try {
      // Get existing annotations
      const savedAnnotations = localStorage.getItem(LOCAL_STORAGE_KEY);
      let annotations: Annotation[] = [];
      
      if (savedAnnotations) {
        annotations = JSON.parse(savedAnnotations);
        
        // Find and update existing annotation
        const existingIndex = annotations.findIndex(a => a.articleId === articleId);
        
        if (existingIndex >= 0) {
          annotations[existingIndex] = {
            articleId,
            content: annotation,
            updatedAt: new Date().toISOString()
          };
        } else {
          // Add new annotation
          annotations.push({
            articleId,
            content: annotation,
            updatedAt: new Date().toISOString()
          });
        }
      } else {
        // Create first annotation
        annotations = [{
          articleId,
          content: annotation,
          updatedAt: new Date().toISOString()
        }];
      }
      
      // Save to localStorage
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(annotations));
      
      toast.success("Anotação salva com sucesso");
    } catch (error) {
      console.error("Error saving annotation:", error);
      toast.error("Erro ao salvar anotação");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleAnnotation = () => {
    setIsOpen(prev => !prev);
  };

  return (
    <TooltipProvider>
      <div className="relative">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant={isOpen ? "default" : "outline"} 
              size="sm" 
              className={`text-xs flex gap-1 h-7 px-2.5 rounded-full bg-gray-800/60 border-gray-700 hover:bg-gray-700 ${isOpen ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50' : ''}`} 
              onClick={toggleAnnotation}
            >
              <StickyNote className="h-3.5 w-3.5" />
              <span>Anotações</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isOpen ? "Fechar anotações" : "Adicionar anotações"}
          </TooltipContent>
        </Tooltip>
        
        {isOpen && (
          <div className="absolute top-full left-0 mt-2 p-4 bg-gray-900/95 border border-gray-700 rounded-md shadow-lg z-30 w-80">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-medium text-yellow-300">
                {articleNumber ? `Anotação - Art. ${articleNumber}` : 'Anotação'}
              </h3>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setIsOpen(false)}>
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
            
            <Textarea
              value={annotation}
              onChange={(e) => setAnnotation(e.target.value)}
              placeholder="Adicione suas anotações sobre este artigo aqui..."
              className="min-h-[100px] bg-gray-800/60 border-gray-700 resize-y text-sm"
            />
            
            <div className="flex justify-end mt-3">
              <Button 
                size="sm" 
                onClick={saveAnnotation} 
                disabled={isSaving}
                className="text-xs h-8"
              >
                <Save className="h-3.5 w-3.5 mr-1" />
                {isSaving ? 'Salvando...' : 'Salvar Anotação'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

export default ArticleAnnotation;
