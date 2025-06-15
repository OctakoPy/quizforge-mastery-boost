
import { useState } from 'react';
import { Upload, FileText, BookOpen, Trophy, Plus, ArrowRight, BarChart3, Clock, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Header from '@/components/Header';
import SubjectCard from '@/components/SubjectCard';
import DocumentUpload from '@/components/DocumentUpload';
import QuizInterface from '@/components/QuizInterface';

interface Subject {
  id: string;
  name: string;
  documentCount: number;
  questionCount: number;
  masteryScore: number;
  lastStudied: string;
  color: string;
}

interface Document {
  id: string;
  name: string;
  subjectId: string;
  uploadDate: string;
  questionCount: number;
}

const Index = () => {
  const [activeView, setActiveView] = useState<'dashboard' | 'upload' | 'quiz'>('dashboard');
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  // Mock data for demonstration
  const [subjects] = useState<Subject[]>([
    {
      id: '1',
      name: 'Computer Science',
      documentCount: 5,
      questionCount: 47,
      masteryScore: 78,
      lastStudied: '2 days ago',
      color: 'bg-blue-500'
    },
    {
      id: '2', 
      name: 'Mathematics',
      documentCount: 3,
      questionCount: 32,
      masteryScore: 85,
      lastStudied: '1 day ago',
      color: 'bg-green-500'
    },
    {
      id: '3',
      name: 'Physics',
      documentCount: 4,
      questionCount: 38,
      masteryScore: 65,
      lastStudied: '3 days ago',
      color: 'bg-purple-500'
    }
  ]);

  const [documents] = useState<Document[]>([
    { id: '1', name: 'Data Structures.pdf', subjectId: '1', uploadDate: '2024-01-15', questionCount: 12 },
    { id: '2', name: 'Algorithms.pdf', subjectId: '1', uploadDate: '2024-01-14', questionCount: 15 },
    { id: '3', name: 'Calculus Notes.pdf', subjectId: '2', uploadDate: '2024-01-13', questionCount: 18 }
  ]);

  const totalQuestions = subjects.reduce((sum, subject) => sum + subject.questionCount, 0);
  const averageMastery = Math.round(subjects.reduce((sum, subject) => sum + subject.masteryScore, 0) / subjects.length);

  const renderDashboard = () => (
    <div className="space-y-8">
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
                <p className="text-2xl font-bold text-green-900">{documents.length}</p>
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
        >
          <BarChart3 className="mr-2 h-4 w-4" />
          Take Quiz
        </Button>
      </div>

      {/* Subjects Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Your Subjects</h2>
          <Button variant="outline" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Subject
          </Button>
        </div>
        
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
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="mr-2 h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {documents.slice(0, 3).map((doc) => {
              const subject = subjects.find(s => s.id === doc.subjectId);
              return (
                <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium text-gray-900">{doc.name}</p>
                      <p className="text-sm text-gray-500">{subject?.name} • {doc.questionCount} questions</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">{doc.uploadDate}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
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
