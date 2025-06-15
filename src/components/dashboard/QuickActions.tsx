
import { Upload, BarChart3, FolderOpen, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import UserSettingsDialog from '@/components/UserSettingsDialog';

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
}

const QuickActions = ({ subjects, totalQuestions, onUpload, onQuiz, onDocuments }: QuickActionsProps) => {
  return (
    <div className="flex flex-wrap gap-4">
      <Button 
        onClick={onUpload}
        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
      >
        <Upload className="mr-2 h-4 w-4" />
        Upload Document
      </Button>
      <Button 
        variant="outline"
        onClick={onQuiz}
        className="border-2 border-green-200 hover:bg-green-50"
        disabled={subjects.length === 0 || totalQuestions === 0}
      >
        <BarChart3 className="mr-2 h-4 w-4" />
        Take Quiz
      </Button>
      <Button 
        variant="outline"
        onClick={onDocuments}
        className="border-2 border-purple-200 hover:bg-purple-50"
      >
        <FolderOpen className="mr-2 h-4 w-4" />
        Manage Documents
      </Button>
      <UserSettingsDialog 
        trigger={
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        }
      />
    </div>
  );
};

export default QuickActions;
