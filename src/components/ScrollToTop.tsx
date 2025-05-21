
import React from "react";
import { ArrowUp } from "lucide-react";

interface ScrollToTopProps {
  show: boolean;
}

const ScrollToTop = ({
  show
}: ScrollToTopProps) => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  if (!show) return null;
  
  return (
    <button 
      onClick={scrollToTop} 
      aria-label="Voltar ao topo" 
      className="fixed right-4 bottom-32 z-10 bg-law-accent text-white p-2 rounded-full shadow-lg hover:bg-law-accent/90 transition-all px-[11px] py-[11px]"
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
};

export default ScrollToTop;
