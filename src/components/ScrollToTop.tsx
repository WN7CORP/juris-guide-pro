
import React, { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

interface ScrollToTopProps {
  show: boolean;
}

const ScrollToTop = ({
  show = false // Default value for the prop
}: ScrollToTopProps) => {
  const [visible, setVisible] = useState(show);
  
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };
    
    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);
  
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  if (!visible) return null;
  
  return (
    <button 
      onClick={scrollToTop} 
      aria-label="Voltar ao topo" 
      className="fixed right-4 bottom-24 md:bottom-16 z-10 bg-law-accent text-white p-2 rounded-full shadow-lg hover:bg-law-accent/90 transition-all py-[13px] px-[13px] my-0 mx-0"
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
};

export default ScrollToTop;
