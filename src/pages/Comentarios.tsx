
import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowLeft, Users, MessageSquare, Heart, Award, TrendingUp, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useComments, SortOption } from "@/hooks/useComments";
import { useAuth } from "@/hooks/useAuth";
import { CommentForm } from "@/components/comments/CommentForm";
import { CommentFeed } from "@/components/comments/CommentFeed";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { UserProfile } from "@/components/user/UserProfile";
import { legalCodes } from "@/data/legalCodes";
import { fetchLegalCode } from "@/services/legalCodeService";
import { tableNameMap } from "@/utils/tableMapping";

const Comentarios = () => {
  const { articleId } = useParams<{ articleId: string }>();
  const { user, profile } = useAuth();
  const { comments, loading, sortBy, setSortBy, addComment, toggleLike, toggleRecommendation } = useComments(articleId || '');
  
  const [showAuth, setShowAuth] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [articleInfo, setArticleInfo] = useState<any>(null);
  const [loadingArticle, setLoadingArticle] = useState(true);

  // Load article information
  useEffect(() => {
    const loadArticleInfo = async () => {
      if (!articleId) return;
      
      try {
        // Find which code this article belongs to by searching all codes
        for (const code of legalCodes) {
          const tableName = tableNameMap[code.id];
          if (tableName) {
            const { articles } = await fetchLegalCode(tableName, 1, 1000);
            const article = articles.find(a => a.id?.toString() === articleId);
            if (article) {
              setArticleInfo({
                ...article,
                codeName: code.title,
                codeId: code.id
              });
              break;
            }
          }
        }
      } catch (error) {
        console.error('Error loading article info:', error);
      } finally {
        setLoadingArticle(false);
      }
    };

    loadArticleInfo();
  }, [articleId]);

  const handleCommentSubmit = async (content: string, tag: any) => {
    if (!user) {
      setShowAuth(true);
      return;
    }

    if (!profile) {
      setShowProfile(true);
      return;
    }

    await addComment(content, tag);
  };

  // Calculate stats
  const totalLikes = comments.reduce((acc, comment) => acc + comment.likes_count, 0);
  const recommendedCount = comments.filter(comment => comment.is_recommended).length;
  const activeUsers = new Set(comments.map(comment => comment.user_id)).size;

  if (loadingArticle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="text-gray-400">Carregando comentários...</span>
        </div>
      </div>
    );
  }

  if (!articleInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-6xl">📄</div>
          <h2 className="text-2xl font-bold text-white">Artigo não encontrado</h2>
          <p className="text-gray-400">O artigo que você está procurando não existe ou foi removido.</p>
          <Link to="/" className="inline-block">
            <Button variant="outline" className="border-gray-600 hover:bg-gray-700/50">
              Voltar ao início
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="border-b border-gray-700/50 bg-gray-900/80 backdrop-blur-lg sticky top-0 z-20 shadow-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link 
              to={`/codigos/${articleInfo.codeId}`}
              className="flex items-center gap-2 text-gray-300 hover:text-white transition-all hover:scale-105"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Voltar ao código</span>
            </Link>
            
            <Separator orientation="vertical" className="h-6 bg-gray-600" />
            
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <MessageSquare className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h1 className="font-bold text-white text-lg">
                  Comentários - Art. {articleInfo.numero}
                </h1>
                <p className="text-sm text-gray-400">{articleInfo.codeName}</p>
              </div>
            </div>
            
            <div className="ml-auto flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2 text-blue-400">
                <Users className="h-4 w-4" />
                <span className="font-medium">{comments.length}</span>
                <span className="text-gray-500">comentários</span>
              </div>
              
              <div className="flex items-center gap-2 text-pink-400">
                <Heart className="h-4 w-4" />
                <span className="font-medium">{totalLikes}</span>
                <span className="text-gray-500">curtidas</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Sidebar com informações do artigo */}
          <div className="xl:col-span-1">
            <div className="sticky top-28 space-y-6">
              <Card className="bg-gray-800/60 border-gray-700/50 backdrop-blur-sm shadow-xl">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-blue-400 border-blue-400 bg-blue-500/10">
                      Art. {articleInfo.numero}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                      <Activity className="h-4 w-4 text-blue-400" />
                      Conteúdo do Artigo
                    </h3>
                    <p className="text-sm text-gray-300 leading-relaxed bg-gray-700/30 p-3 rounded-lg">
                      {articleInfo.artigo}
                    </p>
                  </div>
                  
                  <Separator className="bg-gray-700/50" />
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold text-white text-sm flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-emerald-400" />
                      Estatísticas da Discussão
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-4 bg-gradient-to-br from-blue-500/10 to-purple-500/5 rounded-xl border border-blue-500/20">
                        <div className="text-2xl font-bold text-blue-400 mb-1">
                          {comments.length}
                        </div>
                        <div className="text-xs text-gray-400">Comentários</div>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-pink-500/10 to-red-500/5 rounded-xl border border-pink-500/20">
                        <div className="text-2xl font-bold text-pink-400 mb-1">
                          {totalLikes}
                        </div>
                        <div className="text-xs text-gray-400">Curtidas</div>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-amber-500/10 to-orange-500/5 rounded-xl border border-amber-500/20">
                        <div className="text-2xl font-bold text-amber-400 mb-1">
                          {recommendedCount}
                        </div>
                        <div className="text-xs text-gray-400">Recomendados</div>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-emerald-500/10 to-green-500/5 rounded-xl border border-emerald-500/20">
                        <div className="text-2xl font-bold text-emerald-400 mb-1">
                          {activeUsers}
                        </div>
                        <div className="text-xs text-gray-400">Usuários</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Feed principal */}
          <div className="xl:col-span-3 space-y-8">
            {/* Formulário de comentário */}
            <CommentForm 
              onSubmit={handleCommentSubmit}
              user={user}
              profile={profile}
              onShowAuth={() => setShowAuth(true)}
              onShowProfile={() => setShowProfile(true)}
            />

            {/* Feed de comentários */}
            <CommentFeed 
              comments={comments}
              loading={loading}
              sortBy={sortBy}
              setSortBy={setSortBy}
              onToggleLike={toggleLike}
              onToggleRecommendation={toggleRecommendation}
              user={user}
            />
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <AuthDialog 
        open={showAuth} 
        onOpenChange={setShowAuth}
        onSuccess={() => {
          setShowAuth(false);
          if (!profile) {
            setShowProfile(true);
          }
        }}
      />

      <UserProfile 
        open={showProfile} 
        onOpenChange={setShowProfile}
      />
    </div>
  );
};

export default Comentarios;
