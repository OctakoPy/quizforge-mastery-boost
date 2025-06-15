
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Question {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  subject_id: string;
  document_id: string;
  created_at: string;
}

export const useQuestions = (subjectId?: string) => {
  const { user } = useAuth();

  const {
    data: questions = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['questions', subjectId, user?.id],
    queryFn: async () => {
      if (!user) return [];

      let query = supabase
        .from('questions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (subjectId) {
        query = query.eq('subject_id', subjectId);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Transform the data to ensure options is always string[]
      return (data || []).map(question => ({
        ...question,
        options: Array.isArray(question.options) 
          ? question.options.map(option => String(option))
          : []
      }));
    },
    enabled: !!user
  });

  return {
    questions,
    isLoading,
    error
  };
};
