
import { BookOpen, FileText, Target, Trophy } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface Subject {
  id: string;
  name: string;
  documentCount: number;
  questionCount: number;
  masteryScore: number;
  lastStudied: string;
  color: string;
}

interface StatsOverviewProps {
  subjects: Subject[];
}

const StatsOverview = ({ subjects }: StatsOverviewProps) => {
  const totalQuestions = subjects.reduce((sum, subject) => sum + (subject.questionCount || 0), 0);
  const totalDocuments = subjects.reduce((sum, subject) => sum + (subject.documentCount || 0), 0);
  const averageMastery = subjects.length > 0 
    ? Math.round(subjects.reduce((sum, subject) => sum + (subject.masteryScore || 0), 0) / subjects.length)
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-blue-600">Subjects</p>
              <p className="text-2xl font-bold text-blue-900">{subjects.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <FileText className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-600">Documents</p>
              <p className="text-2xl font-bold text-green-900">{totalDocuments}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <Target className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-sm font-medium text-purple-600">Questions</p>
              <p className="text-2xl font-bold text-purple-900">{totalQuestions}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <Trophy className="h-8 w-8 text-orange-600" />
            <div>
              <p className="text-sm font-medium text-orange-600">Avg. Mastery</p>
              <p className="text-2xl font-bold text-orange-900">{averageMastery}%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsOverview;
