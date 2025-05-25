
import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { MobileFooter } from "@/components/MobileFooter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, MessageCircle, Share2, Plus, Search, Filter } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useCommunityStore } from "@/store/communityStore";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const Community = () => {
  const { user, isAuthenticated } = useAuthStore();
  const { posts, loading, createPost, likePost, addComment, fetchPosts } = useCommunityStore();
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    tags: [] as string[]
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleCreatePost = async () => {
    if (!isAuthenticated) {
      toast.error("Você precisa estar logado para criar posts");
      return;
    }

    if (!newPost.title.trim() || !newPost.content.trim()) {
      toast.error("Preencha título e conteúdo");
      return;
    }

    try {
      await createPost(newPost);
      setNewPost({ title: "", content: "", tags: [] });
      setShowCreatePost(false);
      toast.success("Post criado com sucesso!");
    } catch (error) {
      toast.error("Erro ao criar post");
    }
  };

  const handleLike = async (postId: string) => {
    if (!isAuthenticated) {
      toast.error("Você precisa estar logado para curtir");
      return;
    }
    
    try {
      await likePost(postId);
    } catch (error) {
      toast.error("Erro ao curtir post");
    }
  };

  const availableTags = ["artigo", "ajuda", "dicas", "discussão"];
  
  const filteredPosts = posts.filter(post => {
    const matchesSearch = searchTerm === "" || 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTag = selectedTag === "" || post.tags.includes(selectedTag);
    
    return matchesSearch && matchesTag;
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-6 pb-20 md:pb-6 flex items-center justify-center">
          <Card className="bg-netflix-dark border-gray-800 max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="text-law-accent">Acesso Restrito</CardTitle>
              <CardDescription>
                Você precisa estar logado para acessar a comunidade
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button asChild className="bg-law-accent hover:bg-law-accent/80">
                <a href="/auth">Fazer Login</a>
              </Button>
            </CardContent>
          </Card>
        </main>
        <MobileFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-6 pb-20 md:pb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-serif font-bold text-law">
            Comunidade
          </h2>
          <Button 
            onClick={() => setShowCreatePost(!showCreatePost)}
            className="bg-law-accent hover:bg-law-accent/80"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Post
          </Button>
        </div>

        {/* Create Post Form */}
        {showCreatePost && (
          <Card className="bg-netflix-dark border-gray-800 mb-6">
            <CardHeader>
              <CardTitle className="text-law-accent">Criar Novo Post</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Título do post"
                value={newPost.title}
                onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                className="bg-netflix-bg border-gray-700"
              />
              <Textarea
                placeholder="Conteúdo do post"
                value={newPost.content}
                onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                className="bg-netflix-bg border-gray-700 min-h-[100px]"
              />
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Tags:</label>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map(tag => (
                    <Badge
                      key={tag}
                      variant={newPost.tags.includes(tag) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        setNewPost(prev => ({
                          ...prev,
                          tags: prev.tags.includes(tag)
                            ? prev.tags.filter(t => t !== tag)
                            : [...prev.tags, tag]
                        }));
                      }}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleCreatePost}
                  className="bg-law-accent hover:bg-law-accent/80"
                >
                  Publicar
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowCreatePost(false)}
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-netflix-dark border-gray-700"
            />
          </div>
          <Select value={selectedTag} onValueChange={setSelectedTag}>
            <SelectTrigger className="w-40 bg-netflix-dark border-gray-700">
              <SelectValue placeholder="Filtrar por tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas as tags</SelectItem>
              {availableTags.map(tag => (
                <SelectItem key={tag} value={tag}>{tag}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Posts Feed */}
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-400">Carregando posts...</p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">Nenhum post encontrado</p>
            </div>
          ) : (
            filteredPosts.map(post => (
              <Card key={post.id} className="bg-netflix-dark border-gray-800">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={post.author.avatar_url} />
                        <AvatarFallback className="bg-law-accent/20 text-law-accent">
                          {post.author.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-white">{post.author.name}</h3>
                        <p className="text-xs text-gray-400">
                          {post.author.category} • {formatDistanceToNow(new Date(post.created_at), { 
                            locale: ptBR, 
                            addSuffix: true 
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                  <CardTitle className="text-law-accent">{post.title}</CardTitle>
                  <div className="flex flex-wrap gap-1">
                    {post.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 mb-4 whitespace-pre-wrap">{post.content}</p>
                  
                  <div className="flex items-center gap-4 pt-2 border-t border-gray-800">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLike(post.id)}
                      className={`gap-2 ${post.isLiked ? 'text-red-500' : 'text-gray-400'}`}
                    >
                      <Heart className={`h-4 w-4 ${post.isLiked ? 'fill-current' : ''}`} />
                      {post.likes_count}
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-2 text-gray-400">
                      <MessageCircle className="h-4 w-4" />
                      {post.comments_count}
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-2 text-gray-400">
                      <Share2 className="h-4 w-4" />
                      Compartilhar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
      
      <MobileFooter />
    </div>
  );
};

export default Community;
