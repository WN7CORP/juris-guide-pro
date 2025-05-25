
import { cn } from "@/lib/utils";
import { useRef } from "react";
import { toast } from "sonner";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ArticleContentProps {
  content: string;
  items?: string[];
  paragraphs?: string[];
  hasNumber: boolean;
}

// Function to format text with bold elements and highlight specific legal terms
const formatTextWithBold = (text: string) => {
  // Format article numbers (e.g., "Art. 2" or "Art. 2-A")
  text = text.replace(/(Art\.\s*\d+(-[A-Z])?)/g, '<strong>$1</strong>');
  
  // Format paragraph symbols (e.g., "§ 2º" or "§ 3º-A")
  text = text.replace(/(\§\s*\d+(º|-[A-Z])?)/g, '<strong>$1</strong>');
  
  // Format "Paragrafo único"
  text = text.replace(/(Parágrafo\s+único|PARÁGRAFO\s+ÚNICO|Paragrafo\s+unico|PARAGRAFO\s+UNICO)/gi, '<strong>$1</strong>');
  
  // Format incisos at the beginning (e.g., "IV -" or "IV.")
  text = text.replace(/^(([IVXLCDMivxlcdm]+)(\.|\s*-|\s*–))/gm, '<strong>$1</strong>');
  
  // Highlight "revogado", "vetado", "vetada" in light red (not including "revogada")
  text = text.replace(/\b(revogado|vetado|vetada)\b/gi, '<span class="text-red-400">$1</span>');
  
  // Highlight text within parentheses in light red
  text = text.replace(/(\([^)]*\))/g, '<span class="text-red-400">$1</span>');
  
  return text;
};

export const ArticleContent = ({
  content,
  items,
  paragraphs,
  hasNumber
}: ArticleContentProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Function to copy text to clipboard with better mobile support
  const copyToClipboard = () => {
    try {
      // Get all text content without HTML tags
      const textToCopy = contentRef.current?.textContent || "";
      
      // Use the modern clipboard API
      navigator.clipboard.writeText(textToCopy)
        .then(() => {
          toast.success("Texto copiado para área de transferência");
        })
        .catch((err) => {
          console.error("Erro ao copiar: ", err);
          
          // Fallback for mobile devices
          fallbackCopyTextToClipboard(textToCopy);
        });
    } catch (error) {
      console.error("Erro ao copiar texto: ", error);
      toast.error("Não foi possível copiar o texto");
    }
  };
  
  // Fallback method for devices that don't support clipboard API
  const fallbackCopyTextToClipboard = (text: string) => {
    try {
      // Create temporary textarea element
      const textArea = document.createElement("textarea");
      textArea.value = text;
      
      // Make it invisible but part of the DOM
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      
      // Select and copy
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);
      
      if (successful) {
        toast.success("Texto copiado para área de transferência");
      } else {
        toast.error("Não foi possível copiar o texto");
      }
    } catch (err) {
      toast.error("Não foi possível copiar o texto");
    }
  };
  
  // Split content by line breaks to respect original formatting
  const contentLines = content.split('\n').filter(line => line.trim() !== '');
  
  return (
    <>
      <div 
        ref={contentRef}
        className={cn("legal-article-content whitespace-pre-line mb-3 relative group font-serif", !hasNumber && "text-center bg-red-500/10 p-3 rounded")}
      >
        {contentLines.map((line, index) => (
          <p 
            key={index} 
            className="mb-4"
            dangerouslySetInnerHTML={{ __html: formatTextWithBold(line) }}
          />
        ))}
      </div>

      {items && items.length > 0 && (
        <div className="legal-article-section pl-4 mb-3 border-l-2 border-gray-700 relative group font-serif">
          {items.map((item, index) => (
            <p 
              key={index} 
              className="mb-3 text-sm"
              dangerouslySetInnerHTML={{ __html: formatTextWithBold(item) }}
            />
          ))}
        </div>
      )}

      {paragraphs && paragraphs.length > 0 && (
        <div className="legal-article-section pl-4 mb-3 border-l-2 border-gray-700 relative group font-serif">
          {paragraphs.map((paragraph, index) => (
            <p 
              key={index} 
              className="mb-3 text-sm italic"
              dangerouslySetInnerHTML={{ __html: formatTextWithBold(paragraph) }}
            />
          ))}
        </div>
      )}
    </>
  );
};

export default ArticleContent;
