
import { useState } from "react";
import { StickyNote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import AdvancedAnnotationEditor from "@/components/annotation/AdvancedAnnotationEditor";
import { useAnnotations } from "@/hooks/useAnnotations";

interface ArticleAnnotationProps {
  articleId: string;
  articleNumber?: string;
}

export const ArticleAnnotation = ({
  articleId,
  articleNumber
}: ArticleAnnotationProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { getAnnotation, saveAnnotation, deleteAnnotation } = useAnnotations();
  const isMobile = useIsMobile();
  
  const annotation = getAnnotation(articleId);
  const hasAnnotation = !!annotation;

  const handleSave = (content: string, options: any) => {
    saveAnnotation(articleId, content, options);
    setIsOpen(false);
  };

  const handleDelete = () => {
    if (window.confirm('Tem certeza que deseja excluir esta anotação?')) {
      deleteAnnotation(articleId);
      setIsOpen(false);
    }
  };

  const AnnotationContent = () => (
    <div className="p-4 max-h-[85vh] overflow-hidden flex flex-col">
      <AdvancedAnnotationEditor
        articleId={articleId}
        articleNumber={articleNumber}
        annotation={annotation}
        onSave={handleSave}
        onClose={() => setIsOpen(false)}
        onDelete={hasAnnotation ? handleDelete : undefined}
      />
    </div>
  );

  return (
    <TooltipProvider>
      <div className="relative">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className={`text-xs flex gap-1 h-7 px-2.5 rounded-full transition-all ${
                hasAnnotation 
                  ? 'bg-gradient-to-r from-purple-600 to-violet-700 text-white border-none hover:opacity-90' 
                  : 'bg-gray-800/50 text-gray-300 border-gray-700 hover:bg-purple-600/20 hover:text-purple-300'
              }`}
              onClick={() => setIsOpen(true)}
            >
              <StickyNote className="h-3.5 w-3.5" />
              <span>Anotações</span>
              {hasAnnotation && (
                <div 
                  className="w-2 h-2 rounded-full ml-1" 
                  style={{ backgroundColor: annotation.color }}
                />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {hasAnnotation ? 'Editar anotação' : 'Adicionar anotação'}
          </TooltipContent>
        </Tooltip>
        
        {isMobile ? (
          <Drawer open={isOpen} onOpenChange={setIsOpen}>
            <DrawerContent className="h-[90vh] max-h-[90vh]">
              <div className="mx-auto w-full max-w-4xl h-full flex flex-col">
                <DrawerHeader className="border-b border-gray-700 pb-4 flex-shrink-0">
                  <DrawerTitle className="text-xl flex items-center text-purple-300">
                    <StickyNote className="h-5 w-5 mr-2" />
                    {articleNumber ? `Anotação - Art. ${articleNumber}` : 'Anotação'}
                  </DrawerTitle>
                </DrawerHeader>
                
                <AnnotationContent />
              </div>
            </DrawerContent>
          </Drawer>
        ) : (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="max-w-4xl max-h-[95vh]">
              <DialogHeader className="border-b border-gray-700 pb-4">
                <DialogTitle className="text-xl flex items-center text-purple-300">
                  <StickyNote className="h-5 w-5 mr-2" />
                  {articleNumber ? `Anotação - Art. ${articleNumber}` : 'Anotação'}
                </DialogTitle>
              </DialogHeader>
              
              <AnnotationContent />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </TooltipProvider>
  );
};

export default ArticleAnnotation;
