
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserProfile(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          await loadUserProfile(session.user.id);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile(data);
      } else {
        setProfile(null);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      setProfile(null);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      return { data, error };
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { data, error };
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
      const { error } = await supabase.auth.signOut();
      return { error };
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
      const profileData = {
        id: user.id,
        username: username.trim(),
        avatar_url: avatarUrl || predefinedAvatars[0],
      };

      const { data, error } = await supabase
        .from('user_profiles')
        .upsert(profileData)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setProfile(data);
      return { data, error: null };
    } catch (error: any) {
      return { 
        data: null, 
        error: { 
          message: error?.message || 'Erro inesperado ao atualizar perfil. Tente novamente.' 
        } 
      };
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
