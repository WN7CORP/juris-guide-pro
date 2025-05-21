
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface Annotation {
  articleId: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

const LOCAL_STORAGE_KEY = 'juris-guide-annotations';

export const useAnnotations = () => {
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [loading, setLoading] = useState(true);

  // Load annotations from localStorage on mount
  useEffect(() => {
    try {
      const storedAnnotations = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedAnnotations) {
        setAnnotations(JSON.parse(storedAnnotations));
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
  const saveAnnotation = useCallback((articleId: string, content: string): void => {
    setAnnotations(prev => {
      const now = Date.now();
      const existingIndex = prev.findIndex(a => a.articleId === articleId);
      
      if (existingIndex >= 0) {
        // Update existing annotation
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          content,
          updatedAt: now
        };
        return updated;
      } else {
        // Add new annotation
        return [...prev, {
          articleId,
          content,
          createdAt: now,
          updatedAt: now
        }];
      }
    });
  }, []);

  // Delete an annotation
  const deleteAnnotation = useCallback((articleId: string): void => {
    setAnnotations(prev => prev.filter(a => a.articleId !== articleId));
    toast.success('Anotação excluída com sucesso');
  }, []);

  // Get all annotations, sorted by update date
  const getAllAnnotations = useCallback((): Annotation[] => {
    return [...annotations].sort((a, b) => b.updatedAt - a.updatedAt);
  }, [annotations]);

  return {
    getAnnotation,
    saveAnnotation,
    deleteAnnotation,
    getAllAnnotations,
    loading
  };
};

export default useAnnotations;
