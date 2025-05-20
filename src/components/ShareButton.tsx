
import { Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { shareContent } from "@/utils/sharing";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ShareButtonProps {
  title: string;
  text: string;
  url?: string;
}

export function ShareButton({ title, text, url }: ShareButtonProps) {
  const handleShare = async () => {
    const currentUrl = url || window.location.href;
    const success = await shareContent({
      title,
      text,
      url: currentUrl
    });
    
    if (!success) {
      toast.error("Não foi possível compartilhar o conteúdo");
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="text-gray-400 hover:text-law-accent transition-colors"
          >
            <Share className="h-5 w-5" />
            <span className="sr-only">Compartilhar</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Compartilhar</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default ShareButton;
