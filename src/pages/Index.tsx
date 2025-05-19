
import { Link } from "react-router-dom";
import { legalCodes } from "@/data/legalCodes";
import { TopNavigation } from "@/components/TopNavigation";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col dark">
      <TopNavigation />
      
      <main className="flex-1 container py-6 pb-20 md:pb-6 mt-16">
        <section className="mb-8 animate-fade-in">
          <h2 className="text-3xl font-serif font-bold text-netflix-red mb-4">
            Vade Mecum Digital
          </h2>
          <p className="text-gray-300 mb-4">
            Bem-vindo ao seu guia jurídico digital. Acesse os principais códigos e estatutos com explicações e exemplos práticos.
          </p>
        </section>

        <section className="mb-12">
          <h3 className="text-xl font-serif font-bold text-gray-200 mb-4 animate-fade-in">
            Códigos e Estatutos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {legalCodes.map((code, index) => (
              <Link
                key={code.id}
                to={`/codigos/${code.id}`}
                className="p-4 bg-netflix-dark border border-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 hover:border-gray-700 animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <h3 className="font-semibold text-netflix-red">{code.title}</h3>
                <p className="text-sm text-gray-400 mt-1">{code.description}</p>
                <span className="inline-block text-xs font-medium bg-netflix-red/10 text-netflix-red px-2 py-1 rounded mt-2">
                  {code.shortTitle}
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-xl font-serif font-bold text-gray-200 mb-4 animate-fade-in">
            Recursos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              to="/favoritos"
              className="p-4 bg-netflix-dark border border-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 hover:border-gray-700 animate-fade-in"
            >
              <h4 className="font-semibold text-netflix-red">Artigos Favoritos</h4>
              <p className="text-sm text-gray-400 mt-1">
                Acesse seus artigos salvos para consulta rápida.
              </p>
            </Link>
            <Link
              to="/pesquisar"
              className="p-4 bg-netflix-dark border border-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 hover:border-gray-700 animate-fade-in"
              style={{ animationDelay: '50ms' }}
            >
              <h4 className="font-semibold text-netflix-red">Pesquisar</h4>
              <p className="text-sm text-gray-400 mt-1">
                Encontre conteúdos específicos em todos os códigos.
              </p>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
