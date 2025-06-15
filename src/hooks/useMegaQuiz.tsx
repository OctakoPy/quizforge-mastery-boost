
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Question } from '@/hooks/useQuestions';

export interface MegaQuizOptions {
  subjectId: string;
  questionLimit?: number;
  shuffle?: boolean;
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

export const useMegaQuiz = (options?: MegaQuizOptions) => {
  const { user } = useAuth();

  const {
    data: megaQuestions = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['mega-quiz', options?.subjectId, user?.id],
    queryFn: async () => {
      if (!user || !options?.subjectId) return [];

      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('user_id', user.id)
        .eq('subject_id', options.subjectId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to ensure options is always string[]
      let questions: Question[] = (data || []).map(question => ({
        ...question,
        options: Array.isArray(question.options) 
          ? question.options.map(option => String(option))
          : []
      }));

      // Shuffle questions if requested
      if (options.shuffle !== false) {
        questions = shuffleArray([...questions]);
      }

      // Shuffle options for each question
      questions = questions.map(shuffleQuestionOptions);

      // Limit questions if specified
      if (options.questionLimit && options.questionLimit > 0) {
        questions = questions.slice(0, options.questionLimit);
      }

      return questions;
    },
    enabled: !!user && !!options?.subjectId
  });

  return {
    megaQuestions,
    isLoading,
    error
  };
};
