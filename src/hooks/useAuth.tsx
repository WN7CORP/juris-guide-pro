
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
    console.log('useAuth: Initializing auth state...');
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('useAuth: Initial session:', session ? 'exists' : 'none');
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
        console.log('useAuth: Auth state changed:', event, session ? 'user exists' : 'no user');
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

  const loadUserProfile = async (userId: string, retryCount = 0) => {
    try {
      console.log('useAuth: Loading profile for user:', userId, 'retry:', retryCount);
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('useAuth: Error loading profile:', error);
        
        // Se profile não existe e não tentamos muitas vezes, aguardar trigger
        if (error.code === 'PGRST116' && retryCount < 5) {
          console.log('useAuth: Profile not found, retrying in 2 seconds... (attempt', retryCount + 1, ')');
          setTimeout(() => {
            loadUserProfile(userId, retryCount + 1);
          }, 2000);
          return;
        }
        
        // Se ainda não existe após retries, criar manualmente
        if (error.code === 'PGRST116') {
          console.log('useAuth: Profile still not found after retries, creating manually...');
          await createUserProfile(userId);
          return;
        }
        
        setLoading(false);
        return;
      }

      if (data) {
        console.log('useAuth: Profile loaded successfully:', data);
        setProfile(data);
      }
      setLoading(false);
    } catch (error) {
      console.error('useAuth: Unexpected error loading profile:', error);
      setLoading(false);
    }
  };

  const createUserProfile = async (userId: string) => {
    try {
      console.log('useAuth: Creating profile manually for user:', userId);
      const { data: userData } = await supabase.auth.getUser();
      const email = userData.user?.email || '';
      let username = email.split('@')[0] || 'user';
      
      // Limpar caracteres especiais
      username = username.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 20);
      if (!username) username = 'user';
      
      // Verificar se username já existe
      let finalUsername = username;
      let counter = 1;
      
      while (true) {
        const { data: existing } = await supabase
          .from('user_profiles')
          .select('username')
          .eq('username', finalUsername)
          .single();
          
        if (!existing) break;
        
        finalUsername = username + counter;
        counter++;
      }
      
      const { data, error } = await supabase
        .from('user_profiles')
        .insert({
          id: userId,
          username: finalUsername,
          avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}&backgroundColor=b6e3f4`
        })
        .select()
        .single();

      if (error) {
        console.error('useAuth: Error creating profile manually:', error);
        setLoading(false);
        return;
      }

      console.log('useAuth: Profile created manually:', data);
      setProfile(data);
      setLoading(false);
    } catch (error) {
      console.error('useAuth: Error in manual profile creation:', error);
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      console.log('useAuth: Signing up user:', email);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (data.user && !error) {
        console.log('useAuth: User signed up successfully, waiting for profile...');
        // O trigger deve criar o perfil automaticamente
        // Aguardar um pouco antes de tentar carregar
        setTimeout(() => {
          if (data.user) {
            loadUserProfile(data.user.id);
          }
        }, 1000);
      }
      
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
      console.log('useAuth: Signing in user:', email);
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
      console.log('useAuth: Signing out user');
      const { error } = await supabase.auth.signOut();
      if (!error) {
        setUser(null);
        setProfile(null);
      }
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
    console.log('updateProfile: Starting update process for username:', username);

    if (!user) {
      console.error('updateProfile: No authenticated user found');
      return { error: { message: 'Usuário não autenticado' } };
    }

    const trimmedUsername = username.trim();
    
    if (!trimmedUsername || trimmedUsername.length < 3 || trimmedUsername.length > 30) {
      console.error('updateProfile: Invalid username length:', trimmedUsername.length);
      return { error: { message: 'Nome de usuário deve ter entre 3 e 30 caracteres' } };
    }

    try {
      const profileData = {
        id: user.id,
        username: trimmedUsername,
        avatar_url: avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1&backgroundColor=b6e3f4',
      };
      
      console.log('updateProfile: Attempting upsert with data:', profileData);
      
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert(profileData, { 
          onConflict: 'id',
          ignoreDuplicates: false 
        })
        .select()
        .single();

      if (error) {
        console.error('updateProfile: Upsert error:', error);
        
        if (error.code === '23505') {
          return { data: null, error: { message: 'Nome de usuário já está em uso' } };
        }
        
        return { data: null, error: { message: `Erro ao salvar perfil: ${error.message}` } };
      }

      console.log('updateProfile: Success! Profile data:', data);
      setProfile(data);
      return { data, error: null };
      
    } catch (error: any) {
      console.error('updateProfile: Unexpected error:', error);
      return { 
        data: null, 
        error: { 
          message: `Erro inesperado: ${error?.message || 'Tente novamente'}` 
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
