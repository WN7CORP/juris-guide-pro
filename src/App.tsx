
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import Index from "./pages/Index";
import CodigosList from "./pages/CodigosList";
import CodigoView from "./pages/CodigoView";
import Favoritos from "./pages/Favoritos";
import Pesquisar from "./pages/Pesquisar";
import AudioComments from "./pages/AudioComments";
import Anotacoes from "./pages/Anotacoes";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { AuthGuard } from "@/components/AuthGuard";
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

const AppContent = () => {
  const { user, loading } = useAuth();

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-netflix-bg text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-law-accent"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/auth" element={user ? <Navigate to="/" replace /> : <Auth />} />
      <Route path="/" element={
        <AuthGuard>
          <Index />
        </AuthGuard>
      } />
      <Route path="/codigos" element={
        <AuthGuard>
          <CodigosList />
        </AuthGuard>
      } />
      <Route path="/codigos/:codigoId" element={
        <AuthGuard>
          <CodigoView />
        </AuthGuard>
      } />
      <Route path="/favoritos" element={
        <AuthGuard>
          <Favoritos />
        </AuthGuard>
      } />
      <Route path="/pesquisar" element={
        <AuthGuard>
          <Pesquisar />
        </AuthGuard>
      } />
      <Route path="/audio-comentarios" element={
        <AuthGuard>
          <AudioComments />
        </AuthGuard>
      } />
      <Route path="/anotacoes" element={
        <AuthGuard>
          <Anotacoes />
        </AuthGuard>
      } />
      <Route path="/profile" element={
        <AuthGuard>
          <Profile />
        </AuthGuard>
      } />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <div className="dark bg-netflix-bg text-white min-h-screen">
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppContent />
            </BrowserRouter>
          </div>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
