import { Link } from "react-router-dom";
import { legalCodes } from "@/data/legalCodes";
import { Header } from "@/components/Header";
import { MobileFooter } from "@/components/MobileFooter";
const CodigosList = () => {
  return <div className="min-h-screen flex flex-col dark">
      <Header />
      
      <main className="flex-1 container py-6 pb-20 md:pb-6 px-[16px]">
        <h2 className="text-2xl font-serif font-bold text-netflix-red mb-6">
          Códigos e Estatutos
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {legalCodes.map(code => <Link key={code.id} to={`/codigos/${code.id}`} className="p-6 bg-netflix-dark border border-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 card-hover-effect">
              <div className="flex justify-between items-start">
                <h3 className="font-serif font-bold text-lg text-netflix-red">{code.title}</h3>
                <span className="inline-block text-xs font-medium bg-netflix-red/10 text-netflix-red px-2 py-1 rounded">
                  {code.shortTitle}
                </span>
              </div>
              <p className="text-sm text-gray-400 mt-2">{code.description}</p>
              <p className="text-xs text-gray-500 mt-4">
                {code.articles.length} artigos
              </p>
            </Link>)}
        </div>
      </main>
      
      <MobileFooter />
    </div>;
};
export default CodigosList;