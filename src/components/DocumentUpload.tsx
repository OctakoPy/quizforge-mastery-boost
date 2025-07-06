
import { useState } from 'react';
import { Upload, FileText, ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import AddSubjectDialog from '@/components/AddSubjectDialog';
import { useDocuments } from '@/hooks/useDocuments';
import { useToast } from '@/hooks/use-toast';

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
  
  const { uploadDocument, isUploading } = useDocuments();
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/plain') {
      setSelectedFile(file);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please select a text (.txt) file.",
        variant: "destructive"
      });
    }
  };

  const handleSubjectCreated = () => {
    setSelectedSubject('');
  };

  const parseQuizFile = async (file: File): Promise<{ questions: any[], title: string }> => {
    const text = await file.text();
    const title = file.name.replace('.txt', '');
    
    // Split by /// markers to get question blocks
    const questionBlocks = text.split('///').filter(block => block.trim());
    
    const questions = questionBlocks.map((block, index) => {
      const lines = block.trim().split('\n').filter(line => line.trim());
      
      let question = '';
      let options: string[] = [];
      let correctAnswer = 0;
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        
        if (trimmedLine.startsWith('[Question:')) {
          question = trimmedLine.match(/\[Question:\s*"(.+)"\]/)?.[1] || '';
        } else if (trimmedLine.match(/^\[([ABCD]):\s*"(.+)"\]/)) {
          const match = trimmedLine.match(/^\[([ABCD]):\s*"(.+)"\]/);
          if (match) {
            options.push(match[2]);
          }
        } else if (trimmedLine.startsWith('[Solution:')) {
          const solutionMatch = trimmedLine.match(/\[Solution:\s*"([ABCD])"\]/);
          if (solutionMatch) {
            const solutionLetter = solutionMatch[1];
            correctAnswer = ['A', 'B', 'C', 'D'].indexOf(solutionLetter);
          }
        }
      }
      
      if (!question || options.length !== 4 || correctAnswer === -1) {
        throw new Error(`Invalid question format at question ${index + 1}. Please check the formatting.`);
      }
      
      return {
        question,
        options,
        correct_answer: correctAnswer
      };
    });
    
    if (questions.length === 0) {
      throw new Error('No valid questions found in the file. Please check the formatting.');
    }
    
    return { questions, title };
  };

  const handleGenerate = async () => {
    if (!selectedFile || !selectedSubject) return;

    try {
      const { questions, title } = await parseQuizFile(selectedFile);
      
      await uploadDocument({
        file: selectedFile,
        subjectId: selectedSubject,
        questions,
        title
      });

      toast({
        title: "Success!",
        description: `Quiz "${title}" uploaded with ${questions.length} questions.`
      });

      onBack();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to process quiz file. Please check the format.",
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Quiz</h1>
        <p className="text-gray-600">Upload your quiz files with questions in the specified format</p>
      </div>

      <div className="space-y-6">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <h3 className="font-medium text-blue-800 mb-2">Quiz Format Instructions</h3>
            <div className="text-sm text-blue-700 space-y-2">
              <p>Your text file should contain questions in this exact format:</p>
              <pre className="bg-white p-2 rounded text-xs overflow-x-auto">
{`///
[Question: "What is 10+10?"]
[A: "20"]
[B: "15"] 
[C: "10"]
[D: "90"]
[Solution: "A"]
///`}
              </pre>
              <p>• Each question must be wrapped with /// markers</p>
              <p>• Use exactly this format with square brackets and quotes</p>
              <p>• The filename will be used as the quiz title</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-4">
            <h3 className="font-medium text-purple-800 mb-2">How to Generate Questions</h3>
            <div className="text-sm text-purple-700 space-y-2">
              <ul className="list-disc list-inside space-y-1">
                <li>Copy the prompt using the button below</li>
                <li>Paste the prompt into ChatGPT and also upload the lecture slides file to ChatGPT</li>
                <li>Wait for the response in markdown format</li>
                <li>Copy the markdown content</li>
                <li>Paste it into a new <code>.txt</code> file</li>
                <li>Name the file appropriately</li>
                <li>Upload it using the uploader above</li>
              </ul>
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(
                `create 20 mcq questions based on the lecture, making sure to cover every aspect taught, do not repeat questions in similar ways, but aim to cover all material except practical concepts (focusing on the theoretical ones more)
                
                Format each question exactly like this:
                /// 
                [Question: "What is 10+10?"]
                [A: "20"]
                [B: "15"] 
                [C: "10"]
                [D: "90"]
                [Solution: "A"]
                ///
                
                And give all the questions in a markdown box for me to easily copy and paste out.`
                    );
                    toast({
                      title: "Prompt copied!",
                      description: "You can now paste it into ChatGPT.",
                    });
                  }}
                  variant="secondary"
                  className="mt-3"
                >
                  Copy Prompt
                </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Upload className="mr-2 h-5 w-5" />
              Select Quiz File
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
              <input
                type="file"
                accept=".txt"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  {selectedFile ? selectedFile.name : 'Choose a text file'}
                </p>
                <p className="text-sm text-gray-500">
                  Click to browse or drag and drop your .txt quiz file here
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
          </CardContent>
        </Card>

        <Button
          onClick={handleGenerate}
          disabled={!selectedFile || !selectedSubject || isUploading}
          className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 py-3"
        >
          {isUploading ? (
            <>
              <Sparkles className="mr-2 h-4 w-4 animate-spin" />
              Uploading Quiz...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Upload Quiz
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default DocumentUpload;
