
import { useState, useEffect } from 'react';

export interface User {
  id: string;
  email?: string;
}

interface UserProfile {
  id: string;
  username: string;
  avatar_url?: string;
  created_at: string;
}

const predefinedAvatars = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=user1&backgroundColor=b6e3f4',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=user2&backgroundColor=c0aede',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=user3&backgroundColor=d1d4f9',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=user4&backgroundColor=fde2e4',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=user5&backgroundColor=f0f9ff',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=pixel1&backgroundColor=ddd6fe',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=pixel2&backgroundColor=fed7d7',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=pixel3&backgroundColor=d4edda',
];

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Simulate loading state
    setLoading(false);
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      // Mock signup
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUser: User = {
        id: `user_${Date.now()}`,
        email: email
      };
      
      setUser(mockUser);
      return { data: { user: mockUser }, error: null };
    } catch (error: any) {
      return { 
        data: null, 
        error: { 
          message: error?.message || 'Erro ao criar conta. Tente novamente.' 
        } 
      };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Mock signin
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUser: User = {
        id: `user_${Date.now()}`,
        email: email
      };
      
      setUser(mockUser);
      return { data: { user: mockUser }, error: null };
    } catch (error: any) {
      return { 
        data: null, 
        error: { 
          message: error?.message || 'Erro ao fazer login. Verifique suas credenciais.' 
        } 
      };
    }
  };

  const signOut = async () => {
    try {
      setUser(null);
      setProfile(null);
      return { error: null };
    } catch (error: any) {
      return { 
        error: { 
          message: error?.message || 'Erro ao fazer logout. Tente novamente.' 
        } 
      };
    }
  };

  const updateProfile = async (username: string, avatarUrl?: string) => {
    if (!user) {
      return { error: { message: 'Usuário não autenticado' } };
    }

    if (!username || username.trim().length === 0) {
      return { error: { message: 'Nome de usuário é obrigatório' } };
    }

    try {
      // Mock profile update
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockProfile: UserProfile = {
        id: user.id,
        username: username.trim(),
        avatar_url: avatarUrl || predefinedAvatars[0],
        created_at: new Date().toISOString()
      };

      setProfile(mockProfile);
      return { data: mockProfile, error: null };
    } catch (error: any) {
      return { 
        data: null, 
        error: { 
          message: error?.message || 'Erro inesperado ao atualizar perfil. Tente novamente.' 
        } 
      };
    }
  };

  const loadUserProfile = async (userId: string) => {
    try {
      // Mock profile loading
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockProfile: UserProfile = {
        id: userId,
        username: `user_${userId.slice(-4)}`,
        avatar_url: predefinedAvatars[0],
        created_at: new Date().toISOString()
      };
      
      setProfile(mockProfile);
    } catch (error) {
      console.error('Error loading user profile:', error);
      setProfile(null);
    }
  };

  return {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    loadUserProfile,
    predefinedAvatars,
  };
};
