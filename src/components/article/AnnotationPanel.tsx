
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Save, Trash2 } from "lucide-react";
import { useSupabaseAnnotations } from "@/hooks/useSupabaseAnnotations";
import { toast } from "sonner";

interface AnnotationPanelProps {
  articleId: string;
  articleNumber?: string;
  onClose: () => void;
}

export const AnnotationPanel = ({ articleId, articleNumber, onClose }: AnnotationPanelProps) => {
  const { getAnnotation, saveAnnotation, deleteAnnotation } = useSupabaseAnnotations();
  const [content, setContent] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const existingAnnotation = getAnnotation(articleId);
    if (existingAnnotation) {
      setContent(existingAnnotation.content);
    }
  }, [articleId, getAnnotation]);

  const handleSave = async () => {
    if (!content.trim()) {
      toast.error("A anotação não pode estar vazia");
      return;
    }

    try {
      await saveAnnotation(articleId, content);
      setHasChanges(false);
      toast.success("Anotação salva com sucesso!");
    } catch (error) {
      toast.error("Erro ao salvar anotação");
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Tem certeza que deseja excluir esta anotação?")) {
      try {
        await deleteAnnotation(articleId);
        setContent("");
        setHasChanges(false);
        toast.success("Anotação excluída com sucesso!");
        onClose();
      } catch (error) {
        toast.error("Erro ao excluir anotação");
      }
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setHasChanges(true);
  };

  return (
    <div className="flex flex-col h-full bg-gray-900">
      <div className="flex-1 p-4">
        <Textarea
          value={content}
          onChange={handleContentChange}
          placeholder={`Digite suas anotações para ${articleNumber ? `o Art. ${articleNumber}` : 'este artigo'}...`}
          className="min-h-[300px] bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-purple-400 focus:ring-purple-400 resize-none"
        />
      </div>
      
      <div className="flex gap-2 p-4 border-t border-gray-700">
        <Button
          onClick={handleSave}
          disabled={!hasChanges || !content.trim()}
          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
        >
          <Save className="h-4 w-4 mr-2" />
          Salvar
        </Button>
        
        {content.trim() && (
          <Button
            onClick={handleDelete}
            variant="outline"
            className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default AnnotationPanel;
