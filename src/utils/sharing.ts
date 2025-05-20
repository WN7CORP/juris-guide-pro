
import { toast } from "sonner";

interface ShareOptions {
  title: string;
  text: string;
  url: string;
}

export const shareContent = async (options: ShareOptions) => {
  // Check if the Web Share API is available
  if (navigator.share) {
    try {
      await navigator.share(options);
      return true;
    } catch (error) {
      console.error("Error sharing content:", error);
      return false;
    }
  } else {
    // Fallback for browsers that don't support the Web Share API
    copyToClipboard(`${options.title}\n\n${options.text}\n\n${options.url}`);
    toast.success("Link copiado para a área de transferência");
    return true;
  }
};

export const copyToClipboard = (text: string) => {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text)
      .then(() => {
        toast.success("Texto copiado para a área de transferência");
      })
      .catch(err => {
        console.error("Não foi possível copiar o texto:", err);
        toast.error("Não foi possível copiar o texto");
      });
  } else {
    // Fallback for older browsers
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      const successful = document.execCommand("copy");
      if (successful) {
        toast.success("Texto copiado para a área de transferência");
      } else {
        toast.error("Não foi possível copiar o texto");
      }
    } catch (err) {
      console.error("Não foi possível copiar o texto:", err);
      toast.error("Não foi possível copiar o texto");
    }
    
    document.body.removeChild(textArea);
  }
};
