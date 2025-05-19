
import { Link } from "react-router-dom";
import { legalCodes } from "@/data/legalCodes";
import { Header } from "@/components/Header";
import { MobileFooter } from "@/components/MobileFooter";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-6 pb-20 md:pb-6">
        <section className="mb-8">
          <h2 className="text-3xl font-serif font-bold text-law mb-4">
            Vade Mecum Digital
          </h2>
          <p className="text-gray-700 mb-4">
            Bem-vindo ao seu guia jurídico digital. Acesse os principais códigos e estatutos com explicações e exemplos práticos.
          </p>
        </section>

        <section className="mb-12">
          <h3 className="text-xl font-serif font-bold text-law-light mb-4">
            Códigos e Estatutos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {legalCodes.map((code) => (
              <Link
                key={code.id}
                to={`/codigos/${code.id}`}
                className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <h3 className="font-semibold text-law">{code.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{code.description}</p>
                <span className="inline-block text-xs font-medium bg-law/10 text-law px-2 py-1 rounded mt-2">
                  {code.shortTitle}
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-xl font-serif font-bold text-law-light mb-4">
            Recursos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              to="/favoritos"
              className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <h4 className="font-semibold text-law">Artigos Favoritos</h4>
              <p className="text-sm text-gray-600 mt-1">
                Acesse seus artigos salvos para consulta rápida.
              </p>
            </Link>
            <Link
              to="/pesquisar"
              className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <h4 className="font-semibold text-law">Pesquisar</h4>
              <p className="text-sm text-gray-600 mt-1">
                Encontre conteúdos específicos em todos os códigos.
              </p>
            </Link>
          </div>
        </section>
      </main>
      
      <MobileFooter />
    </div>
  );
};

export default Index;
