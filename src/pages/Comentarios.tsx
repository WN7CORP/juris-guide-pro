
import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowLeft, Users, MessageSquare, Heart, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

  if (loadingArticle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!articleInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Artigo não encontrado</h2>
          <Link to="/" className="text-blue-400 hover:underline">
            Voltar ao início
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="border-b border-gray-700 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link 
              to={`/codigos/${articleInfo.codeId}`}
              className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Voltar ao código</span>
            </Link>
            
            <Separator orientation="vertical" className="h-6" />
            
            <div className="flex items-center gap-3">
              <MessageSquare className="h-6 w-6 text-blue-400" />
              <div>
                <h1 className="font-semibold text-white">
                  Comentários - Art. {articleInfo.numero}
                </h1>
                <p className="text-sm text-gray-400">{articleInfo.codeName}</p>
              </div>
            </div>
            
            <div className="ml-auto flex items-center gap-2 text-sm text-gray-400">
              <Users className="h-4 w-4" />
              <span>{comments.length} comentários</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar com informações do artigo */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-800/50 border-gray-700 sticky top-24">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-blue-400 border-blue-400">
                    Art. {articleInfo.numero}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium text-white mb-2">Conteúdo do Artigo</h3>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {articleInfo.artigo}
                  </p>
                </div>
                
                <Separator className="bg-gray-700" />
                
                <div className="space-y-3">
                  <h4 className="font-medium text-white text-sm">Estatísticas</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 bg-gray-700/50 rounded-lg">
                      <div className="text-lg font-semibold text-blue-400">
                        {comments.length}
                      </div>
                      <div className="text-xs text-gray-400">Comentários</div>
                    </div>
                    <div className="text-center p-3 bg-gray-700/50 rounded-lg">
                      <div className="text-lg font-semibold text-pink-400">
                        {comments.reduce((acc, comment) => acc + comment.likes_count, 0)}
                      </div>
                      <div className="text-xs text-gray-400">Curtidas</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Feed principal */}
          <div className="lg:col-span-2 space-y-6">
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
