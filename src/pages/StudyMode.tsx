
import { useState, useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { MobileFooter } from "@/components/MobileFooter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Clock, Target, Trophy } from "lucide-react";
import { legalCodes } from "@/data/legalCodes";
import { useFavoritesStore } from "@/store/favoritesStore";

const StudyMode = () => {
  const { codeId } = useParams();
  const [studyTime, setStudyTime] = useState(0);
  const [isStudying, setIsStudying] = useState(false);
  const { favorites } = useFavoritesStore();

  const code = legalCodes.find(c => c.id === codeId);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isStudying) {
      interval = setInterval(() => {
        setStudyTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isStudying]);

  if (!code) {
    return <Navigate to="/codigos" replace />;
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleStudyMode = () => {
    setIsStudying(!isStudying);
  };

  const resetTimer = () => {
    setStudyTime(0);
    setIsStudying(false);
  };

  // Filter favorites for this specific code with proper null checking
  const codeFavorites = favorites.filter((fav): fav is string => 
    typeof fav === 'string' && fav.includes(codeId || '')
  );

  const favoriteArticles = codeFavorites.map(favId => {
    // Extract article ID from the favorite ID (assuming format like "codeId-articleId")
    const articleId = favId.split('-').pop();
    if (articleId) {
      return {
        id: articleId,
        title: `Artigo ${articleId}`
      };
    }
    return null;
  }).filter((article): article is { id: string; title: string } => article !== null);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-6 pb-20 md:pb-6">
        <div className="mb-6">
          <h1 className="text-3xl font-serif font-bold text-law mb-2">
            Modo Estudo
          </h1>
          <p className="text-gray-300">
            Estudando: {code.title}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {/* Study Timer Card */}
          <Card className="bg-netflix-dark border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-law-accent">
                <Clock className="h-5 w-5" />
                Cronômetro de Estudo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-4xl font-mono font-bold text-white mb-4">
                  {formatTime(studyTime)}
                </div>
                <div className="flex gap-2 justify-center">
                  <Button 
                    onClick={toggleStudyMode}
                    variant={isStudying ? "destructive" : "default"}
                    className="flex-1"
                  >
                    {isStudying ? "Pausar" : "Iniciar"}
                  </Button>
                  <Button 
                    onClick={resetTimer}
                    variant="outline"
                    size="icon"
                  >
                    <Target className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Study Progress Card */}
          <Card className="bg-netflix-dark border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-law-accent">
                <Trophy className="h-5 w-5" />
                Progresso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-300">Artigos Favoritados</span>
                  <span className="text-sm font-semibold text-white">{favoriteArticles.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-300">Tempo de Estudo</span>
                  <span className="text-sm font-semibold text-white">{formatTime(studyTime)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-300">Status</span>
                  <span className={`text-sm font-semibold ${isStudying ? 'text-green-400' : 'text-gray-400'}`}>
                    {isStudying ? 'Estudando' : 'Parado'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Access Card */}
          <Card className="bg-netflix-dark border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-law-accent">
                <BookOpen className="h-5 w-5" />
                Acesso Rápido
              </CardTitle>
              <CardDescription>
                Seus artigos favoritados
              </CardDescription>
            </CardHeader>
            <CardContent>
              {favoriteArticles.length > 0 ? (
                <div className="space-y-2">
                  {favoriteArticles.slice(0, 3).map((article) => (
                    <Button
                      key={article.id}
                      variant="ghost"
                      className="w-full justify-start text-left h-auto p-2"
                      asChild
                    >
                      <a href={`/codigos/${codeId}?article=${article.id}`}>
                        <div className="text-sm text-gray-300">
                          {article.title}
                        </div>
                      </a>
                    </Button>
                  ))}
                  {favoriteArticles.length > 3 && (
                    <p className="text-xs text-gray-500 text-center">
                      +{favoriteArticles.length - 3} artigos
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center">
                  Nenhum artigo favoritado ainda
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Study Tips */}
        <Card className="bg-netflix-dark border-gray-800">
          <CardHeader>
            <CardTitle className="text-law-accent">Dicas de Estudo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-semibold text-white mb-2">Técnica Pomodoro</h4>
                <p className="text-sm text-gray-300">
                  Estude por 25 minutos, descanse 5. A cada 4 ciclos, descanse 15-30 minutos.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">Revisão Ativa</h4>
                <p className="text-sm text-gray-300">
                  Faça anotações e teste seu conhecimento sem olhar o material.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      
      <MobileFooter />
    </div>
  );
};

export default StudyMode;
