
import { Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import { ThemeProvider } from "@/components/ui/theme-provider";
import Index from "@/pages/Index";
import CodigosList from "@/pages/CodigosList";
import CodigoView from "@/pages/CodigoView";
import Favoritos from "@/pages/Favoritos";
import Estatutos from "@/pages/Estatutos";
import ComentadosView from "@/pages/ComentadosView";
import Pesquisar from "@/pages/Pesquisar";
import NotFound from "@/pages/NotFound";
import ScrollToTop from "@/components/ScrollToTop";
import { NowPlayingIndicator } from "@/components/NowPlayingIndicator";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vade-mecum-theme">
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/codigos" element={<CodigosList />} />
        <Route path="/codigos/:id" element={<CodigoView />} />
        <Route path="/estatutos" element={<Estatutos />} />
        <Route path="/comentados" element={<ComentadosView />} />
        <Route path="/favoritos" element={<Favoritos />} />
        <Route path="/pesquisar" element={<Pesquisar />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <NowPlayingIndicator />
      <SonnerToaster position="top-center" closeButton richColors />
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
