
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Clock, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useViewHistory } from "@/hooks/useViewHistory";

export function ViewHistoryPanel() {
  const { history, clearHistory } = useViewHistory();
  const [isVisible, setIsVisible] = useState(false);
  
  // Format date for display
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  if (history.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <Button 
        variant="outline" 
        size="sm" 
        className="flex items-center gap-2 text-xs bg-background-dark border-gray-700"
        onClick={() => setIsVisible(!isVisible)}
      >
        <Clock className="h-3.5 w-3.5" />
        <span>Histórico</span>
      </Button>
      
      {isVisible && (
        <Card className="absolute right-0 mt-2 w-80 p-4 bg-background-dark border-gray-700 shadow-xl z-50 animate-in fade-in slide-in-from-top-5 duration-300">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-law-accent">Artigos Recentes</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearHistory}
              className="h-8 w-8 p-0 text-gray-400 hover:text-red-400"
            >
              <Trash className="h-4 w-4" />
              <span className="sr-only">Limpar histórico</span>
            </Button>
          </div>
          
          <ScrollArea className="h-64">
            <div className="space-y-2">
              {history.map((item) => (
                <Link 
                  key={item.id} 
                  to={item.path}
                  className="flex flex-col p-2 text-sm hover:bg-gray-800/50 rounded-md transition-colors"
                >
                  <span className="font-medium text-white">{item.title}</span>
                  <span className="text-xs text-gray-400">{formatDate(item.timestamp)}</span>
                </Link>
              ))}
            </div>
          </ScrollArea>
        </Card>
      )}
    </div>
  );
}

export default ViewHistoryPanel;
