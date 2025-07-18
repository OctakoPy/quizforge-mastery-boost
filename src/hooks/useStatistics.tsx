
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface QuizStatistics {
  quizId: string;
  quizName: string;
  subjectId: string;
  subjectName: string;
  totalAttempts: number;
  bestScore: number;
  averageScore: number;
  lastAttempted: string | null;
  masteryLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  progressTrend: 'improving' | 'declining' | 'stable';
}

export interface SubjectStatistics {
  subjectId: string;
  subjectName: string;
  totalQuizzes: number;
  totalAttempts: number;
  averageScore: number;
  masteryScore: number;
  lastStudied: string | null;
  progressTrend: 'improving' | 'declining' | 'stable';
  recentActivity: Array<{
    date: string;
    quizName: string;
    score: number;
  }>;
}

export interface OverallStatistics {
  totalSubjects: number;
  totalQuizzes: number;
  totalAttempts: number;
  overallMastery: number;
  studyStreak: number;
  recentActivity: Array<{
    date: string;
    subjectName: string;
    quizName: string;
    score: number;
  }>;
}

export const useStatistics = () => {
  const { user } = useAuth();

  const statisticsQuery = useQuery({
    queryKey: ['statistics', user?.id],
    queryFn: async () => {
      if (!user) return null;

      console.log('Fetching statistics for user:', user.id);

      // Get quiz attempts with related data
      const { data: attempts, error: attemptsError } = await supabase
        .from('quiz_attempts')
        .select(`
          *,
          subjects!inner(id, name),
          documents(id, name)
        `)
        .eq('user_id', user.id)
        .order('attempted_at', { ascending: false });

      if (attemptsError) {
        console.error('Error fetching attempts:', attemptsError);
        throw attemptsError;
      }

      console.log('Quiz attempts fetched:', attempts);

      // Get subjects with document counts
      const { data: subjects, error: subjectsError } = await supabase
        .from('subjects')
        .select(`
          *,
          documents(id, name)
        `)
        .eq('user_id', user.id);

      if (subjectsError) {
        console.error('Error fetching subjects:', subjectsError);
        throw subjectsError;
      }

      console.log('Subjects fetched:', subjects);

      // Calculate quiz statistics
      const quizStats: QuizStatistics[] = [];
      const quizGroups = attempts?.reduce((acc, attempt: any) => {
        if (!attempt.document_id) return acc;
        const key = `${attempt.document_id}_${attempt.subject_id}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(attempt);
        return acc;
      }, {} as Record<string, any[]>) || {};

      Object.entries(quizGroups).forEach(([key, quizAttempts]) => {
        const firstAttempt = quizAttempts[0];
        const scores = quizAttempts.map(a => a.score);
        const bestScore = Math.max(...scores);
        const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        
        // Calculate mastery level
        let masteryLevel: QuizStatistics['masteryLevel'] = 'beginner';
        if (averageScore >= 90) masteryLevel = 'expert';
        else if (averageScore >= 80) masteryLevel = 'advanced';
        else if (averageScore >= 70) masteryLevel = 'intermediate';

        // Calculate progress trend
        let progressTrend: QuizStatistics['progressTrend'] = 'stable';
        if (quizAttempts.length >= 3) {
          const recent = quizAttempts.slice(0, 3).map(a => a.score);
          const older = quizAttempts.slice(-3).map(a => a.score);
          const recentAvg = recent.reduce((sum, score) => sum + score, 0) / recent.length;
          const olderAvg = older.reduce((sum, score) => sum + score, 0) / older.length;
          
          if (recentAvg > olderAvg + 5) progressTrend = 'improving';
          else if (recentAvg < olderAvg - 5) progressTrend = 'declining';
        }

        quizStats.push({
          quizId: firstAttempt.document_id,
          quizName: firstAttempt.documents?.name || 'Unknown Quiz',
          subjectId: firstAttempt.subject_id,
          subjectName: firstAttempt.subjects?.name || 'Unknown Subject',
          totalAttempts: quizAttempts.length,
          bestScore,
          averageScore: Math.round(averageScore),
          lastAttempted: firstAttempt.attempted_at,
          masteryLevel,
          progressTrend
        });
      });

      // Calculate subject statistics
      const subjectStats: SubjectStatistics[] = subjects?.map((subject: any) => {
        const subjectAttempts = attempts?.filter(a => a.subject_id === subject.id) || [];
        const scores = subjectAttempts.map(a => a.score);
        const averageScore = scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;
        
        // Calculate progress trend
        let progressTrend: SubjectStatistics['progressTrend'] = 'stable';
        if (subjectAttempts.length >= 5) {
          const recent = subjectAttempts.slice(0, 5).map(a => a.score);
          const older = subjectAttempts.slice(-5).map(a => a.score);
          const recentAvg = recent.reduce((sum, score) => sum + score, 0) / recent.length;
          const olderAvg = older.reduce((sum, score) => sum + score, 0) / older.length;
          
          if (recentAvg > olderAvg + 5) progressTrend = 'improving';
          else if (recentAvg < olderAvg - 5) progressTrend = 'declining';
        }

        const recentActivity = subjectAttempts.slice(0, 10).map(attempt => ({
          date: attempt.attempted_at,
          quizName: attempt.documents?.name || 'Unknown Quiz',
          score: attempt.score
        }));

        return {
          subjectId: subject.id,
          subjectName: subject.name,
          totalQuizzes: subject.documents?.length || 0,
          totalAttempts: subjectAttempts.length,
          averageScore: Math.round(averageScore),
          masteryScore: Math.round(averageScore),
          lastStudied: subjectAttempts[0]?.attempted_at || null,
          progressTrend,
          recentActivity
        };
      }) || [];

      // Calculate overall statistics - FIXED: Use only latest attempt per quiz for overall mastery
      const totalAttempts = attempts?.length || 0;
      
      // Get latest attempt per quiz for overall mastery calculation
      const latestQuizAttempts: Record<string, any> = {};
      attempts?.forEach(attempt => {
        const key = attempt.document_id ? `${attempt.document_id}_${attempt.subject_id}` : `subject_${attempt.subject_id}`;
        if (!latestQuizAttempts[key] || new Date(attempt.attempted_at) > new Date(latestQuizAttempts[key].attempted_at)) {
          latestQuizAttempts[key] = attempt;
        }
      });
      
      const latestScores = Object.values(latestQuizAttempts).map((attempt: any) => attempt.score);
      const overallMastery = latestScores.length > 0 
        ? Math.round(latestScores.reduce((sum, score) => sum + score, 0) / latestScores.length)
        : 0;

      // Calculate study streak
      const studyStreak = calculateStudyStreak(attempts || []);

      // Create recent activity from attempts
      const recentActivity = (attempts || []).slice(0, 20).map(attempt => ({
        date: attempt.attempted_at,
        subjectName: attempt.subjects?.name || 'Unknown Subject',
        quizName: attempt.documents?.name || 'Unknown Quiz',
        score: attempt.score
      }));

      console.log('Recent activity created:', recentActivity);

      const overallStats: OverallStatistics = {
        totalSubjects: subjects?.length || 0,
        totalQuizzes: subjects?.reduce((sum, s) => sum + (s.documents?.length || 0), 0) || 0,
        totalAttempts,
        overallMastery,
        studyStreak,
        recentActivity
      };

      console.log('Overall statistics:', overallStats);

      return {
        quizStatistics: quizStats,
        subjectStatistics: subjectStats,
        overallStatistics: overallStats
      };
    },
    enabled: !!user
  });

  return {
    statistics: statisticsQuery.data,
    isLoading: statisticsQuery.isLoading,
    error: statisticsQuery.error
  };
};

function calculateStudyStreak(attempts: any[]): number {
  if (!attempts.length) return 0;
  
  const dates = [...new Set(attempts.map(a => 
    new Date(a.attempted_at).toDateString()
  ))].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  
  let streak = 0;
  const today = new Date().toDateString();
  let currentDate = new Date();
  
  for (const dateStr of dates) {
    const checkDate = currentDate.toDateString();
    if (dateStr === checkDate) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }
  
  return streak;
}
