
import { useState } from 'react';
import { ArrowLeft, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useQuestions } from '@/hooks/useQuestions';
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
  onBack: () => void;
}

const QuizInterface = ({ subjects, selectedSubject, onBack }: QuizInterfaceProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);

  const subject = selectedSubject ? subjects.find(s => s.id === selectedSubject) : subjects[0];
  const { questions, isLoading } = useQuestions(selectedSubject || undefined);

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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No questions available</h3>
            <p className="text-gray-600 mb-4">
              {subject?.name ? `No questions found for ${subject.name}.` : 'No questions found for this subject.'} 
              Upload some documents to generate questions!
            </p>
            <Button onClick={onBack}>
              Upload Documents
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showResults) {
    return (
      <QuizResults
        questions={questions}
        userAnswers={userAnswers}
        onRestart={restartQuiz}
        onBack={onBack}
      />
    );
  }

  if (!quizStarted) {
    return (
      <QuizSetup
        subject={subject}
        questionCount={questions.length}
        onBack={onBack}
        onStart={() => setQuizStarted(true)}
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
