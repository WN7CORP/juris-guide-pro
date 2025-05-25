
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  username: string;
  avatar_url?: string;
  created_at: string;
}

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
        console.error('Error loading profile:', error);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
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
      console.error('SignUp error:', error);
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
      console.error('SignIn error:', error);
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
      console.error('SignOut error:', error);
      return { 
        error: { 
          message: error?.message || 'Erro ao fazer logout. Tente novamente.' 
        } 
      };
    }
  };

  const updateProfile = async (username: string, avatarUrl?: string) => {
    if (!user) {
      console.error('No authenticated user found');
      return { error: { message: 'Usuário não autenticado' } };
    }

    if (!username || username.trim().length === 0) {
      return { error: { message: 'Nome de usuário é obrigatório' } };
    }

    try {
      console.log('Updating profile for user:', user.id, 'with username:', username);
      
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          username: username.trim(),
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error updating profile:', error);
        return { 
          data: null, 
          error: { 
            message: error?.message || 'Erro desconhecido ao atualizar perfil' 
          } 
        };
      }

      console.log('Profile updated successfully:', data);
      setProfile(data);
      return { data, error: null };
    } catch (error: any) {
      console.error('Unexpected error updating profile:', error);
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
  };
};
