
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import CodigosList from "./pages/CodigosList";
import CodigoView from "./pages/CodigoView";
import Favoritos from "./pages/Favoritos";
import Pesquisar from "./pages/Pesquisar";
import AudioComments from "./pages/AudioComments";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";

const queryClient = new QueryClient();

const App = () => {
  // Force dark mode
  useEffect(() => {
    document.documentElement.classList.add('dark');
    
    // Add CSS variables for animations
    const style = document.createElement('style');
    style.innerHTML = `
      :root {
        --animate-duration: 0.3s;
        --animate-delay: 0.1s;
      }
      
      .page-transition-enter {
        opacity: 0;
        transform: translateY(10px);
      }
      
      .page-transition-enter-active {
        opacity: 1;
        transform: translateY(0);
        transition: opacity var(--animate-duration) ease, transform var(--animate-duration) ease;
      }
      
      .page-transition-exit {
        opacity: 1;
        transform: translateY(0);
      }
      
      .page-transition-exit-active {
        opacity: 0;
        transform: translateY(-10px);
        transition: opacity var(--animate-duration) ease, transform var(--animate-duration) ease;
      }
      
      .fade-in {
        animation: fadeIn var(--animate-duration) ease forwards;
      }
      
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      .scale-in {
        animation: scaleIn var(--animate-duration) ease forwards;
      }
      
      @keyframes scaleIn {
        from { opacity: 0; transform: scale(0.95); }
        to { opacity: 1; transform: scale(1); }
      }
      
      .slide-in-right {
        animation: slideInRight var(--animate-duration) ease forwards;
      }
      
      @keyframes slideInRight {
        from { opacity: 0; transform: translateX(20px); }
        to { opacity: 1; transform: translateX(0); }
      }
      
      .slide-in-left {
        animation: slideInLeft var(--animate-duration) ease forwards;
      }
      
      @keyframes slideInLeft {
        from { opacity: 0; transform: translateX(-20px); }
        to { opacity: 1; transform: translateX(0); }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="dark bg-netflix-bg text-white min-h-screen">
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/codigos" element={<CodigosList />} />
              <Route path="/codigos/:codigoId" element={<CodigoView />} />
              <Route path="/favoritos" element={<Favoritos />} />
              <Route path="/pesquisar" element={<Pesquisar />} />
              <Route path="/audio-comentarios" element={<AudioComments />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
