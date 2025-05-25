
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import CodigosList from "./pages/CodigosList";
import CodigoView from "./pages/CodigoView";
import Favoritos from "./pages/Favoritos";
import Pesquisar from "./pages/Pesquisar";
import AudioComments from "./pages/AudioComments";
import Anotacoes from "./pages/Anotacoes";
import Auth from "./pages/Auth";
import Community from "./pages/Community";
import Rankings from "./pages/Rankings";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App = () => {
  // Force dark mode and set theme properties
  useEffect(() => {
    document.documentElement.classList.add('dark');
    
    // Set theme colors in root CSS variables
    document.documentElement.style.setProperty('--background', '0 0% 8%');
    document.documentElement.style.setProperty('--foreground', '0 0% 98%');
    document.documentElement.style.setProperty('--card', '0 0% 11%');
    document.documentElement.style.setProperty('--card-foreground', '0 0% 98%');
    document.documentElement.style.setProperty('--popover', '0 0% 13%');
    document.documentElement.style.setProperty('--popover-foreground', '0 0% 98%');
    document.documentElement.style.setProperty('--primary', '357 92% 47%');
    document.documentElement.style.setProperty('--primary-foreground', '0 0% 98%');
    document.documentElement.style.setProperty('--muted', '0 0% 19%');
    document.documentElement.style.setProperty('--muted-foreground', '0 0% 63.9%');
    document.documentElement.style.setProperty('--accent', '25 100% 60%');
    document.documentElement.style.setProperty('--accent-foreground', '0 0% 98%');
    document.documentElement.style.setProperty('--destructive', '0 62.8% 30.6%');
    document.documentElement.style.setProperty('--destructive-foreground', '0 0% 98%');
    document.documentElement.style.setProperty('--border', '0 0% 14.9%');
    document.documentElement.style.setProperty('--input', '0 0% 14.9%');
    document.documentElement.style.setProperty('--ring', '25 100% 60%');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="dark bg-netflix-bg text-white min-h-screen">
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/auth" element={<Auth />} />
              
              {/* Protected routes */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              } />
              <Route path="/codigos" element={
                <ProtectedRoute>
                  <CodigosList />
                </ProtectedRoute>
              } />
              <Route path="/codigos/:codigoId" element={
                <ProtectedRoute>
                  <CodigoView />
                </ProtectedRoute>
              } />
              <Route path="/favoritos" element={
                <ProtectedRoute>
                  <Favoritos />
                </ProtectedRoute>
              } />
              <Route path="/pesquisar" element={
                <ProtectedRoute>
                  <Pesquisar />
                </ProtectedRoute>
              } />
              <Route path="/audio-comentarios" element={
                <ProtectedRoute>
                  <AudioComments />
                </ProtectedRoute>
              } />
              <Route path="/anotacoes" element={
                <ProtectedRoute>
                  <Anotacoes />
                </ProtectedRoute>
              } />
              <Route path="/comunidade" element={
                <ProtectedRoute>
                  <Community />
                </ProtectedRoute>
              } />
              <Route path="/rankings" element={
                <ProtectedRoute>
                  <Rankings />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
