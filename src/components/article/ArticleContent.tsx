
import { cn } from "@/lib/utils";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface ArticleContentProps {
  content: string;
  items?: string[];
  paragraphs?: string[];
  hasNumber: boolean;
}

// Function to format text with bold elements
const formatTextWithBold = (text: string) => {
  // Format article numbers (e.g., "Art. 2" or "Art. 2-A")
  text = text.replace(/(Art\.\s*\d+(-[A-Z])?)/g, '<strong>$1</strong>');
  
  // Format paragraph symbols (e.g., "§ 2º" or "§ 3º-A")
  text = text.replace(/(\§\s*\d+(º|-[A-Z])?)/g, '<strong>$1</strong>');
  
  // Format "Paragrafo único"
  text = text.replace(/(Parágrafo\s+único|PARÁGRAFO\s+ÚNICO|Paragrafo\s+unico|PARAGRAFO\s+UNICO)/gi, '<strong>$1</strong>');
  
  // Format incisos at the beginning (e.g., "IV -" or "IV.")
  text = text.replace(/^(([IVXLCDMivxlcdm]+)(\.|\s*-|\s*–))/gm, '<strong>$1</strong>');
  
  return text;
};

export const ArticleContent = ({
  content,
  items,
  paragraphs,
  hasNumber
}: ArticleContentProps) => {
  // Split content by line breaks to respect original formatting
  const contentLines = content.split('\n').filter(line => line.trim() !== '');
  
  // Function to copy text to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        toast.success("Texto copiado para área de transferência");
      })
      .catch(() => {
        toast.error("Não foi possível copiar o texto");
      });
  };
  
  return (
    <>
      <div className={cn("legal-article-content whitespace-pre-line mb-3 relative group", !hasNumber && "text-center bg-red-500/10 p-3 rounded")}>
        {contentLines.map((line, index) => (
          <p 
            key={index} 
            className="mb-2.5"
            dangerouslySetInnerHTML={{ __html: formatTextWithBold(line) }}
          />
        ))}
        
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => copyToClipboard(content)}
          title="Copiar texto"
        >
          <Copy className="h-4 w-4" />
        </Button>
      </div>

      {items && items.length > 0 && (
        <div className="legal-article-section pl-4 mb-3 border-l-2 border-gray-700 relative group">
          {items.map((item, index) => (
            <p 
              key={index} 
              className="mb-1.5 text-sm"
              dangerouslySetInnerHTML={{ __html: formatTextWithBold(item) }}
            />
          ))}
          
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => copyToClipboard(items.join('\n'))}
            title="Copiar itens"
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      )}

      {paragraphs && paragraphs.length > 0 && (
        <div className="legal-article-section pl-4 mb-3 border-l-2 border-gray-700 relative group">
          {paragraphs.map((paragraph, index) => (
            <p 
              key={index} 
              className="mb-1.5 text-sm italic"
              dangerouslySetInnerHTML={{ __html: formatTextWithBold(paragraph) }}
            />
          ))}
          
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => copyToClipboard(paragraphs.join('\n'))}
            title="Copiar parágrafos"
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      )}
    </>
  );
};

export default ArticleContent;
