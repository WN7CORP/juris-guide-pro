
import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { MobileFooter } from "@/components/MobileFooter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Eye, Heart, MessageCircle, TrendingUp, Users, BookOpen } from "lucide-react";
import { legalCodes } from "@/data/legalCodes";

interface RankedArticle {
  id: string;
  codeId: string;
  codeTitle: string;
  articleNumber: string;
  title: string;
  views: number;
  favorites: number;
  comments: number;
}

interface RankedUser {
  id: string;
  name: string;
  category: string;
  avatar_url?: string;
  points: number;
  articlesRead: number;
  postsCreated: number;
  commentsCount: number;
}

const Rankings = () => {
  const [rankedArticles, setRankedArticles] = useState<RankedArticle[]>([]);
  const [rankedUsers, setRankedUsers] = useState<RankedUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulação de dados de ranking
    const mockArticles: RankedArticle[] = [
      {
        id: '1',
        codeId: 'constituicao',
        codeTitle: 'Constituição Federal',
        articleNumber: 'Art. 5º',
        title: 'Direitos e garantias fundamentais',
        views: 1547,
        favorites: 89,
        comments: 23
      },
      {
        id: '3',
        codeId: 'codigo-civil',
        codeTitle: 'Código Civil',
        articleNumber: 'Art. 186',
        title: 'Ato ilícito',
        views: 1203,
        favorites: 67,
        comments: 15
      },
      {
        id: '121',
        codeId: 'codigo-penal',
        codeTitle: 'Código Penal',
        articleNumber: 'Art. 121',
        title: 'Homicídio',
        views: 1156,
        favorites: 78,
        comments: 31
      },
      {
        id: '2',
        codeId: 'constituicao',
        codeTitle: 'Constituição Federal',
        articleNumber: 'Art. 37',
        title: 'Administração Pública',
        views: 987,
        favorites: 56,
        comments: 12
      },
      {
        id: '927',
        codeId: 'codigo-civil',
        codeTitle: 'Código Civil',
        articleNumber: 'Art. 927',
        title: 'Responsabilidade civil',
        views: 856,
        favorites: 45,
        comments: 18
      }
    ];

    const mockUsers: RankedUser[] = [
      {
        id: '1',
        name: 'Dr. Carlos Mendes',
        category: 'advogado',
        points: 2450,
        articlesRead: 156,
        postsCreated: 23,
        commentsCount: 89
      },
      {
        id: '2',
        name: 'Ana Paula Silva',
        category: 'concurseiro',
        points: 2120,
        articlesRead: 203,
        postsCreated: 15,
        commentsCount: 67
      },
      {
        id: '3',
        name: 'Ricardo Santos',
        category: 'estudante',
        points: 1890,
        articlesRead: 134,
        postsCreated: 31,
        commentsCount: 52
      },
      {
        id: '4',
        name: 'Mariana Costa',
        category: 'advogado',
        points: 1675,
        articlesRead: 98,
        postsCreated: 19,
        commentsCount: 78
      },
      {
        id: '5',
        name: 'João Oliveira',
        category: 'concurseiro',
        points: 1456,
        articlesRead: 87,
        postsCreated: 12,
        commentsCount: 43
      }
    ];

    setRankedArticles(mockArticles);
    setRankedUsers(mockUsers);
    setLoading(false);
  }, []);

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Trophy className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Trophy className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="h-5 w-5 flex items-center justify-center text-sm font-bold text-gray-500">#{position}</span>;
    }
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'advogado':
        return 'bg-blue-500/20 text-blue-400';
      case 'concurseiro':
        return 'bg-green-500/20 text-green-400';
      case 'estudante':
        return 'bg-purple-500/20 text-purple-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-6 pb-20 md:pb-6 flex items-center justify-center">
          <p className="text-gray-400">Carregando rankings...</p>
        </main>
        <MobileFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-6 pb-20 md:pb-6">
        <h2 className="text-2xl font-serif font-bold text-law mb-6">
          Rankings
        </h2>

        <Tabs defaultValue="articles" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="articles" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Artigos
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Usuários
            </TabsTrigger>
          </TabsList>

          <TabsContent value="articles">
            <div className="grid gap-6 md:grid-cols-3 mb-8">
              <Card className="bg-netflix-dark border-gray-800">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-law-accent text-lg">
                    <Eye className="h-5 w-5" />
                    Mais Visualizados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {rankedArticles.slice(0, 3).map((article, index) => (
                      <div key={article.id} className="flex items-center gap-3">
                        {getRankIcon(index + 1)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            {article.articleNumber}
                          </p>
                          <p className="text-xs text-gray-400 truncate">
                            {article.codeTitle}
                          </p>
                        </div>
                        <span className="text-xs text-law-accent font-semibold">
                          {article.views.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-netflix-dark border-gray-800">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-law-accent text-lg">
                    <Heart className="h-5 w-5" />
                    Mais Favoritados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {rankedArticles
                      .sort((a, b) => b.favorites - a.favorites)
                      .slice(0, 3)
                      .map((article, index) => (
                        <div key={article.id} className="flex items-center gap-3">
                          {getRankIcon(index + 1)}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                              {article.articleNumber}
                            </p>
                            <p className="text-xs text-gray-400 truncate">
                              {article.codeTitle}
                            </p>
                          </div>
                          <span className="text-xs text-law-accent font-semibold">
                            {article.favorites}
                          </span>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-netflix-dark border-gray-800">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-law-accent text-lg">
                    <MessageCircle className="h-5 w-5" />
                    Mais Comentados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {rankedArticles
                      .sort((a, b) => b.comments - a.comments)
                      .slice(0, 3)
                      .map((article, index) => (
                        <div key={article.id} className="flex items-center gap-3">
                          {getRankIcon(index + 1)}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                              {article.articleNumber}
                            </p>
                            <p className="text-xs text-gray-400 truncate">
                              {article.codeTitle}
                            </p>
                          </div>
                          <span className="text-xs text-law-accent font-semibold">
                            {article.comments}
                          </span>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-netflix-dark border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-law-accent">
                  <TrendingUp className="h-5 w-5" />
                  Ranking Completo de Artigos
                </CardTitle>
                <CardDescription>
                  Ordenado por número total de visualizações
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {rankedArticles.map((article, index) => (
                    <div key={article.id} className="flex items-center gap-4 p-3 rounded-lg bg-netflix-bg/50">
                      <div className="flex items-center gap-3">
                        {getRankIcon(index + 1)}
                        <div>
                          <h3 className="font-semibold text-white">{article.articleNumber}</h3>
                          <p className="text-sm text-gray-400">{article.codeTitle}</p>
                          {article.title && (
                            <p className="text-xs text-gray-500">{article.title}</p>
                          )}
                        </div>
                      </div>
                      <div className="ml-auto flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1 text-gray-400">
                          <Eye className="h-4 w-4" />
                          {article.views.toLocaleString()}
                        </div>
                        <div className="flex items-center gap-1 text-gray-400">
                          <Heart className="h-4 w-4" />
                          {article.favorites}
                        </div>
                        <div className="flex items-center gap-1 text-gray-400">
                          <MessageCircle className="h-4 w-4" />
                          {article.comments}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card className="bg-netflix-dark border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-law-accent">
                  <Trophy className="h-5 w-5" />
                  Ranking de Usuários
                </CardTitle>
                <CardDescription>
                  Usuários mais ativos da comunidade
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {rankedUsers.map((user, index) => (
                    <div key={user.id} className="flex items-center gap-4 p-4 rounded-lg bg-netflix-bg/50">
                      <div className="flex items-center gap-3">
                        {getRankIcon(index + 1)}
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={user.avatar_url} />
                          <AvatarFallback className="bg-law-accent/20 text-law-accent">
                            {user.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-white">{user.name}</h3>
                          <Badge className={`text-xs ${getCategoryBadgeColor(user.category)}`}>
                            {user.category}
                          </Badge>
                        </div>
                      </div>
                      <div className="ml-auto flex items-center gap-6 text-sm">
                        <div className="text-center">
                          <p className="text-law-accent font-bold text-lg">{user.points}</p>
                          <p className="text-gray-400 text-xs">pontos</p>
                        </div>
                        <div className="text-center">
                          <p className="text-white font-semibold">{user.articlesRead}</p>
                          <p className="text-gray-400 text-xs">artigos lidos</p>
                        </div>
                        <div className="text-center">
                          <p className="text-white font-semibold">{user.postsCreated}</p>
                          <p className="text-gray-400 text-xs">posts criados</p>
                        </div>
                        <div className="text-center">
                          <p className="text-white font-semibold">{user.commentsCount}</p>
                          <p className="text-gray-400 text-xs">comentários</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      <MobileFooter />
    </div>
  );
};

export default Rankings;
