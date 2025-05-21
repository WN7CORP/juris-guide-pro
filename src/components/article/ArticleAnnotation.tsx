
import { useState, useEffect } from "react";
import { StickyNote, X, Save, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

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
      setIsOpen(false);
    } catch (error) {
      console.error("Error saving annotation:", error);
      toast.error("Erro ao salvar anotação");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <TooltipProvider>
      <div className="relative">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant={isOpen ? "default" : "outline"} 
              size="sm" 
              className={`text-xs flex gap-1 h-7 px-2.5 rounded-full bg-gradient-to-r from-violet-600 to-purple-700 text-white border-none hover:opacity-90 ${isOpen ? 'from-purple-800 to-violet-800' : ''}`} 
              onClick={() => setIsOpen(true)}
            >
              <StickyNote className="h-3.5 w-3.5" />
              <span>Anotações</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            Adicionar ou editar anotações
          </TooltipContent>
        </Tooltip>
        
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
          <DrawerContent className="max-h-[95vh]">
            <div className="mx-auto w-full max-w-4xl">
              <DrawerHeader className="border-b border-gray-700 pb-4">
                <DrawerTitle className="text-xl flex items-center text-yellow-300">
                  <StickyNote className="h-5 w-5 mr-2" />
                  {articleNumber 
                    ? `Anotação - Art. ${articleNumber}` 
                    : 'Anotação'}
                </DrawerTitle>
              </DrawerHeader>
              
              <div className="p-4 sm:p-6">
                <Textarea
                  value={annotation}
                  onChange={(e) => setAnnotation(e.target.value)}
                  placeholder="Adicione suas anotações sobre este artigo aqui..."
                  className="min-h-[200px] bg-gray-800/60 border-gray-700 resize-y text-base"
                />
              </div>
              
              <DrawerFooter className="border-t border-gray-700 pt-4">
                <div className="flex justify-between w-full">
                  <DrawerClose asChild>
                    <Button variant="outline" className="gap-1">
                      <ChevronDown className="h-4 w-4" />
                      <span>Fechar</span>
                    </Button>
                  </DrawerClose>
                  
                  <Button 
                    onClick={saveAnnotation} 
                    disabled={isSaving}
                    className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:opacity-90 border-none text-white gap-1"
                  >
                    <Save className="h-4 w-4" />
                    {isSaving ? 'Salvando...' : 'Salvar Anotação'}
                  </Button>
                </div>
              </DrawerFooter>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </TooltipProvider>
  );
};

export default ArticleAnnotation;
