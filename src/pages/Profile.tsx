
import { useState } from "react";
import { Header } from "@/components/Header";
import { MobileFooter } from "@/components/MobileFooter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/authStore";
import { useFavoritesStore } from "@/store/favoritesStore";
import { avatars, getAvatarById } from "@/data/avatars";
import { toast } from "sonner";
import { User, BookOpen, Heart, Clock, Trophy, Edit } from "lucide-react";

const Profile = () => {
  const { user, updateProfile, signOut } = useAuthStore();
  const { favorites } = useFavoritesStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || "",
    bio: user?.bio || "",
    avatar_url: user?.avatar_url || "",
    category: user?.category || "concurseiro"
  });

  const userAvatar = user?.avatar_url ? getAvatarById(user.avatar_url) : null;

  const handleSave = () => {
    updateProfile(editForm);
    setIsEditing(false);
    toast.success("Perfil atualizado com sucesso!");
  };

  const handleLogout = () => {
    signOut();
    toast.success("Logout realizado com sucesso!");
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'concurseiro': return 'bg-blue-500';
      case 'estudante': return 'bg-green-500';
      case 'advogado': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'concurseiro': return 'Concurseiro';
      case 'estudante': return 'Estudante';
      case 'advogado': return 'Advogado';
      default: return 'Usuário';
    }
  };

  const stats = [
    { icon: BookOpen, label: "Artigos Lidos", value: user?.stats?.articles_read || 0 },
    { icon: Heart, label: "Favoritos", value: favorites.length },
    { icon: Clock, label: "Dias de Estudo", value: user?.stats?.study_streak || 0 },
    { icon: Trophy, label: "Horas Estudadas", value: Math.floor((user?.stats?.total_study_time || 0) / 3600) }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-6 pb-20 md:pb-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Profile Header */}
          <Card className="bg-netflix-dark border-gray-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-law-accent">Meu Perfil</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                  className="gap-2"
                >
                  <Edit className="h-4 w-4" />
                  {isEditing ? "Cancelar" : "Editar"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="text-6xl">
                      {userAvatar?.emoji || '👤'}
                    </div>
                    <div className="flex-1">
                      <Label htmlFor="avatar">Avatar</Label>
                      <Select 
                        value={editForm.avatar_url} 
                        onValueChange={(value) => setEditForm(prev => ({ ...prev, avatar_url: value }))}
                      >
                        <SelectTrigger className="bg-netflix-bg border-gray-700">
                          <SelectValue placeholder="Selecione um avatar" />
                        </SelectTrigger>
                        <SelectContent className="bg-netflix-dark border-gray-700 max-h-60">
                          {avatars.map(avatar => (
                            <SelectItem key={avatar.id} value={avatar.id}>
                              <div className="flex items-center gap-2">
                                <span className="text-xl">{avatar.emoji}</span>
                                <span>{avatar.name}</span>
                                <Badge variant="secondary" className="text-xs">
                                  {avatar.gender}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nome</Label>
                      <Input
                        id="name"
                        value={editForm.name}
                        onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                        className="bg-netflix-bg border-gray-700"
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Categoria</Label>
                      <Select 
                        value={editForm.category} 
                        onValueChange={(value) => setEditForm(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger className="bg-netflix-bg border-gray-700">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="concurseiro">Concurseiro</SelectItem>
                          <SelectItem value="estudante">Estudante</SelectItem>
                          <SelectItem value="advogado">Advogado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="bio">Biografia</Label>
                    <Textarea
                      id="bio"
                      value={editForm.bio}
                      onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Conte um pouco sobre você..."
                      className="bg-netflix-bg border-gray-700"
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={handleSave} className="bg-law-accent hover:bg-law-accent/80">
                      Salvar Alterações
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-6">
                  <div className="text-6xl">
                    {userAvatar?.emoji || '👤'}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white mb-2">{user?.name}</h2>
                    <Badge className={`${getCategoryColor(user?.category || '')} text-white mb-3`}>
                      {getCategoryLabel(user?.category || '')}
                    </Badge>
                    {user?.bio && (
                      <p className="text-gray-300 mb-3">{user.bio}</p>
                    )}
                    <p className="text-sm text-gray-400">
                      Membro desde {new Date(user?.created_at || '').toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <Card key={stat.label} className="bg-netflix-dark border-gray-800">
                <CardContent className="p-4 text-center">
                  <stat.icon className="h-8 w-8 text-law-accent mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Actions */}
          <Card className="bg-netflix-dark border-gray-800">
            <CardHeader>
              <CardTitle className="text-law-accent">Ações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                variant="outline" 
                className="w-full"
                asChild
              >
                <a href="/favoritos">Ver Meus Favoritos</a>
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                asChild
              >
                <a href="/comunidade">Ir para Comunidade</a>
              </Button>
              <Button 
                variant="destructive" 
                className="w-full"
                onClick={handleLogout}
              >
                Sair da Conta
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <MobileFooter />
    </div>
  );
};

export default Profile;
