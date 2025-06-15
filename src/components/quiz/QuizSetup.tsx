
import { ArrowLeft, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Subject {
  id: string;
  name: string;
  documentCount: number;
  questionCount: number;
  masteryScore: number;
  lastStudied: string;
  color: string;
}

interface QuizSetupProps {
  subject: Subject | undefined;
  questionCount: number;
  onBack: () => void;
  onStart: () => void;
}

const QuizSetup = ({ subject, questionCount, onBack, onStart }: QuizSetupProps) => {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Button onClick={onBack} variant="ghost" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Quiz Setup</h1>
        <p className="text-gray-600">Get ready to test your knowledge</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="mr-2 h-5 w-5" />
            {subject?.name || 'Quiz'} Quiz
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{questionCount}</p>
              <p className="text-sm text-blue-600">Questions</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">~{questionCount * 1.5}</p>
              <p className="text-sm text-green-600">Minutes</p>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900">Quiz Rules:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Each question has only one correct answer</li>
              <li>• You cannot go back to previous questions</li>
              <li>• Your results will be saved to track your progress</li>
            </ul>
          </div>

          <Button
            onClick={onStart}
            className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 py-3"
          >
            Start Quiz
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizSetup;
