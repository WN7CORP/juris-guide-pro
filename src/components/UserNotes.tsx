
import { useState, useEffect } from "react";
import { Pencil, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface UserNotesProps {
  articleId: string;
}

export function UserNotes({ articleId }: UserNotesProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState("");
  const storageKey = `user-notes-${articleId}`;
  
  useEffect(() => {
    // Load notes from localStorage
    const savedNotes = localStorage.getItem(storageKey);
    if (savedNotes) {
      setNotes(savedNotes);
    }
  }, [articleId, storageKey]);
  
  const saveNotes = () => {
    localStorage.setItem(storageKey, notes);
    setIsEditing(false);
    toast.success("Anotações salvas com sucesso");
  };
  
  const cancelEditing = () => {
    // Restore saved notes
    const savedNotes = localStorage.getItem(storageKey);
    setNotes(savedNotes || "");
    setIsEditing(false);
  };

  return (
    <div className="mt-4 border border-gray-700 rounded-md overflow-hidden bg-gray-800/30 transition-all">
      <div className="flex items-center justify-between p-3 bg-gray-800/50 border-b border-gray-700">
        <h3 className="text-sm font-medium">Minhas Anotações</h3>
        {!isEditing && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsEditing(true)}
            className="h-8 w-8 p-0"
          >
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Editar anotações</span>
          </Button>
        )}
        
        {isEditing && (
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={saveNotes}
              className="h-8 w-8 p-0 text-green-500"
            >
              <Save className="h-4 w-4" />
              <span className="sr-only">Salvar</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={cancelEditing}
              className="h-8 w-8 p-0 text-red-500"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Cancelar</span>
            </Button>
          </div>
        )}
      </div>
      
      <div className="p-3">
        {isEditing ? (
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Adicione suas anotações aqui..."
            className="min-h-[120px] bg-gray-900/50 border-gray-700"
          />
        ) : (
          <div className="min-h-[60px] text-sm whitespace-pre-line">
            {notes ? notes : (
              <p className="text-gray-500 italic">
                Clique no ícone de lápis para adicionar anotações sobre este artigo...
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default UserNotes;
