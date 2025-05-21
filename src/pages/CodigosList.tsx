import { useLocation, Link } from 'react-router-dom';
import { legalCodes } from "@/data/legalCodes";
import { Header } from "@/components/Header";
import { Scale, Gavel } from "lucide-react";

const CodigosList = () => {
  const location = useLocation();
  const filterParam = new URLSearchParams(location.search).get('filter');

  const filteredCodes = filterParam
    ? legalCodes.filter(code => code.category === filterParam)
    : legalCodes;

  return (
    <div className="min-h-screen flex flex-col dark">
      <Header />

      <main className="flex-1 container pt-4 pb-20 md:pb-6">
        <section className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-netflix-red mb-4">
            {filterParam === 'código' ? 'Códigos' : filterParam === 'estatuto' ? 'Estatutos' : 'Códigos e Estatutos'}
          </h1>
          <p className="text-gray-300 mb-6">
            {filterParam === 'código'
              ? 'Lista de Códigos do Vade Mecum Digital.'
              : filterParam === 'estatuto'
                ? 'Lista de Estatutos do Vade Mecum Digital.'
                : 'Lista completa de códigos e estatutos do Brasil.'}
          </p>

          {/* Display codes grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCodes.map(code => (
              <Link
                key={code.id}
                to={`/codigos/${code.id}`}
                className="p-4 bg-netflix-dark border border-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 card-hover-effect"
              >
                <div className="flex items-center mb-2">
                  {code.category === 'código' ? (
                    <Scale className="mr-2 h-5 w-5 text-law-accent" />
                  ) : code.category === 'estatuto' ? (
                    <Gavel className="mr-2 h-5 w-5 text-netflix-red" />
                  ) : (
                    <div className="w-5 h-5 mr-2"></div>
                  )}
                  <h3 className="font-semibold text-netflix-red">{code.title}</h3>
                </div>
                <p className="text-sm text-gray-400 mt-1">{code.description}</p>
                <div className="flex justify-between items-center mt-3">
                  <span className="inline-block text-xs font-medium bg-netflix-red/10 text-netflix-red px-2 py-1 rounded">
                    {code.shortTitle}
                  </span>
                  <span className="text-xs text-gray-500">
                    {code.articles.length} artigos
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default CodigosList;
