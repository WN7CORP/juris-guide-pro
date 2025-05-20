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
import FloatingAudioPlayer from "./components/FloatingAudioPlayer";

const queryClient = new QueryClient();

function App() {
  // Force dark mode
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <>
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
      <FloatingAudioPlayer />
    </>
  );
}

export default App;
