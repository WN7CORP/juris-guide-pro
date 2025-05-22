
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";

interface ArticleExplanationsProps {
  activeDialog: string | null;
  onCloseDialog: () => void;
  explanation?: string;
  formalExplanation?: string;
  practicalExample?: string;
}

export const ArticleExplanations = ({
  activeDialog,
  onCloseDialog,
  explanation,
  formalExplanation,
  practicalExample
}: ArticleExplanationsProps) => {
  // Function to copy text to clipboard
  const copyToClipboard = (text?: string) => {
    if (!text) return;
    
    navigator.clipboard.writeText(text)
      .then(() => {
        toast.success("Texto copiado para área de transferência");
      })
      .catch(() => {
        toast.error("Não foi possível copiar o texto");
      });
  };
  
  // Get the current text based on the active dialog
  const getCurrentText = () => {
    if (activeDialog === 'explanation') return explanation;
    if (activeDialog === 'formal') return formalExplanation;
    if (activeDialog === 'example') return practicalExample;
    return "";
  };
  
  return (
    <Dialog open={!!activeDialog} onOpenChange={(open) => !open && onCloseDialog()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>
            {activeDialog === 'explanation' && "Explicação Técnica"}
            {activeDialog === 'formal' && "Explicação Formal"}
            {activeDialog === 'example' && "Exemplo Prático"}
          </DialogTitle>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => copyToClipboard(getCurrentText())}
            title="Copiar texto"
            className="h-8 w-8"
          >
            <Copy className="h-4 w-4" />
          </Button>
        </DialogHeader>
        <div className="text-sm text-gray-300 space-y-3 max-h-[60vh] overflow-y-auto">
          {activeDialog === 'explanation' && explanation && 
            explanation.split('\n').map((paragraph, i) => (
              <p key={i} className="leading-relaxed">{paragraph}</p>
            ))}
          
          {activeDialog === 'formal' && formalExplanation && 
            formalExplanation.split('\n').map((paragraph, i) => (
              <p key={i} className="leading-relaxed">{paragraph}</p>
            ))}
          
          {activeDialog === 'example' && practicalExample && 
            practicalExample.split('\n').map((paragraph, i) => (
              <p key={i} className="leading-relaxed">{paragraph}</p>
            ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ArticleExplanations;
