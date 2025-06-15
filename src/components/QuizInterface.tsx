
import { useState } from 'react';
import { ArrowLeft, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useQuestions, Question } from '@/hooks/useQuestions';
import { useWrongQuestions } from '@/hooks/useWrongQuestions';
import QuizSetup from '@/components/quiz/QuizSetup';
import QuizQuestion from '@/components/quiz/QuizQuestion';
import QuizResults from '@/components/quiz/QuizResults';

interface Subject {
  id: string;
  name: string;
  documentCount: number;
  questionCount: number;
  masteryScore: number;
  lastStudied: string;
  color: string;
}

interface QuizInterfaceProps {
  subjects: Subject[];
  selectedSubject: string | null;
  selectedDocument?: string | null;
  onBack: () => void;
  megaQuestions?: Question[];
  isMegaQuiz?: boolean;
}

const QuizInterface = ({ subjects, selectedSubject, selectedDocument, onBack, megaQuestions, isMegaQuiz = false }: QuizInterfaceProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizType, setQuizType] = useState<'all' | 'wrong'>('all');

  const subject = selectedSubject ? subjects.find(s => s.id === selectedSubject) : subjects[0];
  
  // Use different query based on whether we have a specific document or are doing a mega quiz
  const { questions: normalQuestions, isLoading: isNormalLoading } = useQuestions(
    isMegaQuiz ? selectedSubject || undefined : undefined,
    !isMegaQuiz && selectedDocument ? selectedDocument : undefined,
    true // Always shuffle questions for regular quizzes now
  );

  const { wrongQuestions, isLoading: isWrongLoading } = useWrongQuestions(
    selectedSubject || undefined,
    selectedDocument || undefined
  );
  
  // Use mega questions if provided, otherwise use normal or wrong questions based on quiz type
  const questions = isMegaQuiz 
    ? (megaQuestions || []) 
    : (quizType === 'wrong' ? wrongQuestions : normalQuestions);
  const isLoading = isMegaQuiz ? false : (quizType === 'wrong' ? isWrongLoading : isNormalLoading);

  const handleAnswerSelect = (value: string) => {
    setSelectedAnswer(value);
  };

  const handleNextQuestion = () => {
    const answerIndex = parseInt(selectedAnswer);
    const newAnswers = [...userAnswers, answerIndex];
    setUserAnswers(newAnswers);
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer('');
    } else {
      setShowResults(true);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer('');
    setUserAnswers([]);
    setShowResults(false);
    setQuizStarted(false);
    setQuizType('all');
  };

  const handleQuizStart = (selectedQuizType: 'all' | 'wrong') => {
    setQuizType(selectedQuizType);
    setQuizStarted(true);
    // Reset quiz state when starting
    setCurrentQuestionIndex(0);
    setSelectedAnswer('');
    setUserAnswers([]);
    setShowResults(false);
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Button onClick={onBack} variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading questions...</p>
        </div>
      </div>
    );
  }

  // Show setup screen if quiz hasn't started yet or if we don't have questions for the selected type
  if (!quizStarted) {
    return (
      <QuizSetup
        subject={subject}
        questionCount={normalQuestions.length}
        wrongQuestionCount={wrongQuestions.length}
        onBack={onBack}
        onStart={handleQuizStart}
      />
    );
  }

  // Check if we have questions after quiz has started
  if (questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Button onClick={onBack} variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {quizType === 'wrong' ? 'No wrong questions available' : 'No questions available'}
            </h3>
            <p className="text-gray-600 mb-4">
              {quizType === 'wrong' 
                ? 'Take a quiz first to have questions to practice.'
                : subject?.name 
                  ? `No questions found for ${subject.name}. Upload some quizzes to get started!`
                  : 'No questions found for this subject.'
              }
            </p>
            <Button onClick={() => setQuizStarted(false)}>
              Back to Quiz Setup
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showResults) {
    // Get document ID for single quiz (not mega quiz)
    const documentId = !isMegaQuiz && selectedDocument ? selectedDocument : undefined;
    
    return (
      <QuizResults
        questions={questions}
        userAnswers={userAnswers}
        onRestart={restartQuiz}
        onBack={onBack}
        subjectId={selectedSubject || undefined}
        documentId={documentId}
        isMegaQuiz={isMegaQuiz}
        isWrongQuestionsQuiz={quizType === 'wrong'}
      />
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <QuizQuestion
      question={currentQuestion}
      currentQuestionIndex={currentQuestionIndex}
      totalQuestions={questions.length}
      selectedAnswer={selectedAnswer}
      onAnswerSelect={handleAnswerSelect}
      onNext={handleNextQuestion}
      onExit={onBack}
    />
  );
};

export default QuizInterface;
