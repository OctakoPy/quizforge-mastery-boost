
import { useState } from 'react';
import { ArrowLeft, Target, RotateCcw, RefreshCw, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

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
  documentName?: string;
  questionCount: number;
  wrongQuestionCount?: number;
  lastAttemptScore?: number;
  onBack: () => void;
  onStart: (quizType: 'all' | 'wrong') => void;
}

const QuizSetup = ({ subject, documentName, questionCount, wrongQuestionCount = 0, lastAttemptScore, onBack, onStart }: QuizSetupProps) => {
  const [quizType, setQuizType] = useState<'all' | 'wrong'>('all');

  const handleStart = () => {
    onStart(quizType);
  };

  const displayQuestionCount = quizType === 'wrong' ? wrongQuestionCount : questionCount;

  const getEncouragingMessage = () => {
    if (lastAttemptScore === undefined) {
      return "Ready to start your first quiz? Let's see what you know!";
    }
    
    if (lastAttemptScore >= 90) {
      return `Outstanding! You scored ${lastAttemptScore}% last time. Can you maintain that excellence?`;
    } else if (lastAttemptScore >= 80) {
      return `Great job! You scored ${lastAttemptScore}% last time. Ready to push for even higher?`;
    } else if (lastAttemptScore >= 70) {
      return `Good work! You scored ${lastAttemptScore}% last time. Let's aim for improvement!`;
    } else if (lastAttemptScore >= 60) {
      return `You scored ${lastAttemptScore}% last time. You've got this - let's improve together!`;
    } else {
      return `You scored ${lastAttemptScore}% last time. Every attempt is progress - let's do better!`;
    }
  };

  const getQuizTitle = () => {
    if (subject && documentName) {
      return `${subject.name} ${documentName} Quiz`;
    } else if (subject) {
      return `${subject.name} Quiz`;
    }
    return 'Quiz';
  };

  const getButtonText = () => {
    if (lastAttemptScore !== undefined) {
      return 'Try Previous Quiz Again';
    }
    return 'Start Quiz';
  };

  const getButtonIcon = () => {
    if (lastAttemptScore !== undefined) {
      return <RefreshCw className="mr-2 h-4 w-4" />;
    }
    return <Play className="mr-2 h-4 w-4" />;
  };

  const getButtonColor = () => {
    if (lastAttemptScore !== undefined) {
      return 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600';
    }
    return 'bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700';
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Button onClick={onBack} variant="ghost" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Quiz Setup</h1>
        <p className="text-gray-600">{getEncouragingMessage()}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="mr-2 h-5 w-5" />
            {getQuizTitle()}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Quiz Type:</h3>
            <RadioGroup value={quizType} onValueChange={(value) => setQuizType(value as 'all' | 'wrong')}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="all-questions" />
                <Label htmlFor="all-questions" className="flex-1 cursor-pointer">
                  All Questions ({questionCount} questions)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem 
                  value="wrong" 
                  id="wrong-questions" 
                  disabled={wrongQuestionCount === 0}
                />
                <Label 
                  htmlFor="wrong-questions" 
                  className={`flex-1 cursor-pointer flex items-center ${
                    wrongQuestionCount === 0 ? 'text-gray-400' : ''
                  }`}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Practice Wrong Questions ({wrongQuestionCount} questions)
                  {wrongQuestionCount === 0 && (
                    <span className="ml-2 text-xs text-gray-500">(Take a quiz first)</span>
                  )}
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{displayQuestionCount}</p>
              <p className="text-sm text-blue-600">Questions</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">~{Math.max(1, displayQuestionCount * 1.5)}</p>
              <p className="text-sm text-green-600">Minutes</p>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900">Quiz Rules:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Each question has only one correct answer</li>
              <li>• Questions and options are randomly shuffled</li>
              <li>• You cannot go back to previous questions</li>
              <li>• Your results will be saved to track your progress</li>
              {quizType === 'wrong' && (
                <li>• Wrong question practice does not affect mastery scores</li>
              )}
            </ul>
          </div>

          <Button
            onClick={handleStart}
            disabled={displayQuestionCount === 0}
            className={`w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed ${getButtonColor()}`}
          >
            {getButtonIcon()}
            {displayQuestionCount === 0 ? 'No Questions Available' : getButtonText()}
          </Button>
        </CardContent>
      </Card>

      <div className="text-center mt-8 text-sm text-gray-500">
        Created by Octako Py
      </div>
    </div>
  );
};

export default QuizSetup;
