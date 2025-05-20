
import { useState } from "react";
import { Header } from "@/components/Header";
import { MobileFooter } from "@/components/MobileFooter";
import { legalCodes } from "@/data/legalCodes";
import { Link } from "react-router-dom";
import { BookOpen, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const Estatutos = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Filter codes that are estatutos (those that have "estatuto" in the title)
  const estatutos = legalCodes.filter(
    code => code.title.toLowerCase().includes("estatuto")
  );
  
  // Filter based on search term
  const filteredEstatutos = estatutos.filter(
    code => code.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-6 pb-20 md:pb-6">
        <div className="mb-6">
          <h2 className="text-2xl font-serif font-bold text-netflix-red mb-4 flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            <span>Estatutos</span>
          </h2>
          <p className="text-gray-300 mb-6">
            Consulte os principais estatutos jurídicos brasileiros
          </p>
          
          <div className="relative mb-6">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar estatutos..."
              className="pl-10 bg-netflix-dark border-gray-700"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {filteredEstatutos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEstatutos.map((estatuto) => (
              <Link
                key={estatuto.id}
                to={`/codigos/${estatuto.id}`}
                className="card-glow p-4 bg-netflix-dark border border-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 hover:border-gray-700"
              >
                <h3 className="font-semibold text-netflix-red">{estatuto.title}</h3>
                <p className="text-sm text-gray-400 mt-1">{estatuto.description}</p>
                <span className="inline-block text-xs font-medium bg-netflix-red/10 text-netflix-red px-2 py-1 rounded mt-2">
                  {estatuto.shortTitle}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-300">Nenhum estatuto encontrado</h3>
            <p className="text-gray-400 max-w-md mx-auto mt-2">
              Tente modificar sua busca ou verifique a seção de códigos.
            </p>
          </div>
        )}
      </main>
      
      <MobileFooter />
    </div>
  );
};

export default Estatutos;
