
import { ArrowLeft, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface Question {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  subject_id: string;
  document_id: string;
  created_at: string;
}

interface QuizQuestionProps {
  question: Question;
  currentQuestionIndex: number;
  totalQuestions: number;
  selectedAnswer: string;
  onAnswerSelect: (value: string) => void;
  onNext: () => void;
  onExit: () => void;
}

const QuizQuestion = ({ 
  question, 
  currentQuestionIndex, 
  totalQuestions, 
  selectedAnswer, 
  onAnswerSelect, 
  onNext, 
  onExit 
}: QuizQuestionProps) => {
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;
  const currentOptions = Array.isArray(question.options) 
    ? question.options.map(option => String(option)) 
    : [];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <Button onClick={onExit} variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Exit Quiz
          </Button>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            <span>Question {currentQuestionIndex + 1} of {totalQuestions}</span>
          </div>
        </div>
        
        <Progress value={progress} className="h-2" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{question.question}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <RadioGroup value={selectedAnswer} onValueChange={onAnswerSelect}>
            {currentOptions.map((option, index) => (
              <div key={index} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>

          <Button
            onClick={onNext}
            disabled={!selectedAnswer}
            className="w-full"
          >
            {currentQuestionIndex < totalQuestions - 1 ? 'Next Question' : 'Finish Quiz'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizQuestion;
