
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface SupabaseAnnotation {
  id: string;
  article_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export const useSupabaseAnnotations = () => {
  const { user } = useAuth();
  const [annotations, setAnnotations] = useState<SupabaseAnnotation[]>([]);
  const [loading, setLoading] = useState(true);

  // Load annotations from Supabase
  const loadAnnotations = useCallback(async () => {
    if (!user) {
      setAnnotations([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_annotations')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error loading annotations:', error);
        toast.error('Erro ao carregar anotações');
        setAnnotations([]);
      } else {
        setAnnotations(data || []);
      }
    } catch (error) {
      console.error('Error loading annotations:', error);
      toast.error('Erro ao carregar anotações');
      setAnnotations([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadAnnotations();
  }, [loadAnnotations]);

  // Get annotation for a specific article
  const getAnnotation = useCallback((articleId: string): SupabaseAnnotation | undefined => {
    return annotations.find(a => a.article_id === articleId);
  }, [annotations]);

  // Save annotation
  const saveAnnotation = useCallback(async (articleId: string, content: string): Promise<void> => {
    if (!user) {
      toast.error('Você precisa estar logado para salvar anotações');
      return;
    }

    if (!content.trim()) {
      toast.error('A anotação não pode estar vazia');
      return;
    }

    try {
      const existingAnnotation = annotations.find(a => a.article_id === articleId);
      
      if (existingAnnotation) {
        // Update existing annotation
        const { error } = await supabase
          .from('user_annotations')
          .update({ 
            content: content.trim(),
            updated_at: new Date().toISOString()
          })
          .eq('id', existingAnnotation.id);

        if (error) {
          throw error;
        }

        // Update local state immediately
        setAnnotations(prev => prev.map(a => 
          a.id === existingAnnotation.id 
            ? { ...a, content: content.trim(), updated_at: new Date().toISOString() }
            : a
        ));
      } else {
        // Create new annotation
        const { data, error } = await supabase
          .from('user_annotations')
          .insert({
            user_id: user.id,
            article_id: articleId,
            content: content.trim()
          })
          .select()
          .single();

        if (error) {
          throw error;
        }

        // Add to local state immediately
        if (data) {
          setAnnotations(prev => [data, ...prev]);
        }
      }
    } catch (error) {
      console.error('Error saving annotation:', error);
      toast.error('Erro ao salvar anotação');
      throw error;
    }
  }, [user, annotations]);

  // Delete annotation
  const deleteAnnotation = useCallback(async (articleId: string): Promise<void> => {
    if (!user) {
      toast.error('Você precisa estar logado');
      return;
    }

    try {
      const { error } = await supabase
        .from('user_annotations')
        .delete()
        .eq('user_id', user.id)
        .eq('article_id', articleId);

      if (error) {
        throw error;
      }

      // Update local state immediately
      setAnnotations(prev => prev.filter(a => a.article_id !== articleId));
      toast.success('Anotação excluída com sucesso');
    } catch (error) {
      console.error('Error deleting annotation:', error);
      toast.error('Erro ao excluir anotação');
    }
  }, [user]);

  return {
    annotations,
    loading,
    getAnnotation,
    saveAnnotation,
    deleteAnnotation,
    getAllAnnotations: () => annotations,
    refreshAnnotations: loadAnnotations
  };
};
