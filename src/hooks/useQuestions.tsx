
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Question {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  user_id: string;
  document_id: string;
  subject_id: string;
  created_at: string;
  // For tracking shuffled options
  shuffledOptions?: string[];
  shuffledCorrectAnswer?: number;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function shuffleQuestionOptions(question: Question): Question {
  const optionsWithIndex = question.options.map((option, index) => ({ option, originalIndex: index }));
  const shuffledOptionsWithIndex = shuffleArray(optionsWithIndex);
  
  const shuffledOptions = shuffledOptionsWithIndex.map(item => item.option);
  const shuffledCorrectAnswer = shuffledOptionsWithIndex.findIndex(
    item => item.originalIndex === question.correct_answer
  );

  return {
    ...question,
    shuffledOptions,
    shuffledCorrectAnswer
  };
}

export const useQuestions = (subjectId?: string, documentId?: string, shuffleQuestions = false) => {
  const { user } = useAuth();

  const {
    data: questions = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['questions', subjectId, documentId, user?.id, shuffleQuestions],
    queryFn: async () => {
      if (!user) return [];

      let query = supabase
        .from('questions')
        .select('*')
        .eq('user_id', user.id);

      // Filter by specific document if provided
      if (documentId) {
        query = query.eq('document_id', documentId);
      } 
      // Otherwise filter by subject if provided
      else if (subjectId) {
        query = query.eq('subject_id', subjectId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to ensure options is always string[]
      let processedQuestions = (data || []).map(question => ({
        ...question,
        options: Array.isArray(question.options) 
          ? question.options.map(option => String(option))
          : []
      }));

      // Shuffle questions if requested
      if (shuffleQuestions) {
        processedQuestions = shuffleArray(processedQuestions);
      }

      // Always shuffle options for each question
      return processedQuestions.map(shuffleQuestionOptions);
    },
    enabled: !!user && (!!subjectId || !!documentId)
  });

  return {
    questions,
    isLoading,
    error
  };
};
