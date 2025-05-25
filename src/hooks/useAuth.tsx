import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { toast } from 'sonner';

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
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        setUser(session?.user ?? null);
        if (session?.user) {
          await loadUserProfile(session.user.id);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      console.log('Loading profile for user:', userId);
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error);
        setLoading(false);
        return;
      }

      if (data) {
        console.log('Profile loaded successfully:', data);
        setProfile(data);
        setLoading(false);
      } else {
        // Profile doesn't exist, create it
        console.log('Profile not found, creating one...');
        await createUserProfile(userId);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      setLoading(false);
    }
  };

  const createUserProfile = async (userId: string) => {
    try {
      const user = await supabase.auth.getUser();
      const email = user.data.user?.email;
      const defaultUsername = email?.split('@')[0] || `user_${userId.slice(0, 8)}`;
      
      console.log('Creating profile for user:', userId, 'with username:', defaultUsername);
      
      const { data, error } = await supabase
        .from('user_profiles')
        .insert({
          id: userId,
          username: defaultUsername,
          avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}&backgroundColor=b6e3f4`
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
        // If profile creation fails, still allow access but show error
        toast.error('Erro ao criar perfil, mas você pode continuar usando o app');
        setProfile({
          id: userId,
          username: defaultUsername,
          avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}&backgroundColor=b6e3f4`,
          created_at: new Date().toISOString()
        });
      } else {
        console.log('Profile created successfully:', data);
        setProfile(data);
        toast.success('Perfil criado com sucesso!');
      }
    } catch (error) {
      console.error('Unexpected error creating profile:', error);
      // Create a temporary profile to allow app usage
      const user = await supabase.auth.getUser();
      const email = user.data.user?.email;
      const defaultUsername = email?.split('@')[0] || `user_${userId.slice(0, 8)}`;
      
      setProfile({
        id: userId,
        username: defaultUsername,
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}&backgroundColor=b6e3f4`,
        created_at: new Date().toISOString()
      });
    } finally {
      setLoading(false);
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
        })
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        toast.error('Erro ao atualizar perfil: ' + error.message);
        return { data: null, error };
      }
      
      setProfile(data);
      toast.success('Perfil atualizado com sucesso!');
      console.log('Profile updated successfully:', data);
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
