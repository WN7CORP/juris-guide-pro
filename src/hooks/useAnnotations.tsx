
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

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

  // Load annotations from localStorage on mount
  useEffect(() => {
    try {
      const storedAnnotations = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedAnnotations) {
        const parsed = JSON.parse(storedAnnotations);
        // Migrate old annotations format if needed
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
      console.error('Error loading annotations:', error);
      toast.error('Erro ao carregar anotações');
    } finally {
      setLoading(false);
    }
  }, []);

  // Save annotations to localStorage whenever they change
  useEffect(() => {
    if (!loading) {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(annotations));
      } catch (error) {
        console.error('Error saving annotations:', error);
        toast.error('Erro ao salvar anotações');
      }
    }
  }, [annotations, loading]);

  // Get annotation for a specific article
  const getAnnotation = useCallback((articleId: string): Annotation | undefined => {
    return annotations.find(a => a.articleId === articleId);
  }, [annotations]);

  // Add or update an annotation
  const saveAnnotation = useCallback((
    articleId: string, 
    content: string, 
    options?: {
      tags?: string[];
      category?: string;
      color?: string;
      priority?: 'low' | 'medium' | 'high';
      isFavorite?: boolean;
    }
  ): void => {
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
    
    toast.success('Anotação salva com sucesso');
  }, []);

  // Delete an annotation
  const deleteAnnotation = useCallback((articleId: string): void => {
    setAnnotations(prev => prev.filter(a => a.articleId !== articleId));
    toast.success('Anotação excluída com sucesso');
  }, []);

  // Toggle favorite status
  const toggleFavorite = useCallback((articleId: string): void => {
    setAnnotations(prev => prev.map(a => 
      a.articleId === articleId 
        ? { ...a, isFavorite: !a.isFavorite, updatedAt: Date.now() }
        : a
    ));
  }, []);

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
    getStatistics
  };
};

export default useAnnotations;
