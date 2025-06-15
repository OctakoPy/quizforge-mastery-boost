
import { ArrowLeft, FileText, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDocuments } from '@/hooks/useDocuments';
import { useQuestions } from '@/hooks/useQuestions';

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
            onSelect={() => onQuizSelect(document.id)}
          />
        ))}
      </div>
    </div>
  );
};

interface QuizCardProps {
  document: any;
  onSelect: () => void;
}

const QuizCard = ({ document, onSelect }: QuizCardProps) => {
  const { questions } = useQuestions(undefined, document.id);
  
  return (
    <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 hover:border-blue-200 cursor-pointer">
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="mr-2 h-5 w-5 text-blue-600" />
          {document.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <Target className="h-4 w-4" />
            <span>{questions.length} questions</span>
          </div>
          <div className="text-xs text-gray-500">
            Uploaded {new Date(document.upload_date).toLocaleDateString()}
          </div>
        </div>
        
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
