
import { useState } from 'react';
import { Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/Header';
import DocumentUpload from '@/components/DocumentUpload';
import DocumentManager from '@/components/DocumentManager';
import QuizInterface from '@/components/QuizInterface';
import AddSubjectDialog from '@/components/AddSubjectDialog';
import StatsOverview from '@/components/dashboard/StatsOverview';
import QuickActions from '@/components/dashboard/QuickActions';
import SubjectsGrid from '@/components/dashboard/SubjectsGrid';
import SettingsReminder from '@/components/dashboard/SettingsReminder';
import { useSubjects } from '@/hooks/useSubjects';
import { useUserSettings } from '@/hooks/useUserSettings';

const Index = () => {
  const [activeView, setActiveView] = useState<'dashboard' | 'upload' | 'quiz' | 'documents'>('dashboard');
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  
  const { subjects, isLoading } = useSubjects();
  const { settings } = useUserSettings();

  const totalQuestions = subjects.reduce((sum, subject) => sum + (subject.questionCount || 0), 0);
  const totalDocuments = subjects.reduce((sum, subject) => sum + (subject.documentCount || 0), 0);

  const handleStartQuiz = (subjectId: string) => {
    setSelectedSubject(subjectId);
    setActiveView('quiz');
  };

  const renderDashboard = () => (
    <div className="space-y-8">
      <SettingsReminder hasApiKey={!!settings?.gemini_api_key} />

      <StatsOverview subjects={subjects} />

      <QuickActions
        subjects={subjects}
        totalQuestions={totalQuestions}
        onUpload={() => setActiveView('upload')}
        onQuiz={() => setActiveView('quiz')}
        onDocuments={() => setActiveView('documents')}
      />

      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Your Subjects</h2>
          <AddSubjectDialog />
        </div>
        
        <SubjectsGrid
          subjects={subjects}
          isLoading={isLoading}
          onStartQuiz={handleStartQuiz}
          onUpload={() => setActiveView('upload')}
        />
      </div>

      {subjects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4 text-gray-500">
              <p>Activity tracking coming soon...</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {activeView === 'dashboard' && renderDashboard()}
        {activeView === 'upload' && (
          <DocumentUpload 
            subjects={subjects}
            onBack={() => setActiveView('dashboard')}
          />
        )}
        {activeView === 'documents' && (
          <DocumentManager
            onBack={() => setActiveView('dashboard')}
          />
        )}
        {activeView === 'quiz' && (
          <QuizInterface
            subjects={subjects}
            selectedSubject={selectedSubject}
            onBack={() => setActiveView('dashboard')}
          />
        )}
      </main>
    </div>
  );
};

export default Index;
