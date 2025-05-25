
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  username: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  setupRequired: boolean;
}

const MAX_RETRIES = 3;
const PROFILE_TIMEOUT = 10000; // 10 segundos máximo
const RETRY_DELAYS = [1000, 2000, 4000]; // Retry exponencial

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    error: null,
    setupRequired: false
  });

  const updateAuthState = useCallback((updates: Partial<AuthState>) => {
    setAuthState(prev => ({ ...prev, ...updates }));
  }, []);

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Verificar se as tabelas necessárias existem
  const checkDatabaseSetup = async (): Promise<boolean> => {
    try {
      console.log('useAuth: Checking database setup...');
      
      const { error } = await supabase
        .from('user_profiles')
        .select('id')
        .limit(1);

      if (error) {
        console.error('useAuth: Database setup check failed:', error);
        
        if (error.code === '42P01' || error.message.includes('relation "public.user_profiles" does not exist')) {
          updateAuthState({ 
            setupRequired: true,
            error: 'Banco de dados não configurado. Execute o SQL de setup no Supabase Dashboard.',
            loading: false 
          });
          return false;
        }
      }

      console.log('useAuth: Database setup verified');
      return true;
    } catch (error) {
      console.error('useAuth: Error checking database setup:', error);
      updateAuthState({ 
        setupRequired: true,
        error: 'Erro ao verificar configuração do banco de dados',
        loading: false 
      });
      return false;
    }
  };

  useEffect(() => {
    console.log('useAuth: Initializing auth state...');
    
    const initializeAuth = async () => {
      // Primeiro verificar se o banco está configurado
      const isSetupComplete = await checkDatabaseSetup();
      if (!isSetupComplete) {
        return;
      }

      // Get initial session
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('useAuth: Session error:', error);
          updateAuthState({ error: error.message, loading: false });
          return;
        }

        console.log('useAuth: Initial session:', session ? 'exists' : 'none');
        if (session?.user) {
          updateAuthState({ user: session.user });
          await loadUserProfile(session.user.id);
        } else {
          updateAuthState({ loading: false });
        }
      } catch (error: any) {
        console.error('useAuth: Error getting session:', error);
        updateAuthState({ 
          error: `Erro ao verificar sessão: ${error?.message}`,
          loading: false 
        });
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('useAuth: Auth state changed:', event, session ? 'user exists' : 'no user');
        
        if (session?.user) {
          updateAuthState({ user: session.user, error: null, setupRequired: false });
          await loadUserProfile(session.user.id);
        } else {
          updateAuthState({ 
            user: null, 
            profile: null, 
            loading: false, 
            error: null,
            setupRequired: false
          });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [updateAuthState]);

  const loadUserProfile = async (userId: string, retryCount = 0): Promise<void> => {
    console.log(`useAuth: Loading profile for user ${userId} (attempt ${retryCount + 1})`);
    
    const timeoutId = setTimeout(() => {
      console.log('useAuth: Profile loading timeout reached');
      updateAuthState({ 
        error: 'Timeout ao carregar perfil. Tente fazer login novamente.',
        loading: false 
      });
    }, PROFILE_TIMEOUT);

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      clearTimeout(timeoutId);

      if (error) {
        console.error('useAuth: Error loading profile:', error);
        
        if (error.code === '42P01') {
          updateAuthState({ 
            setupRequired: true,
            error: 'Tabela user_profiles não encontrada. Execute o SQL de setup no Supabase.',
            loading: false 
          });
          return;
        }
        
        updateAuthState({ error: error.message, loading: false });
        return;
      }

      if (data) {
        console.log('useAuth: Profile loaded successfully:', data);
        updateAuthState({ profile: data, loading: false, error: null });
      } else {
        console.log('useAuth: No profile found, creating one...');
        await createUserProfile(userId);
      }
    } catch (error: any) {
      clearTimeout(timeoutId);
      console.error('useAuth: Unexpected error loading profile:', error);
      updateAuthState({ 
        error: `Erro inesperado: ${error?.message || 'Falha ao carregar perfil'}`,
        loading: false 
      });
    }
  };

  const createUserProfile = async (userId: string): Promise<void> => {
    try {
      console.log('useAuth: Creating profile for user:', userId);
      
      const { data: userData } = await supabase.auth.getUser();
      const email = userData.user?.email || '';
      let username = email.split('@')[0] || 'user';
      
      username = username.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 20);
      if (!username || username.length < 3) {
        username = 'user' + Math.floor(Math.random() * 10000);
      }
      
      let finalUsername = username;
      let counter = 1;
      
      while (counter <= 10) {
        const { data: existing } = await supabase
          .from('user_profiles')
          .select('username')
          .eq('username', finalUsername)
          .maybeSingle();
          
        if (!existing) break;
        
        finalUsername = username + counter;
        counter++;
      }
      
      const profileData = {
        id: userId,
        username: finalUsername,
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}&backgroundColor=b6e3f4`
      };

      const { data, error } = await supabase
        .from('user_profiles')
        .insert(profileData)
        .select()
        .single();

      if (error) {
        console.error('useAuth: Error creating profile:', error);
        
        if (error.code === '42P01') {
          updateAuthState({ 
            setupRequired: true,
            error: 'Tabela user_profiles não existe. Execute o SQL de setup no Supabase.',
            loading: false 
          });
          return;
        }
        
        updateAuthState({ 
          error: `Erro ao criar perfil: ${error.message}`,
          loading: false 
        });
        return;
      }

      console.log('useAuth: Profile created successfully:', data);
      updateAuthState({ profile: data, loading: false, error: null });
    } catch (error: any) {
      console.error('useAuth: Error in profile creation:', error);
      updateAuthState({ 
        error: `Erro ao criar perfil: ${error?.message || 'Falha na criação'}`,
        loading: false 
      });
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      console.log('useAuth: Signing up user:', email);
      updateAuthState({ loading: true, error: null, setupRequired: false });
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) {
        updateAuthState({ loading: false, error: error.message });
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (error: any) {
      console.error('SignUp error:', error);
      const errorMessage = error?.message || 'Erro ao criar conta. Tente novamente.';
      updateAuthState({ loading: false, error: errorMessage });
      return { data: null, error: { message: errorMessage } };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('useAuth: Signing in user:', email);
      updateAuthState({ loading: true, error: null, setupRequired: false });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        updateAuthState({ loading: false, error: error.message });
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (error: any) {
      console.error('SignIn error:', error);
      const errorMessage = error?.message || 'Erro ao fazer login. Verifique suas credenciais.';
      updateAuthState({ loading: false, error: errorMessage });
      return { data: null, error: { message: errorMessage } };
    }
  };

  const signOut = async () => {
    try {
      console.log('useAuth: Signing out user');
      const { error } = await supabase.auth.signOut();
      if (!error) {
        updateAuthState({ 
          user: null, 
          profile: null, 
          loading: false, 
          error: null,
          setupRequired: false
        });
      }
      return { error };
    } catch (error: any) {
      console.error('SignOut error:', error);
      return { error: { message: error?.message || 'Erro ao fazer logout. Tente novamente.' } };
    }
  };

  const updateProfile = async (username: string, avatarUrl?: string) => {
    console.log('updateProfile: Starting update process for username:', username);

    if (!authState.user) {
      console.error('updateProfile: No authenticated user found');
      return { error: { message: 'Usuário não autenticado' } };
    }

    const trimmedUsername = username.trim();
    
    if (!trimmedUsername || trimmedUsername.length < 3 || trimmedUsername.length > 30) {
      console.error('updateProfile: Invalid username length:', trimmedUsername.length);
      return { error: { message: 'Nome de usuário deve ter entre 3 e 30 caracteres' } };
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(trimmedUsername)) {
      return { error: { message: 'Nome de usuário pode conter apenas letras, números, _ e -' } };
    }

    try {
      const profileData = {
        id: authState.user.id,
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
        
        if (error.code === '42P01') {
          updateAuthState({ setupRequired: true });
          return { data: null, error: { message: 'Tabela user_profiles não existe. Execute o SQL de setup.' } };
        }
        
        if (error.code === '23505') {
          return { data: null, error: { message: 'Nome de usuário já está em uso' } };
        }
        
        return { data: null, error: { message: `Erro ao salvar perfil: ${error.message}` } };
      }

      console.log('updateProfile: Success! Profile data:', data);
      updateAuthState({ profile: data });
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

  const retryLoadProfile = useCallback(() => {
    if (authState.user) {
      updateAuthState({ loading: true, error: null, setupRequired: false });
      loadUserProfile(authState.user.id);
    }
  }, [authState.user, updateAuthState]);

  const retrySetup = useCallback(async () => {
    updateAuthState({ loading: true, error: null, setupRequired: false });
    const isSetupComplete = await checkDatabaseSetup();
    
    if (isSetupComplete && authState.user) {
      await loadUserProfile(authState.user.id);
    }
  }, [authState.user, updateAuthState]);

  return {
    user: authState.user,
    profile: authState.profile,
    loading: authState.loading,
    error: authState.error,
    setupRequired: authState.setupRequired,
    signUp,
    signIn,
    signOut,
    updateProfile,
    retryLoadProfile,
    retrySetup,
  };
};
