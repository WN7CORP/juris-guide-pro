
import { Link } from "react-router-dom";
import { legalCodes } from "@/data/legalCodes";
import { Header } from "@/components/Header";
import { MobileFooter } from "@/components/MobileFooter";

const CodigosList = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-6 pb-20 md:pb-6">
        <h2 className="text-2xl font-serif font-bold text-law mb-6">
          Códigos e Estatutos
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {legalCodes.map((code) => (
            <Link
              key={code.id}
              to={`/codigos/${code.id}`}
              className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <h3 className="font-serif font-bold text-lg text-law">{code.title}</h3>
                <span className="inline-block text-xs font-medium bg-law/10 text-law px-2 py-1 rounded">
                  {code.shortTitle}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-2">{code.description}</p>
              <p className="text-xs text-gray-500 mt-4">
                {code.articles.length} artigos
              </p>
            </Link>
          ))}
        </div>
      </main>
      
      <MobileFooter />
    </div>
  );
};

export default CodigosList;
