import { BookOpen, Upload, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import SubjectCard from '@/components/SubjectCard';
import AddSubjectDialog from '@/components/AddSubjectDialog';

interface Subject {
  id: string;
  name: string;
  documentCount: number;
  questionCount: number;
  masteryScore: number;
  lastStudied: string;
  color: string;
}

interface SubjectsGridProps {
  subjects: Subject[];
  isLoading: boolean;
  onStartQuiz: (subjectId: string, documentId?: string) => void;
  onStartMegaQuiz: (subjectId: string) => void;
  onUpload: () => void;
}

const SubjectsGrid = ({ subjects, isLoading, onStartQuiz, onStartMegaQuiz, onUpload }: SubjectsGridProps) => {
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading your subjects...</p>
      </div>
    );
  }

  if (subjects.length === 0) {
    return (
      <Card className="border-2 border-dashed border-gray-300">
        <CardContent className="p-8 text-center">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No subjects yet</h3>
          <p className="text-gray-600 mb-4">
            Get started by creating your first subject or uploading a document.
          </p>
          <div className="flex gap-2 justify-center">
            <Button 
              onClick={onUpload}
              className="bg-gradient-to-r from-blue-600 to-blue-700"
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload Document
            </Button>
            <AddSubjectDialog />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {subjects.map((subject) => (
        <SubjectCard
          key={subject.id}
          subject={subject}
          onStartQuiz={(documentId) => onStartQuiz(subject.id, documentId)}
          onStartMegaQuiz={() => onStartMegaQuiz(subject.id)}
        />
      ))}
    </div>
  );
};

export default SubjectsGrid;
