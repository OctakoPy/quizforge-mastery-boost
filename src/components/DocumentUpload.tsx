
import { useState } from 'react';
import { Upload, FileText, ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import AddSubjectDialog from '@/components/AddSubjectDialog';
import { useDocuments } from '@/hooks/useDocuments';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useToast } from '@/hooks/use-toast';
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

interface DocumentUploadProps {
  subjects: Subject[];
  onBack: () => void;
}

const DocumentUpload = ({ subjects, onBack }: DocumentUploadProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [questionCount, setQuestionCount] = useState<string>('10');
  
  const { uploadDocument, isUploading } = useDocuments();
  const { settings } = useUserSettings();
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please select a PDF file.",
        variant: "destructive"
      });
    }
  };

  const handleSubjectCreated = () => {
    // Refresh subjects list by clearing selection
    setSelectedSubject('');
  };

  const handleGenerate = async () => {
    if (!selectedFile || !selectedSubject) return;
    
    if (!settings?.gemini_api_key) {
      toast({
        title: "Gemini API key required",
        description: "Please add your Gemini API key in settings to generate questions.",
        variant: "destructive"
      });
      return;
    }

    try {
      await uploadDocument({
        file: selectedFile,
        subjectId: selectedSubject,
        questionCount: parseInt(questionCount)
      });

      toast({
        title: "Success!",
        description: `Document processed and ${questionCount} questions generated successfully.`
      });

      onBack();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to process document. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Button
          onClick={onBack}
          variant="ghost"
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Document</h1>
        <p className="text-gray-600">Upload your study materials and generate AI-powered quiz questions</p>
      </div>

      {!settings?.gemini_api_key && (
        <Card className="mb-6 border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="flex-1">
                <p className="text-sm font-medium text-orange-800">
                  Gemini API key required for question generation
                </p>
                <p className="text-xs text-orange-600">
                  Please add your API key to start generating questions from documents.
                </p>
              </div>
              <UserSettingsDialog 
                trigger={
                  <Button size="sm" variant="outline">
                    Add API Key
                  </Button>
                }
              />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Upload className="mr-2 h-5 w-5" />
              Select Document
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  {selectedFile ? selectedFile.name : 'Choose a PDF file'}
                </p>
                <p className="text-sm text-gray-500">
                  Click to browse or drag and drop your PDF here
                </p>
              </label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="subject">Subject</Label>
              <div className="flex gap-2 mt-1">
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select a subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${subject.color}`}></div>
                          <span>{subject.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <AddSubjectDialog 
                  onSubjectCreated={handleSubjectCreated}
                  trigger={
                    <Button variant="outline" size="icon">
                      <Sparkles className="h-4 w-4" />
                    </Button>
                  }
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Select an existing subject or create a new one
              </p>
            </div>

            <div>
              <Label htmlFor="questions">Number of Questions</Label>
              <Select value={questionCount} onValueChange={setQuestionCount}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 questions</SelectItem>
                  <SelectItem value="10">10 questions</SelectItem>
                  <SelectItem value="15">15 questions</SelectItem>
                  <SelectItem value="20">20 questions</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Button
          onClick={handleGenerate}
          disabled={!selectedFile || !selectedSubject || isUploading || !settings?.gemini_api_key}
          className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 py-3"
        >
          {isUploading ? (
            <>
              <Sparkles className="mr-2 h-4 w-4 animate-spin" />
              Processing Document...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Quiz Questions
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default DocumentUpload;
