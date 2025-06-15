
import { useState } from 'react';
import { Upload, FileText, BookOpen, Trophy, Plus, ArrowRight, BarChart3, Clock, Target, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/Header';
import SubjectCard from '@/components/SubjectCard';
import DocumentUpload from '@/components/DocumentUpload';
import QuizInterface from '@/components/QuizInterface';
import AddSubjectDialog from '@/components/AddSubjectDialog';
import UserSettingsDialog from '@/components/UserSettingsDialog';
import { useSubjects } from '@/hooks/useSubjects';
import { useUserSettings } from '@/hooks/useUserSettings';

const Index = () => {
  const [activeView, setActiveView] = useState<'dashboard' | 'upload' | 'quiz'>('dashboard');
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  
  const { subjects, isLoading } = useSubjects();
  const { settings } = useUserSettings();

  // Calculate stats from real data
  const totalQuestions = subjects.reduce((sum, subject) => sum + (subject.questionCount || 0), 0);
  const totalDocuments = subjects.reduce((sum, subject) => sum + (subject.documentCount || 0), 0);
  const averageMastery = subjects.length > 0 
    ? Math.round(subjects.reduce((sum, subject) => sum + (subject.masteryScore || 0), 0) / subjects.length)
    : 0;

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Settings reminder */}
      {!settings?.gemini_api_key && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-800">
                  Complete your setup to start generating questions
                </p>
                <p className="text-xs text-orange-600">
                  Add your Gemini API key to enable AI-powered question generation.
                </p>
              </div>
              <UserSettingsDialog 
                trigger={
                  <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                    <Settings className="mr-2 h-4 w-4" />
                    Add API Key
                  </Button>
                }
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Overview */}
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

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4">
        <Button 
          onClick={() => setActiveView('upload')}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
        >
          <Upload className="mr-2 h-4 w-4" />
          Upload Document
        </Button>
        <Button 
          variant="outline"
          onClick={() => setActiveView('quiz')}
          className="border-2 border-green-200 hover:bg-green-50"
          disabled={subjects.length === 0 || totalQuestions === 0}
        >
          <BarChart3 className="mr-2 h-4 w-4" />
          Take Quiz
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

      {/* Subjects Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Your Subjects</h2>
          <AddSubjectDialog />
        </div>
        
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your subjects...</p>
          </div>
        ) : subjects.length === 0 ? (
          <Card className="border-2 border-dashed border-gray-300">
            <CardContent className="p-8 text-center">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No subjects yet</h3>
              <p className="text-gray-600 mb-4">
                Get started by creating your first subject or uploading a document.
              </p>
              <div className="flex gap-2 justify-center">
                <Button 
                  onClick={() => setActiveView('upload')}
                  className="bg-gradient-to-r from-blue-600 to-blue-700"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Document
                </Button>
                <AddSubjectDialog />
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject) => (
              <SubjectCard
                key={subject.id}
                subject={subject}
                onStartQuiz={() => {
                  setSelectedSubject(subject.id);
                  setActiveView('quiz');
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity - Only show if there are subjects */}
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
