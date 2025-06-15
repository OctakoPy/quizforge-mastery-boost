
import { useState } from 'react';
import { ArrowLeft, Play, Shuffle, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface Subject {
  id: string;
  name: string;
  documentCount: number;
  questionCount: number;
  masteryScore: number;
  lastStudied: string;
  color: string;
}

interface MegaQuizSetupProps {
  subject: Subject;
  totalQuestions: number;
  onBack: () => void;
  onStart: (options: { questionLimit?: number; shuffle: boolean }) => void;
}

const MegaQuizSetup = ({ subject, totalQuestions, onBack, onStart }: MegaQuizSetupProps) => {
  const [questionLimit, setQuestionLimit] = useState<number>(totalQuestions);
  const [shuffle, setShuffle] = useState(true);

  const handleStart = () => {
    onStart({
      questionLimit: questionLimit === totalQuestions ? undefined : questionLimit,
      shuffle
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Button onClick={onBack} variant="ghost" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mega Quiz Setup</h1>
        <p className="text-gray-600">Combine all quizzes from {subject.name} into one comprehensive test</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <div className={`w-4 h-4 rounded-full ${subject.color} mr-3`}></div>
            {subject.name} - Mega Quiz
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{subject.documentCount}</p>
              <p className="text-sm text-blue-800">Quizzes Combined</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{totalQuestions}</p>
              <p className="text-sm text-blue-800">Total Questions</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="questionLimit">Number of Questions</Label>
              <Input
                id="questionLimit"
                type="number"
                min="1"
                max={totalQuestions}
                value={questionLimit}
                onChange={(e) => setQuestionLimit(Math.min(totalQuestions, Math.max(1, parseInt(e.target.value) || 1)))}
                className="mt-1"
              />
              <p className="text-sm text-gray-500 mt-1">
                Maximum {totalQuestions} questions available
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="shuffle"
                checked={shuffle}
                onCheckedChange={(checked) => setShuffle(checked as boolean)}
              />
              <Label htmlFor="shuffle" className="flex items-center cursor-pointer">
                <Shuffle className="mr-2 h-4 w-4" />
                Shuffle questions randomly
              </Label>
            </div>
          </div>

          <div className="pt-4 border-t">
            <Button
              onClick={handleStart}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              size="lg"
            >
              <Play className="mr-2 h-5 w-5" />
              Start Mega Quiz ({questionLimit} questions)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MegaQuizSetup;
