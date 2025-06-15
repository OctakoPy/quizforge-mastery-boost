
import { FileText, Target, Calendar, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface Subject {
  id: string;
  name: string;
  documentCount: number;
  questionCount: number;
  masteryScore: number;
  lastStudied: string;
  color: string;
}

interface SubjectCardProps {
  subject: Subject;
  onStartQuiz: () => void;
}

const SubjectCard = ({ subject, onStartQuiz }: SubjectCardProps) => {
  const getMasteryColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-500';
  };

  const getMasteryProgressColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 hover:border-blue-200">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${subject.color}`}></div>
            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
              {subject.name}
            </h3>
          </div>
          <Button
            onClick={onStartQuiz}
            size="sm"
            variant="ghost"
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <FileText className="h-4 w-4" />
              <span>{subject.documentCount} docs</span>
            </div>
            <div className="flex items-center space-x-1">
              <Target className="h-4 w-4" />
              <span>{subject.questionCount} questions</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Mastery</span>
              <span className={`text-sm font-bold ${getMasteryColor(subject.masteryScore)}`}>
                {subject.masteryScore}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${getMasteryProgressColor(subject.masteryScore)}`}
                style={{ width: `${subject.masteryScore}%` }}
              ></div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <Calendar className="h-3 w-3" />
              <span>Last studied {subject.lastStudied}</span>
            </div>
          </div>
        </div>

        <Button
          onClick={onStartQuiz}
          className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          Start Quiz
        </Button>
      </CardContent>
    </Card>
  );
};

export default SubjectCard;
