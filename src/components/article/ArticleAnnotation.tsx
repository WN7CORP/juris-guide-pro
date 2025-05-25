
import { useState, useEffect } from "react";
import { StickyNote, X, Save, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { useSupabaseAnnotations } from "@/hooks/useSupabaseAnnotations";
import { useAuth } from "@/hooks/useAuth";

interface ArticleAnnotationProps {
  articleId: string;
  articleNumber?: string;
}

export const ArticleAnnotation = ({
  articleId,
  articleNumber
}: ArticleAnnotationProps) => {
  const { user } = useAuth();
  const { getAnnotation, saveAnnotation, loading } = useSupabaseAnnotations();
  const [isOpen, setIsOpen] = useState(false);
  const [annotation, setAnnotation] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Load saved annotation on mount and when annotations change
  useEffect(() => {
    if (!articleId || !user || loading) return;
    
    const existingAnnotation = getAnnotation(articleId);
    if (existingAnnotation) {
      setAnnotation(existingAnnotation.content);
    } else {
      setAnnotation("");
    }
  }, [articleId, user, getAnnotation, loading]);

  const handleSaveAnnotation = async () => {
    if (!articleId || !user) {
      toast.error('Você precisa estar logado para salvar anotações');
      return;
    }
    
    if (!annotation.trim()) {
      toast.error('A anotação não pode estar vazia');
      return;
    }
    
    setIsSaving(true);
    try {
      await saveAnnotation(articleId, annotation.trim());
      setIsOpen(false);
      toast.success('Anotação salva com sucesso!');
    } catch (error) {
      console.error("Error saving annotation:", error);
      toast.error('Erro ao salvar anotação');
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs flex gap-1 h-7 px-2.5 rounded-full opacity-50 cursor-not-allowed"
              disabled
            >
              <StickyNote className="h-3.5 w-3.5" />
              <span>Anotações</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            Faça login para usar anotações
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  const hasAnnotation = getAnnotation(articleId);

  return (
    <TooltipProvider>
      <div className="relative">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant={hasAnnotation ? "default" : "outline"} 
              size="sm" 
              className={`text-xs flex gap-1 h-7 px-2.5 rounded-full transition-all ${
                hasAnnotation 
                  ? 'bg-gradient-to-r from-violet-600 to-purple-700 text-white border-none hover:opacity-90' 
                  : 'bg-gradient-to-r from-violet-600 to-purple-700 text-white border-none hover:opacity-90'
              } ${isOpen ? 'from-purple-800 to-violet-800' : ''}`} 
              onClick={() => setIsOpen(true)}
              disabled={loading}
            >
              <StickyNote className="h-3.5 w-3.5" />
              <span>Anotações</span>
              {hasAnnotation && <span className="ml-1 text-xs">●</span>}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {hasAnnotation ? 'Editar anotação' : 'Adicionar anotação'}
          </TooltipContent>
        </Tooltip>
        
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
          <DrawerContent className="max-h-[95vh] my-[17px]">
            <div className="mx-auto w-full max-w-4xl">
              <DrawerHeader className="border-b border-gray-700 pb-4">
                <DrawerTitle className="text-xl flex items-center text-yellow-300">
                  <StickyNote className="h-5 w-5 mr-2" />
                  {articleNumber ? `Anotação - Art. ${articleNumber}` : 'Anotação'}
                </DrawerTitle>
              </DrawerHeader>
              
              <div className="p-4 sm:p-6">
                <Textarea 
                  value={annotation} 
                  onChange={e => setAnnotation(e.target.value)} 
                  placeholder="Adicione suas anotações sobre este artigo aqui..." 
                  className="min-h-[200px] bg-gray-800/60 border-gray-700 resize-y text-base" 
                  disabled={loading}
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
                    onClick={handleSaveAnnotation} 
                    disabled={isSaving || loading || !annotation.trim()} 
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
