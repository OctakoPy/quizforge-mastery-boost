
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/Header';
import DocumentUpload from '@/components/DocumentUpload';
import DocumentManager from '@/components/DocumentManager';
import QuizInterface from '@/components/QuizInterface';
import AddSubjectDialog from '@/components/AddSubjectDialog';
import StatsOverview from '@/components/dashboard/StatsOverview';
import QuickActions from '@/components/dashboard/QuickActions';
import SubjectsGrid from '@/components/dashboard/SubjectsGrid';
import StatisticsDashboard from '@/components/StatisticsDashboard';
import MegaQuizSetup from '@/components/quiz/MegaQuizSetup';
import QuizSelection from '@/components/quiz/QuizSelection';
import { useSubjects } from '@/hooks/useSubjects';
import { useMegaQuiz } from '@/hooks/useMegaQuiz';

const Index = () => {
  const [activeView, setActiveView] = useState<'dashboard' | 'upload' | 'quiz' | 'documents' | 'statistics' | 'mega-quiz' | 'mega-quiz-setup' | 'quiz-selection'>('dashboard');
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [megaQuizOptions, setMegaQuizOptions] = useState<{ questionLimit?: number; shuffle: boolean } | null>(null);
  
  const { subjects, isLoading } = useSubjects();
  const { megaQuestions, isLoading: isMegaLoading } = useMegaQuiz(
    selectedSubject ? { subjectId: selectedSubject, ...megaQuizOptions } : undefined
  );

  const totalQuestions = subjects.reduce((sum, subject) => sum + (subject.questionCount || 0), 0);
  const totalDocuments = subjects.reduce((sum, subject) => sum + (subject.documentCount || 0), 0);

  const handleStartQuiz = (subjectId: string, documentId?: string) => {
    setSelectedSubject(subjectId);
    if (documentId) {
      // Start specific quiz directly
      setSelectedDocument(documentId);
      setActiveView('quiz');
    } else {
      // Show quiz selection if multiple quizzes exist
      const subject = subjects.find(s => s.id === subjectId);
      if (subject && subject.documentCount > 1) {
        setActiveView('quiz-selection');
      } else {
        setActiveView('quiz');
      }
    }
  };

  const handleQuizSelect = (documentId: string) => {
    setSelectedDocument(documentId);
    setActiveView('quiz');
  };

  const handleStartMegaQuiz = (subjectId: string) => {
    setSelectedSubject(subjectId);
    setActiveView('mega-quiz-setup');
  };

  const handleMegaQuizStart = (options: { questionLimit?: number; shuffle: boolean }) => {
    setMegaQuizOptions(options);
    setActiveView('mega-quiz');
  };

  const renderDashboard = () => (
    <div className="space-y-8">
      <StatsOverview subjects={subjects} />

      <QuickActions
        subjects={subjects}
        totalQuestions={totalQuestions}
        onUpload={() => setActiveView('upload')}
        onDocuments={() => setActiveView('documents')}
        onStatistics={() => setActiveView('statistics')}
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
          onStartMegaQuiz={handleStartMegaQuiz}
          onUpload={() => setActiveView('upload')}
        />
      </div>
    </div>
  );

  const selectedSubjectData = selectedSubject ? subjects.find(s => s.id === selectedSubject) : null;

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
        {activeView === 'statistics' && (
          <div>
            <div className="mb-6">
              <button
                onClick={() => setActiveView('dashboard')}
                className="text-blue-600 hover:text-blue-800 mb-4 flex items-center"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Statistics & Progress</h1>
              <p className="text-gray-600">Track your learning progress and performance across all subjects</p>
            </div>
            <StatisticsDashboard />
          </div>
        )}
        {activeView === 'quiz-selection' && selectedSubjectData && (
          <QuizSelection
            subject={selectedSubjectData}
            onBack={() => setActiveView('dashboard')}
            onQuizSelect={handleQuizSelect}
          />
        )}
        {activeView === 'mega-quiz-setup' && selectedSubjectData && (
          <MegaQuizSetup
            subject={selectedSubjectData}
            totalQuestions={selectedSubjectData.questionCount}
            onBack={() => setActiveView('dashboard')}
            onStart={handleMegaQuizStart}
          />
        )}
        {activeView === 'quiz' && (
          <QuizInterface
            subjects={subjects}
            selectedSubject={selectedSubject}
            selectedDocument={selectedDocument}
            onBack={() => setActiveView('dashboard')}
          />
        )}
        {activeView === 'mega-quiz' && selectedSubjectData && (
          <QuizInterface
            subjects={subjects}
            selectedSubject={selectedSubject}
            onBack={() => setActiveView('dashboard')}
            megaQuestions={megaQuestions}
            isMegaQuiz={true}
          />
        )}
      </main>
    </div>
  );
};

export default Index;
