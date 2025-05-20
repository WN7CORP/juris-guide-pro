
import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function ThemeToggle() {
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    // Check current mode when component mounts
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
  }, []);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={toggleTheme}
            className="w-9 h-9 p-0 rounded-full"
          >
            {isDarkMode ? (
              <Sun className="h-5 w-5 text-yellow-400" />
            ) : (
              <Moon className="h-5 w-5 text-gray-600" />
            )}
            <span className="sr-only">
              {isDarkMode ? "Mudar para modo claro" : "Mudar para modo escuro"}
            </span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {isDarkMode ? "Mudar para modo claro" : "Mudar para modo escuro"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default ThemeToggle;
