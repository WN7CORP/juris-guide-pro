
import { useParams, Navigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { EnhancedCommentSystem } from '@/components/comments/EnhancedCommentSystem';
import { useAuth } from '@/hooks/useAuth';
import { legalCodes } from '@/data/legalCodes';
import { ArrowLeft, Scale } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Comentarios = () => {
  const { articleId } = useParams<{ articleId: string }>();
  const { user, profile } = useAuth();

  if (!articleId) {
    return <Navigate to="/" replace />;
  }

  // Find the article in legal codes
  let foundArticle = null;
  let foundCode = null;

  for (const code of legalCodes) {
    if (code.content && code.content.articles) {
      const article = code.content.articles.find(art => art.id === articleId);
      if (article) {
        foundArticle = article;
        foundCode = code;
        break;
      }
    }
  }

  if (!foundArticle || !foundCode) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col dark bg-netflix-bg">
      <Header />
      
      <main className="flex-1 container py-6">
        <div className="mb-6">
          <Link to={`/codigos/${foundCode.id}`}>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para {foundCode.shortTitle}
            </Button>
          </Link>
          
          <div className="flex items-center gap-3 mb-4">
            <Scale className="w-6 h-6 text-law-accent" />
            <div>
              <h1 className="text-2xl font-bold text-white">
                Art. {foundArticle.number}
              </h1>
              <p className="text-gray-400">
                {foundCode.title}
              </p>
            </div>
          </div>
          
          <div className="bg-netflix-dark p-4 rounded-lg border border-gray-800">
            <p className="text-gray-300 leading-relaxed">
              {foundArticle.content}
            </p>
          </div>
        </div>

        <EnhancedCommentSystem 
          articleId={articleId} 
          articleNumber={foundArticle.number}
        />
      </main>
    </div>
  );
};

export default Comentarios;
