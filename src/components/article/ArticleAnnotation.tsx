
import { useState, useEffect } from "react";
import { StickyNote, X, Save, Edit3, Trash2, Calendar, FileText, Search, BookMarked, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useSupabaseAnnotations } from "@/hooks/useSupabaseAnnotations";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";

interface ArticleAnnotationProps {
  articleId: string;
  articleNumber?: string;
}

export const ArticleAnnotation = ({
  articleId,
  articleNumber
}: ArticleAnnotationProps) => {
  const { user } = useAuth();
  const { getAnnotation, saveAnnotation, deleteAnnotation, getAllAnnotations, loading } = useSupabaseAnnotations();
  const [isOpen, setIsOpen] = useState(false);
  const [annotation, setAnnotation] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("current");

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
      toast.success('Anotação salva com sucesso!');
    } catch (error) {
      console.error("Error saving annotation:", error);
      toast.error('Erro ao salvar anotação');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAnnotation = async () => {
    if (!articleId || !user) return;
    
    try {
      await deleteAnnotation(articleId);
      setAnnotation("");
      toast.success('Anotação excluída com sucesso!');
    } catch (error) {
      console.error("Error deleting annotation:", error);
      toast.error('Erro ao excluir anotação');
    }
  };

  const allAnnotations = getAllAnnotations();
  const filteredAnnotations = allAnnotations.filter(ann => 
    ann.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ann.article_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            {hasAnnotation ? 'Gerenciar anotações' : 'Adicionar anotação'}
          </TooltipContent>
        </Tooltip>
        
        {/* Full Screen Annotation Panel */}
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-50"
                onClick={() => setIsOpen(false)}
              />
              
              {/* Annotation Panel */}
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="fixed top-0 right-0 h-full w-full sm:w-[600px] bg-netflix-dark border-l border-gray-700 z-50 flex flex-col"
              >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-netflix-bg">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsOpen(false)}
                      className="text-gray-300 hover:text-white"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <div>
                      <h2 className="text-xl font-medium text-violet-300 flex items-center gap-2">
                        <StickyNote className="h-5 w-5" />
                        Anotações
                      </h2>
                      {articleNumber && (
                        <p className="text-sm text-gray-400">Art. {articleNumber}</p>
                      )}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {allAnnotations.length} total
                  </Badge>
                </div>
                
                {/* Content */}
                <div className="flex-1 overflow-hidden">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                    <div className="px-4 pt-4">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="current" className="flex items-center gap-2 text-xs">
                          <Edit3 className="h-3 w-3" />
                          Atual
                        </TabsTrigger>
                        <TabsTrigger value="all" className="flex items-center gap-2 text-xs">
                          <FileText className="h-3 w-3" />
                          Todas
                        </TabsTrigger>
                        <TabsTrigger value="search" className="flex items-center gap-2 text-xs">
                          <Search className="h-3 w-3" />
                          Buscar
                        </TabsTrigger>
                      </TabsList>
                    </div>
                    
                    <div className="flex-1 overflow-hidden">
                      <TabsContent value="current" className="h-full p-4 space-y-4 m-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-medium text-yellow-300">
                            Anotação do Artigo
                          </h3>
                          {hasAnnotation && (
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={handleDeleteAnnotation}
                              className="flex items-center gap-1"
                            >
                              <Trash2 className="h-3 w-3" />
                              Excluir
                            </Button>
                          )}
                        </div>
                        
                        <Textarea 
                          value={annotation} 
                          onChange={e => setAnnotation(e.target.value)} 
                          placeholder="Adicione suas anotações sobre este artigo aqui..." 
                          className="h-64 bg-gray-800/60 border-gray-700 resize-none text-base" 
                          disabled={loading}
                        />
                        
                        {hasAnnotation && (
                          <div className="text-xs text-gray-400 flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            Última modificação: {new Date(hasAnnotation.updated_at).toLocaleDateString('pt-BR')}
                          </div>
                        )}
                        
                        <Button 
                          onClick={handleSaveAnnotation} 
                          disabled={isSaving || loading || !annotation.trim()} 
                          className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 hover:opacity-90 border-none text-white gap-2"
                        >
                          <Save className="h-4 w-4" />
                          {isSaving ? 'Salvando...' : 'Salvar Anotação'}
                        </Button>
                      </TabsContent>
                      
                      <TabsContent value="all" className="h-full p-4 space-y-4 m-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-medium text-yellow-300">
                            Todas as Anotações
                          </h3>
                          <Badge variant="secondary">
                            {allAnnotations.length} anotações
                          </Badge>
                        </div>
                        
                        <ScrollArea className="h-[calc(100vh-300px)]">
                          <div className="space-y-3 pr-4">
                            {allAnnotations.length === 0 ? (
                              <div className="text-center py-8 text-gray-400">
                                <BookMarked className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>Nenhuma anotação encontrada</p>
                                <p className="text-sm mt-2">Comece adicionando uma anotação ao artigo atual</p>
                              </div>
                            ) : (
                              allAnnotations.map((ann) => (
                                <div key={ann.id} className="border border-gray-700 rounded-lg p-4 space-y-2">
                                  <div className="flex items-center justify-between">
                                    <Badge variant="outline" className="text-xs">
                                      {ann.article_id}
                                    </Badge>
                                    <span className="text-xs text-gray-400">
                                      {new Date(ann.updated_at).toLocaleDateString('pt-BR')}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-300 line-clamp-3">
                                    {ann.content}
                                  </p>
                                </div>
                              ))
                            )}
                          </div>
                        </ScrollArea>
                      </TabsContent>
                      
                      <TabsContent value="search" className="h-full p-4 space-y-4 m-0">
                        <div className="space-y-4">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              placeholder="Pesquisar nas anotações..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="pl-10"
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium text-yellow-300">
                              Resultados
                            </h3>
                            <Badge variant="secondary">
                              {filteredAnnotations.length} encontradas
                            </Badge>
                          </div>
                          
                          <ScrollArea className="h-[calc(100vh-350px)]">
                            <div className="space-y-3 pr-4">
                              {filteredAnnotations.length === 0 ? (
                                <div className="text-center py-8 text-gray-400">
                                  <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                  <p>Nenhuma anotação encontrada</p>
                                  {searchTerm && (
                                    <p className="text-sm mt-2">
                                      Nenhum resultado para "{searchTerm}"
                                    </p>
                                  )}
                                </div>
                              ) : (
                                filteredAnnotations.map((ann) => (
                                  <div key={ann.id} className="border border-gray-700 rounded-lg p-4 space-y-2">
                                    <div className="flex items-center justify-between">
                                      <Badge variant="outline" className="text-xs">
                                        {ann.article_id}
                                      </Badge>
                                      <span className="text-xs text-gray-400">
                                        {new Date(ann.updated_at).toLocaleDateString('pt-BR')}
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-300">
                                      {ann.content}
                                    </p>
                                  </div>
                                ))
                              )}
                            </div>
                          </ScrollArea>
                        </div>
                      </TabsContent>
                    </div>
                  </Tabs>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  );
};

export default ArticleAnnotation;
