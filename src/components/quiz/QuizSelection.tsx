
import { ArrowLeft, FileText, Target, Calendar, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useDocuments } from '@/hooks/useDocuments';
import { useQuestions } from '@/hooks/useQuestions';
import { useStatistics } from '@/hooks/useStatistics';
import { format, parseISO } from 'date-fns';

interface Subject {
  id: string;
  name: string;
  documentCount: number;
  questionCount: number;
  masteryScore: number;
  lastStudied: string;
  color: string;
}

interface QuizSelectionProps {
  subject: Subject;
  onBack: () => void;
  onQuizSelect: (documentId: string) => void;
}

const QuizSelection = ({ subject, onBack, onQuizSelect }: QuizSelectionProps) => {
  const { documents } = useDocuments();
  const { statistics } = useStatistics();
  
  // Get documents for this subject
  const subjectDocuments = documents.filter(doc => doc.subject_id === subject.id && doc.processed);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Button onClick={onBack} variant="ghost" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Choose a Quiz</h1>
        <p className="text-gray-600">Select which quiz you'd like to take from {subject.name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {subjectDocuments.map((document) => (
          <QuizCard
            key={document.id}
            document={document}
            statistics={statistics}
            onSelect={() => onQuizSelect(document.id)}
          />
        ))}
      </div>
    </div>
  );
};

interface QuizCardProps {
  document: any;
  statistics: any;
  onSelect: () => void;
}

const QuizCard = ({ document, statistics, onSelect }: QuizCardProps) => {
  const { questions } = useQuestions(undefined, document.id);
  
  // Find quiz statistics for this specific document
  const quizStats = statistics?.quizStatistics?.find(
    (quiz: any) => quiz.quizId === document.id
  );

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

  const formatLastStudied = (dateString: string | null) => {
    if (!dateString) return 'Never';
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy');
    } catch {
      return 'Never';
    }
  };
  
  return (
    <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 hover:border-blue-200 cursor-pointer">
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="mr-2 h-5 w-5 text-blue-600" />
          {document.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Target className="h-4 w-4 text-gray-600" />
            <span className="text-gray-600">{questions.length} questions</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-600" />
            <span className="text-gray-600 text-xs">
              {formatLastStudied(quizStats?.lastAttempted)}
            </span>
          </div>
        </div>

        {quizStats && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Trophy className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium text-gray-700">Mastery</span>
              </div>
              <span className={`text-sm font-bold ${getMasteryColor(quizStats.averageScore)}`}>
                {quizStats.averageScore}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${getMasteryProgressColor(quizStats.averageScore)}`}
                style={{ width: `${quizStats.averageScore}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Best: {quizStats.bestScore}%</span>
              <span>{quizStats.totalAttempts} attempts</span>
            </div>
          </div>
        )}

        {!quizStats && (
          <div className="text-center py-2">
            <span className="text-sm text-gray-500">No attempts yet</span>
          </div>
        )}
        
        <Button
          onClick={onSelect}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          Start This Quiz
        </Button>
      </CardContent>
    </Card>
  );
};

export default QuizSelection;
