
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  return (
    <Dialog open={!!activeDialog} onOpenChange={(open) => !open && onCloseDialog()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {activeDialog === 'explanation' && "Explicação Técnica"}
            {activeDialog === 'formal' && "Explicação Formal"}
            {activeDialog === 'example' && "Exemplo Prático"}
          </DialogTitle>
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
