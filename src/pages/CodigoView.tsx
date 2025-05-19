
import { useParams, Link } from "react-router-dom";
import { legalCodes } from "@/data/legalCodes";
import { Header } from "@/components/Header";
import { MobileFooter } from "@/components/MobileFooter";
import { ArticleView } from "@/components/ArticleView";
import { ChevronLeft } from "lucide-react";

const CodigoView = () => {
  const { codigoId } = useParams<{ codigoId: string }>();
  const codigo = legalCodes.find((c) => c.id === codigoId);

  if (!codigo) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1 container py-6 pb-20 md:pb-6 flex flex-col items-center justify-center">
          <h2 className="text-2xl font-bold text-law mb-4">Código não encontrado</h2>
          <Link to="/codigos" className="text-law hover:underline">
            Voltar para lista de códigos
          </Link>
        </main>
        
        <MobileFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-6 pb-20 md:pb-6">
        <Link to="/codigos" className="flex items-center text-law mb-4 hover:underline">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Voltar para lista de códigos
        </Link>
        
        <div className="mb-6">
          <h2 className="text-2xl font-serif font-bold text-law">
            {codigo.title}
          </h2>
          <p className="text-gray-600 mt-1">{codigo.description}</p>
        </div>
        
        <div className="space-y-8">
          {codigo.articles.map((article) => (
            <ArticleView key={article.id} article={article} />
          ))}
        </div>
      </main>
      
      <MobileFooter />
    </div>
  );
};

export default CodigoView;
