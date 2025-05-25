
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export interface Annotation {
  id: string;
  articleId: string;
  content: string;
  tags: string[];
  category?: string;
  color?: string;
  priority: 'low' | 'medium' | 'high';
  isFavorite: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface AnnotationFilters {
  search?: string;
  tags?: string[];
  category?: string;
  priority?: 'low' | 'medium' | 'high';
  isFavorite?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
}

export type SortOption = 'updatedAt' | 'createdAt' | 'priority' | 'alphabetical';

const LOCAL_STORAGE_KEY = 'juris-guide-annotations';

export const useAnnotations = () => {
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [loading, setLoading] = useState(true);

  // Load annotations from Supabase or localStorage on mount
  useEffect(() => {
    loadAnnotations();
  }, []);

  const loadAnnotations = async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No user found, loading from localStorage');
        loadFromLocalStorage();
        return;
      }

      console.log('Loading annotations from database for user:', user.id);
      const { data, error } = await supabase
        .from('user_annotations')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error loading annotations:', error);
        loadFromLocalStorage();
        return;
      }

      // Convert database format to local format
      const convertedAnnotations: Annotation[] = data?.map(dbAnnotation => ({
        id: dbAnnotation.id,
        articleId: dbAnnotation.article_id,
        content: dbAnnotation.content,
        tags: dbAnnotation.tags || [],
        category: dbAnnotation.category || 'general',
        color: dbAnnotation.color || '#6366f1',
        priority: dbAnnotation.priority as 'low' | 'medium' | 'high',
        isFavorite: dbAnnotation.is_favorite || false,
        createdAt: new Date(dbAnnotation.created_at).getTime(),
        updatedAt: new Date(dbAnnotation.updated_at).getTime(),
      })) || [];

      console.log('Loaded annotations from database:', convertedAnnotations.length);
      setAnnotations(convertedAnnotations);

      // Migrate localStorage data if database is empty
      if (convertedAnnotations.length === 0) {
        await migrateFromLocalStorage(user.id);
      }
    } catch (error) {
      console.error('Error loading annotations:', error);
      loadFromLocalStorage();
    } finally {
      setLoading(false);
    }
  };

  const loadFromLocalStorage = () => {
    try {
      const storedAnnotations = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedAnnotations) {
        const parsed = JSON.parse(storedAnnotations);
        const migrated = parsed.map((annotation: any) => ({
          id: annotation.id || `${annotation.articleId}-${Date.now()}`,
          articleId: annotation.articleId,
          content: annotation.content,
          tags: annotation.tags || [],
          category: annotation.category || 'general',
          color: annotation.color || '#6366f1',
          priority: annotation.priority || 'medium',
          isFavorite: annotation.isFavorite || false,
          createdAt: annotation.createdAt,
          updatedAt: annotation.updatedAt
        }));
        setAnnotations(migrated);
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
  };

  const migrateFromLocalStorage = async (userId: string) => {
    try {
      const storedAnnotations = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!storedAnnotations) return;

      const parsed = JSON.parse(storedAnnotations);
      if (!Array.isArray(parsed) || parsed.length === 0) return;

      console.log('Migrating annotations from localStorage to database:', parsed.length);

      const annotationsToInsert = parsed.map((annotation: any) => ({
        user_id: userId,
        article_id: annotation.articleId,
        content: annotation.content,
        tags: annotation.tags || [],
        category: annotation.category || 'general',
        color: annotation.color || '#6366f1',
        priority: annotation.priority || 'medium',
        is_favorite: annotation.isFavorite || false,
        created_at: new Date(annotation.createdAt).toISOString(),
        updated_at: new Date(annotation.updatedAt).toISOString(),
      }));

      const { error } = await supabase
        .from('user_annotations')
        .insert(annotationsToInsert);

      if (error) {
        console.error('Error migrating annotations:', error);
      } else {
        console.log('Successfully migrated annotations to database');
        // Reload from database to get the new IDs
        await loadAnnotations();
        // Remove from localStorage after successful migration
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    } catch (error) {
      console.error('Error in migrateFromLocalStorage:', error);
    }
  };

  // Get annotation for a specific article
  const getAnnotation = useCallback((articleId: string): Annotation | undefined => {
    return annotations.find(a => a.articleId === articleId);
  }, [annotations]);

  // Add or update an annotation
  const saveAnnotation = useCallback(async (
    articleId: string, 
    content: string, 
    options?: {
      tags?: string[];
      category?: string;
      color?: string;
      priority?: 'low' | 'medium' | 'high';
      isFavorite?: boolean;
    }
  ): Promise<void> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const existingAnnotation = getAnnotation(articleId);
      
      if (user) {
        if (existingAnnotation) {
          // Update existing annotation in database
          const updateData = {
            content,
            tags: options?.tags || existingAnnotation.tags,
            category: options?.category || existingAnnotation.category,
            color: options?.color || existingAnnotation.color,
            priority: options?.priority || existingAnnotation.priority,
            is_favorite: options?.isFavorite !== undefined ? options.isFavorite : existingAnnotation.isFavorite,
          };

          const { error } = await supabase
            .from('user_annotations')
            .update(updateData)
            .eq('id', existingAnnotation.id);

          if (error) {
            console.error('Error updating annotation:', error);
            throw error;
          }
        } else {
          // Insert new annotation in database
          const insertData = {
            user_id: user.id,
            article_id: articleId,
            content,
            tags: options?.tags || [],
            category: options?.category || 'general',
            color: options?.color || '#6366f1',
            priority: options?.priority || 'medium',
            is_favorite: options?.isFavorite || false,
          };

          const { error } = await supabase
            .from('user_annotations')
            .insert(insertData);

          if (error) {
            console.error('Error creating annotation:', error);
            throw error;
          }
        }

        // Reload annotations from database
        await loadAnnotations();
      } else {
        // Fallback to localStorage
        updateLocalAnnotations(articleId, content, options);
      }
      
      toast.success('Anotação salva com sucesso');
    } catch (error) {
      console.error('Error saving annotation:', error);
      // Fallback to localStorage on error
      updateLocalAnnotations(articleId, content, options);
      toast.success('Anotação salva localmente');
    }
  }, [annotations, getAnnotation]);

  const updateLocalAnnotations = (
    articleId: string,
    content: string,
    options?: {
      tags?: string[];
      category?: string;
      color?: string;
      priority?: 'low' | 'medium' | 'high';
      isFavorite?: boolean;
    }
  ) => {
    setAnnotations(prev => {
      const now = Date.now();
      const existingIndex = prev.findIndex(a => a.articleId === articleId);
      
      if (existingIndex >= 0) {
        // Update existing annotation
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          content,
          tags: options?.tags || updated[existingIndex].tags,
          category: options?.category || updated[existingIndex].category,
          color: options?.color || updated[existingIndex].color,
          priority: options?.priority || updated[existingIndex].priority,
          isFavorite: options?.isFavorite !== undefined ? options.isFavorite : updated[existingIndex].isFavorite,
          updatedAt: now
        };
        return updated;
      } else {
        // Add new annotation
        return [...prev, {
          id: `${articleId}-${now}`,
          articleId,
          content,
          tags: options?.tags || [],
          category: options?.category || 'general',
          color: options?.color || '#6366f1',
          priority: options?.priority || 'medium',
          isFavorite: options?.isFavorite || false,
          createdAt: now,
          updatedAt: now
        }];
      }
    });
  };

  // Delete an annotation
  const deleteAnnotation = useCallback(async (articleId: string): Promise<void> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const existingAnnotation = getAnnotation(articleId);
      
      if (user && existingAnnotation) {
        const { error } = await supabase
          .from('user_annotations')
          .delete()
          .eq('id', existingAnnotation.id);

        if (error) {
          console.error('Error deleting annotation:', error);
          throw error;
        }
      }

      setAnnotations(prev => prev.filter(a => a.articleId !== articleId));
      toast.success('Anotação excluída com sucesso');
    } catch (error) {
      console.error('Error deleting annotation:', error);
      // Fallback to local deletion
      setAnnotations(prev => prev.filter(a => a.articleId !== articleId));
      toast.success('Anotação excluída localmente');
    }
  }, [getAnnotation]);

  // Toggle favorite status
  const toggleFavorite = useCallback(async (articleId: string): Promise<void> => {
    const annotation = getAnnotation(articleId);
    if (!annotation) return;

    await saveAnnotation(articleId, annotation.content, {
      ...annotation,
      isFavorite: !annotation.isFavorite
    });
  }, [getAnnotation, saveAnnotation]);

  // Search and filter annotations
  const searchAnnotations = useCallback((
    filters: AnnotationFilters = {},
    sortBy: SortOption = 'updatedAt'
  ): Annotation[] => {
    let filtered = [...annotations];

    // Search by content
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(a => 
        a.content.toLowerCase().includes(searchLower) ||
        a.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Filter by tags
    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(a => 
        filters.tags!.some(tag => a.tags.includes(tag))
      );
    }

    // Filter by category
    if (filters.category) {
      filtered = filtered.filter(a => a.category === filters.category);
    }

    // Filter by priority
    if (filters.priority) {
      filtered = filtered.filter(a => a.priority === filters.priority);
    }

    // Filter by favorite status
    if (filters.isFavorite !== undefined) {
      filtered = filtered.filter(a => a.isFavorite === filters.isFavorite);
    }

    // Filter by date range
    if (filters.dateFrom) {
      filtered = filtered.filter(a => a.updatedAt >= filters.dateFrom!.getTime());
    }
    if (filters.dateTo) {
      filtered = filtered.filter(a => a.updatedAt <= filters.dateTo!.getTime());
    }

    // Sort results
    switch (sortBy) {
      case 'createdAt':
        return filtered.sort((a, b) => b.createdAt - a.createdAt);
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return filtered.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
      case 'alphabetical':
        return filtered.sort((a, b) => a.content.localeCompare(b.content));
      default:
        return filtered.sort((a, b) => b.updatedAt - a.updatedAt);
    }
  }, [annotations]);

  // Get all unique tags
  const getAllTags = useCallback((): string[] => {
    const allTags = annotations.flatMap(a => a.tags);
    return Array.from(new Set(allTags)).sort();
  }, [annotations]);

  // Get all unique categories
  const getAllCategories = useCallback((): string[] => {
    const allCategories = annotations.map(a => a.category).filter(Boolean);
    return Array.from(new Set(allCategories)).sort();
  }, [annotations]);

  // Get statistics
  const getStatistics = useCallback(() => {
    const total = annotations.length;
    const favorites = annotations.filter(a => a.isFavorite).length;
    const byPriority = {
      high: annotations.filter(a => a.priority === 'high').length,
      medium: annotations.filter(a => a.priority === 'medium').length,
      low: annotations.filter(a => a.priority === 'low').length
    };
    const recentCount = annotations.filter(a => 
      Date.now() - a.updatedAt < 7 * 24 * 60 * 60 * 1000 // Last 7 days
    ).length;

    return { total, favorites, byPriority, recentCount };
  }, [annotations]);

  // Get all annotations, sorted by update date
  const getAllAnnotations = useCallback((): Annotation[] => {
    return searchAnnotations();
  }, [searchAnnotations]);

  return {
    annotations,
    loading,
    getAnnotation,
    saveAnnotation,
    deleteAnnotation,
    toggleFavorite,
    searchAnnotations,
    getAllAnnotations,
    getAllTags,
    getAllCategories,
    getStatistics,
    loadAnnotations,
  };
};

export default useAnnotations;
