
import { useEffect } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Question } from '@/hooks/useQuestions';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';

interface QuizResultsProps {
  questions: Question[];
  userAnswers: number[];
  onRestart: () => void;
  onBack: () => void;
  subjectId?: string;
  documentId?: string;
  isMegaQuiz?: boolean;
}

const QuizResults = ({ 
  questions, 
  userAnswers, 
  onRestart, 
  onBack, 
  subjectId,
  documentId,
  isMegaQuiz = false
}: QuizResultsProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const correctAnswers = userAnswers.reduce((count, answer, index) => {
    return count + (answer === questions[index].correct_answer ? 1 : 0);
  }, 0);
  const score = Math.round((correctAnswers / questions.length) * 100);

  useEffect(() => {
    const saveQuizAttempt = async () => {
      if (!user || !subjectId) return;

      try {
        const { error } = await supabase
          .from('quiz_attempts')
          .insert({
            user_id: user.id,
            subject_id: subjectId,
            document_id: isMegaQuiz ? null : documentId,
            correct_answers: correctAnswers,
            total_questions: questions.length,
            score: score
          });

        if (error) {
          console.error('Error saving quiz attempt:', error);
        } else {
          // Invalidate and refetch statistics
          queryClient.invalidateQueries({ queryKey: ['statistics', user.id] });
          console.log('Quiz attempt saved successfully');
        }
      } catch (error) {
        console.error('Error saving quiz attempt:', error);
      }
    };

    saveQuizAttempt();
  }, [user, subjectId, documentId, correctAnswers, questions.length, score, queryClient, isMegaQuiz]);

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Quiz Complete!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
              score >= 80 ? 'bg-green-100' : score >= 60 ? 'bg-yellow-100' : 'bg-red-100'
            }`}>
              <span className={`text-3xl font-bold ${
                score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-500'
              }`}>
                {score}%
              </span>
            </div>
            <p className="text-lg text-gray-600">
              You got {correctAnswers} out of {questions.length} questions correct
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Review:</h3>
            {questions.map((question, index) => {
              const userAnswer = userAnswers[index];
              const isCorrect = userAnswer === question.correct_answer;
              
              return (
                <div key={question.id} className="border rounded-lg p-4">
                  <div className="flex items-start space-x-2 mb-2">
                    {isCorrect ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                    )}
                    <p className="font-medium text-gray-900">{question.question}</p>
                  </div>
                  <div className="ml-7 space-y-1 text-sm">
                    <p className="text-green-600">
                      ✓ Correct: {question.options[question.correct_answer] || 'N/A'}
                    </p>
                    {!isCorrect && (
                      <p className="text-red-500">
                        ✗ Your answer: {question.options[userAnswer] || 'N/A'}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex space-x-4">
            <Button onClick={onRestart} variant="outline" className="flex-1">
              Retake Quiz
            </Button>
            <Button onClick={onBack} className="flex-1">
              Back to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizResults;
