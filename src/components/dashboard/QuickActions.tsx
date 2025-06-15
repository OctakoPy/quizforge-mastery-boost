
import { Upload, Play, FileText, BarChart3 } from 'lucide-react';
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

interface QuickActionsProps {
  subjects: Subject[];
  totalQuestions: number;
  onUpload: () => void;
  onQuiz: () => void;
  onDocuments: () => void;
  onStatistics: () => void;
}

const QuickActions = ({ subjects, totalQuestions, onUpload, onQuiz, onDocuments, onStatistics }: QuickActionsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button
            onClick={onUpload}
            className="h-20 flex-col space-y-2 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
          >
            <Upload className="h-6 w-6" />
            <span>Upload Quiz</span>
          </Button>

          <Button
            onClick={onQuiz}
            disabled={totalQuestions === 0}
            className="h-20 flex-col space-y-2 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
          >
            <Play className="h-6 w-6" />
            <span>Start Quiz</span>
          </Button>

          <Button
            onClick={onDocuments}
            variant="outline"
            className="h-20 flex-col space-y-2"
          >
            <FileText className="h-6 w-6" />
            <span>Manage Quizzes</span>
          </Button>

          <Button
            onClick={onStatistics}
            variant="outline"
            className="h-20 flex-col space-y-2"
          >
            <BarChart3 className="h-6 w-6" />
            <span>Statistics</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
