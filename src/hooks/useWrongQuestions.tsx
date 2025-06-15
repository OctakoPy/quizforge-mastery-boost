
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

      // Get wrong questions based on question_results
      let query = supabase
        .from('question_results')
        .select(`
          question_id,
          questions (
            id,
            question,
            options,
            correct_answer,
            user_id,
            document_id,
            subject_id,
            created_at
          )
        `)
        .eq('user_id', user.id)
        .eq('is_correct', false);

      if (documentId) {
        // For document-specific quizzes, get wrong questions from that document
        const { data: documentQuestions } = await supabase
          .from('questions')
          .select('id')
          .eq('document_id', documentId);
        
        if (documentQuestions && documentQuestions.length > 0) {
          const questionIds = documentQuestions.map(q => q.id);
          query = query.in('question_id', questionIds);
        } else {
          return [];
        }
      } else if (subjectId) {
        // For subject-wide quizzes, get wrong questions from that subject
        const { data: subjectQuestions } = await supabase
          .from('questions')
          .select('id')
          .eq('subject_id', subjectId);
        
        if (subjectQuestions && subjectQuestions.length > 0) {
          const questionIds = subjectQuestions.map(q => q.id);
          query = query.in('question_id', questionIds);
        } else {
          return [];
        }
      }

      const { data, error } = await query
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Extract unique questions (a question might be wrong multiple times)
      const uniqueQuestions = new Map();
      
      (data || []).forEach(result => {
        if (result.questions && !uniqueQuestions.has(result.question_id)) {
          uniqueQuestions.set(result.question_id, result.questions);
        }
      });

      // Transform to Question format and add shuffling
      const processedQuestions: Question[] = Array.from(uniqueQuestions.values()).map(question => ({
        ...question,
        options: Array.isArray(question.options) 
          ? question.options.map(option => String(option))
          : []
      }));

      return processedQuestions;
    },
    enabled: !!user && (!!subjectId || !!documentId)
  });

  return {
    wrongQuestions,
    isLoading,
    error
  };
};
