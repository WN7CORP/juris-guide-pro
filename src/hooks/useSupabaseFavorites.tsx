
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface SupabaseFavorite {
  id: string;
  article_id: string;
  article_number?: string;
  created_at: string;
}

export const useSupabaseFavorites = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Load favorites from Supabase
  const loadFavorites = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_favorites')
        .select('article_id')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error loading favorites:', error);
        toast.error('Erro ao carregar favoritos');
      } else {
        setFavorites(data?.map(f => f.article_id) || []);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
      toast.error('Erro ao carregar favoritos');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  // Toggle favorite
  const toggleFavorite = useCallback(async (articleId: string, articleNumber?: string): Promise<void> => {
    if (!user) {
      toast.error('Você precisa estar logado para favoritar artigos');
      return;
    }

    try {
      const isFavorited = favorites.includes(articleId);

      if (isFavorited) {
        // Remove from favorites
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('article_id', articleId);

        if (error) {
          throw error;
        }

        setFavorites(prev => prev.filter(id => id !== articleId));
        toast.success('Removido dos favoritos');
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('user_favorites')
          .insert({
            user_id: user.id,
            article_id: articleId,
            article_number: articleNumber
          });

        if (error) {
          throw error;
        }

        setFavorites(prev => [...prev, articleId]);
        toast.success('Adicionado aos favoritos');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Erro ao atualizar favoritos');
    }
  }, [user, favorites]);

  const isFavorited = useCallback((articleId: string): boolean => {
    return favorites.includes(articleId);
  }, [favorites]);

  return {
    favorites,
    loading,
    toggleFavorite,
    isFavorited
  };
};
