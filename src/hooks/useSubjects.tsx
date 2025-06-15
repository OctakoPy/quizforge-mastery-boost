
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Subject {
  id: string;
  name: string;
  color: string;
  created_at: string;
  updated_at: string;
  documentCount?: number;
  questionCount?: number;
  masteryScore?: number;
  lastStudied?: string;
}

export const useSubjects = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: subjects = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['subjects', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('subjects')
        .select(`
          *,
          documents(count),
          questions(count),
          quiz_attempts(score, attempted_at)
        `)
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Process the data to match the expected format
      return data.map((subject: any) => {
        const documentCount = subject.documents?.[0]?.count || 0;
        const questionCount = subject.questions?.[0]?.count || 0;
        
        // Calculate mastery score from recent quiz attempts
        const recentAttempts = subject.quiz_attempts?.slice(-5) || [];
        const masteryScore = recentAttempts.length > 0
          ? Math.round(recentAttempts.reduce((sum: number, attempt: any) => sum + attempt.score, 0) / recentAttempts.length)
          : 0;

        // Get last studied date
        const lastAttempt = subject.quiz_attempts?.[0];
        const lastStudied = lastAttempt 
          ? new Date(lastAttempt.attempted_at).toLocaleDateString()
          : 'Never';

        return {
          id: subject.id,
          name: subject.name,
          color: subject.color,
          created_at: subject.created_at,
          updated_at: subject.updated_at,
          documentCount,
          questionCount,
          masteryScore,
          lastStudied
        };
      });
    },
    enabled: !!user
  });

  const createSubject = useMutation({
    mutationFn: async (newSubject: { name: string; color: string }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('subjects')
        .insert([{
          name: newSubject.name,
          color: newSubject.color,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    }
  });

  return {
    subjects,
    isLoading,
    error,
    createSubject: createSubject.mutate,
    isCreating: createSubject.isPending
  };
};
