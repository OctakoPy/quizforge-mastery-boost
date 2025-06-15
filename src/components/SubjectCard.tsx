
import { ArrowRight, Trash2, Play } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useSubjects } from '@/hooks/useSubjects';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

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
  onStartQuiz: (documentId?: string) => void;
  onStartMegaQuiz?: () => void;
}

const SubjectCard = ({ subject, onStartQuiz, onStartMegaQuiz }: SubjectCardProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { deleteSubject } = useSubjects();
  const { toast } = useToast();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteSubject(subject.id);
      toast({
        title: "Subject deleted",
        description: `"${subject.name}" and all its quizzes have been removed.`
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete subject. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

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
            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors text-lg">
              {subject.name}
            </h3>
          </div>
          <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Subject</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{subject.name}"? This will permanently remove the subject and all its quizzes, questions, and quiz attempts. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <div className="space-y-4">
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-1">
              {subject.documentCount} {subject.documentCount === 1 ? 'Quiz' : 'Quizzes'}
            </div>
            <div>
              <div className="flex items-center justify-center mb-2">
                <span className={`text-2xl font-bold ${getMasteryColor(subject.masteryScore)}`}>
                  {subject.masteryScore}%
                </span>
              </div>
              <div className="text-sm text-gray-600 mb-2">Overall Mastery</div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${getMasteryProgressColor(subject.masteryScore)}`}
                  style={{ width: `${subject.masteryScore}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex space-x-2 mt-6">
          {subject.documentCount > 0 ? (
            <>
              <Button
                onClick={() => onStartQuiz()}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <ArrowRight className="mr-2 h-4 w-4" />
                Choose Quiz
              </Button>
              
              {subject.documentCount > 1 && (
                <Button
                  onClick={onStartMegaQuiz}
                  variant="outline"
                  className="flex-1"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Mega Quiz
                </Button>
              )}
            </>
          ) : (
            <Button
              disabled
              className="flex-1 bg-gray-400"
            >
              <ArrowRight className="mr-2 h-4 w-4" />
              No Quizzes
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SubjectCard;
