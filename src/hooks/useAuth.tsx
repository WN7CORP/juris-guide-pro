
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  username: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
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
      console.log('Loading profile for user:', userId);
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error loading profile:', error);
        throw error;
      }

      if (data) {
        console.log('Profile loaded from database:', data);
        setProfile(data);
      } else {
        console.log('No profile found, checking localStorage for migration...');
        // Check if there's a profile in localStorage to migrate
        await migrateProfileFromLocalStorage(userId);
      }
    } catch (error) {
      console.error('Error in loadUserProfile:', error);
      // Fallback to localStorage
      const storedProfile = localStorage.getItem(`profile_${userId}`);
      if (storedProfile) {
        const parsed = JSON.parse(storedProfile);
        setProfile(parsed);
        // Try to migrate to database
        await migrateProfileFromLocalStorage(userId);
      }
    }
  };

  const migrateProfileFromLocalStorage = async (userId: string) => {
    try {
      const storedProfile = localStorage.getItem(`profile_${userId}`);
      if (storedProfile) {
        const parsed = JSON.parse(storedProfile);
        console.log('Migrating profile from localStorage:', parsed);
        
        const { data, error } = await supabase
          .from('user_profiles')
          .insert({
            id: userId,
            username: parsed.username || user?.email?.split('@')[0] || 'Usuário',
            avatar_url: parsed.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1&backgroundColor=b6e3f4',
          })
          .select()
          .single();

        if (error) {
          console.error('Error migrating profile:', error);
        } else {
          console.log('Profile migrated successfully:', data);
          setProfile(data);
          // Remove from localStorage after successful migration
          localStorage.removeItem(`profile_${userId}`);
        }
      } else {
        // Create default profile
        console.log('Creating default profile for user:', userId);
        const defaultProfile = {
          id: userId,
          username: user?.email?.split('@')[0] || 'Usuário',
          avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1&backgroundColor=b6e3f4',
        };

        const { data, error } = await supabase
          .from('user_profiles')
          .insert(defaultProfile)
          .select()
          .single();

        if (error) {
          console.error('Error creating default profile:', error);
        } else {
          console.log('Default profile created:', data);
          setProfile(data);
        }
      }
    } catch (error) {
      console.error('Error in migrateProfileFromLocalStorage:', error);
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
      
      const updatedData = {
        username: username.trim(),
        avatar_url: avatarUrl,
      };

      const { data, error } = await supabase
        .from('user_profiles')
        .update(updatedData)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        return { data: null, error };
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
