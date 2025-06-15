
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Question } from '@/hooks/useQuestions';

export const useWrongQuestions = (subjectId?: string, documentId?: string) => {
  const { user } = useAuth();

  const {
    data: wrongQuestions = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['wrong-questions', subjectId, documentId, user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Get the most recent quiz attempt for this subject/document
      let attemptQuery = supabase
        .from('quiz_attempts')
        .select('id, attempted_at')
        .eq('user_id', user.id);

      if (documentId) {
        attemptQuery = attemptQuery.eq('document_id', documentId);
      } else if (subjectId) {
        attemptQuery = attemptQuery.eq('subject_id', subjectId);
      }

      const { data: attempts, error: attemptError } = await attemptQuery
        .order('attempted_at', { ascending: false })
        .limit(1);

      if (attemptError) throw attemptError;

      if (!attempts || attempts.length === 0) {
        return [];
      }

      // For now, we'll return all questions since we don't store individual question results
      // In a future enhancement, we could store detailed question results
      let query = supabase
        .from('questions')
        .select('*')
        .eq('user_id', user.id);

      if (documentId) {
        query = query.eq('document_id', documentId);
      } else if (subjectId) {
        query = query.eq('subject_id', subjectId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data
      const processedQuestions: Question[] = (data || []).map(question => ({
        ...question,
        options: Array.isArray(question.options) 
          ? question.options.map(option => String(option))
          : []
      }));

      // For now, return a subset as "wrong questions" (in future, this would be based on actual results)
      // This is a placeholder implementation
      return processedQuestions.slice(0, Math.max(1, Math.floor(processedQuestions.length * 0.3)));
    },
    enabled: !!user && (!!subjectId || !!documentId)
  });

  return {
    wrongQuestions,
    isLoading,
    error
  };
};
