
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-6 flex flex-col items-center justify-center">
        <h2 className="text-4xl font-serif font-bold text-law mb-4">404</h2>
        <p className="text-xl text-gray-600 mb-6">Página não encontrada</p>
        
        <Button asChild>
          <Link to="/">Voltar para o início</Link>
        </Button>
      </main>
    </div>
  );
};

export default NotFound;
