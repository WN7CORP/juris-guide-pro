
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { fetchLegalCode } from "@/services/legalCodeService";
import { tableNameMap } from "@/utils/tableMapping";
import { ArrowLeft, Volume } from "lucide-react";
import { Button } from "@/components/ui/button";
import { globalAudioState } from "@/components/AudioCommentPlaylist";
import { useRecentArticlesStore } from "@/store/recentArticlesStore";
import { legalCodes } from "@/data/legalCodes";

const CodigoView = () => {
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [legalCode, setLegalCode] = useState<any>(null);
  const [currentArticle, setCurrentArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [articleIdFromURL, setArticleIdFromURL] = useState<string | null>(null);

  const { addRecentArticle } = useRecentArticlesStore();

  useEffect(() => {
    const fetchCode = async () => {
      setLoading(true);
      try {
        const codigoId = params.codigoId as string;
        const tableName = tableNameMap[codigoId];

        if (!tableName) {
          console.error(`Table name not found for code ID: ${codigoId}`);
          return;
        }

        const data = await fetchLegalCode(tableName);
        setLegalCode({
          id: codigoId,
          title: legalCodes.find((code) => code.id === codigoId)?.title || "Código",
          articles: data,
        });
      } catch (error) {
        console.error("Error fetching legal code:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCode();
  }, [params.codigoId]);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const articleParam = urlParams.get('article');
    setArticleIdFromURL(articleParam);
  }, [location.search]);

  useEffect(() => {
    if (legalCode?.articles && articleIdFromURL) {
      const article = legalCode.articles.find(
        (art: any) => art.id.toString() === articleIdFromURL
      );
      setCurrentArticle(article || legalCode.articles[0]);
    } else if (legalCode?.articles) {
      setCurrentArticle(legalCode.articles[0]);
    }
  }, [legalCode?.articles, articleIdFromURL]);

  useEffect(() => {
    if (currentArticle && legalCode) {
      addRecentArticle({
        id: currentArticle.id.toString(),
        title: currentArticle.texto || "",
        number: currentArticle.numero,
        codeId: params.codigoId as string,
        codeName: legalCode.title
      });
    }
  }, [currentArticle, legalCode, addRecentArticle, params.codigoId]);

  const playAudioComment = (article: any) => {
    if (!article.comentario_audio) return;

    globalAudioState.currentAudioId = article.id;
    globalAudioState.minimalPlayerInfo = {
      codeId: params.codigoId,
      articleId: article.id,
      articleNumber: article.numero,
      audioUrl: article.comentario_audio
    };

    if (globalAudioState.audioElement) {
      globalAudioState.audioElement.pause();
    }

    globalAudioState.audioElement = new Audio(article.comentario_audio);
    globalAudioState.audioElement.play();
    globalAudioState.isPlaying = true;
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center dark">
      <span className="loading loading-dots loading-lg text-law-accent"></span>
    </div>;
  }

  if (!legalCode) {
    return <div className="min-h-screen flex items-center justify-center dark">
      <span className="text-red-500">Código não encontrado.</span>
    </div>;
  }

  return (
    <div className="min-h-screen flex flex-col dark">
      <header className="sticky top-0 z-10 bg-netflix-bg border-b border-gray-800 p-4 flex items-center">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <h1 className="text-lg font-semibold text-white ml-4">{legalCode.title}</h1>
      </header>

      <div className="flex flex-col md:flex-row flex-1">
        {/* Sidebar with article list */}
        <aside className="w-full md:w-80 bg-netflix-dark border-r border-gray-800 overflow-y-auto">
          <nav className="p-4">
            <ul>
              {legalCode.articles.map((article: any) => (
                <li key={article.id} className="mb-1">
                  <Link
                    to={`?article=${article.id}`}
                    className={`block p-3 rounded-md hover:bg-gray-700 ${currentArticle?.id === article.id ? 'bg-gray-700 text-law-accent' : 'text-gray-400'}`}
                  >
                    <div className="flex items-center justify-between">
                      <span>Art. {article.numero}</span>
                      {article.comentario_audio && (
                        <Volume className="h-4 w-4 text-law-accent" />
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Main content with article text */}
        <main className="flex-1 p-6 overflow-y-auto">
          {currentArticle ? (
            <div>
              <h2 className="text-2xl font-semibold text-law-accent mb-4">
                Art. {currentArticle.numero}
              </h2>
              <p className="text-gray-300 leading-relaxed">
                {currentArticle.texto}
              </p>

              {currentArticle.comentario_audio && (
                <div className="mt-6">
                  <Button onClick={() => playAudioComment(currentArticle)}>
                    Ouvir Comentário <Volume className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-400">Selecione um artigo para visualizar.</p>
          )}
        </main>
      </div>
    </div>
  );
};

export default CodigoView;
