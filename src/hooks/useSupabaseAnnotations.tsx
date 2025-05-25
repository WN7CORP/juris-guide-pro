
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
  category?: string;
  tags?: string[];
  priority?: string;
  color?: string;
  is_favorite?: boolean;
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

  // Get annotations for a specific article (can be multiple)
  const getAnnotations = useCallback((articleId: string): SupabaseAnnotation[] => {
    return annotations.filter(a => a.article_id === articleId);
  }, [annotations]);

  // Get single annotation for backward compatibility
  const getAnnotation = useCallback((articleId: string): SupabaseAnnotation | undefined => {
    return annotations.find(a => a.article_id === articleId);
  }, [annotations]);

  // Save annotation (always create new)
  const saveAnnotation = useCallback(async (articleId: string, content: string, options?: {
    category?: string;
    tags?: string[];
    priority?: string;
    color?: string;
    is_favorite?: boolean;
  }): Promise<void> => {
    if (!user) {
      toast.error('Você precisa estar logado para salvar anotações');
      return;
    }

    if (!content.trim()) {
      toast.error('A anotação não pode estar vazia');
      return;
    }

    try {
      // Always create new annotation
      const { data, error } = await supabase
        .from('user_annotations')
        .insert({
          user_id: user.id,
          article_id: articleId,
          content: content.trim(),
          category: options?.category || 'general',
          tags: options?.tags || [],
          priority: options?.priority || 'medium',
          color: options?.color || '#6366f1',
          is_favorite: options?.is_favorite || false
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
      
      toast.success('Anotação salva com sucesso!');
    } catch (error) {
      console.error('Error saving annotation:', error);
      toast.error('Erro ao salvar anotação');
      throw error;
    }
  }, [user]);

  // Update specific annotation
  const updateAnnotation = useCallback(async (annotationId: string, content: string): Promise<void> => {
    if (!user) {
      toast.error('Você precisa estar logado');
      return;
    }

    if (!content.trim()) {
      toast.error('A anotação não pode estar vazia');
      return;
    }

    try {
      const { error } = await supabase
        .from('user_annotations')
        .update({ 
          content: content.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', annotationId);

      if (error) {
        throw error;
      }

      // Update local state immediately
      setAnnotations(prev => prev.map(a => 
        a.id === annotationId 
          ? { ...a, content: content.trim(), updated_at: new Date().toISOString() }
          : a
      ));
      
      toast.success('Anotação atualizada com sucesso!');
    } catch (error) {
      console.error('Error updating annotation:', error);
      toast.error('Erro ao atualizar anotação');
    }
  }, [user]);

  // Delete specific annotation
  const deleteAnnotation = useCallback(async (annotationId: string): Promise<void> => {
    if (!user) {
      toast.error('Você precisa estar logado');
      return;
    }

    try {
      const { error } = await supabase
        .from('user_annotations')
        .delete()
        .eq('id', annotationId);

      if (error) {
        throw error;
      }

      // Update local state immediately
      setAnnotations(prev => prev.filter(a => a.id !== annotationId));
      toast.success('Anotação excluída com sucesso');
    } catch (error) {
      console.error('Error deleting annotation:', error);
      toast.error('Erro ao excluir anotação');
    }
  }, [user]);

  // Delete all annotations for an article
  const deleteAllAnnotationsForArticle = useCallback(async (articleId: string): Promise<void> => {
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
      toast.success('Todas as anotações excluídas com sucesso');
    } catch (error) {
      console.error('Error deleting annotations:', error);
      toast.error('Erro ao excluir anotações');
    }
  }, [user]);

  return {
    annotations,
    loading,
    getAnnotation,
    getAnnotations,
    saveAnnotation,
    updateAnnotation,
    deleteAnnotation,
    deleteAllAnnotationsForArticle,
    getAllAnnotations: () => annotations,
    refreshAnnotations: loadAnnotations
  };
};
