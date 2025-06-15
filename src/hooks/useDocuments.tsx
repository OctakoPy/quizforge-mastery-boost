
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Document {
  id: string;
  name: string;
  user_id: string;
  subject_id: string;
  file_size: number;
  upload_date: string;
  processed: boolean;
  file_path: string;
  text_content: string | null;
}

export const useDocuments = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const documentsQuery = useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .order('upload_date', { ascending: false });

      if (error) throw error;
      return data as Document[];
    },
    enabled: !!user
  });

  const uploadDocument = useMutation({
    mutationFn: async ({ 
      file, 
      subjectId, 
      questions,
      title
    }: { 
      file: File; 
      subjectId: string; 
      questions: any[];
      title: string;
    }) => {
      if (!user) throw new Error('User not authenticated');

      // Create document record
      const { data: document, error: docError } = await supabase
        .from('documents')
        .insert({
          name: title,
          user_id: user.id,
          subject_id: subjectId,
          file_size: file.size,
          processed: true,
          file_path: `quizzes/${user.id}/${Date.now()}_${file.name}`,
          text_content: await file.text()
        })
        .select()
        .single();

      if (docError) throw docError;

      // Insert all questions
      const questionsToInsert = questions.map(q => ({
        question: q.question,
        options: q.options,
        correct_answer: q.correct_answer,
        subject_id: subjectId,
        document_id: document.id,
        user_id: user.id
      }));

      const { error: questionsError } = await supabase
        .from('questions')
        .insert(questionsToInsert);

      if (questionsError) throw questionsError;

      return document;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      queryClient.invalidateQueries({ queryKey: ['questions'] });
    }
  });

  const deleteDocument = useMutation({
    mutationFn: async (documentId: string) => {
      if (!user) throw new Error('User not authenticated');

      // First delete all questions associated with this document
      const { error: questionsError } = await supabase
        .from('questions')
        .delete()
        .eq('document_id', documentId)
        .eq('user_id', user.id);

      if (questionsError) throw questionsError;

      // Then delete the document itself
      const { error: documentError } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId)
        .eq('user_id', user.id);

      if (documentError) throw documentError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      queryClient.invalidateQueries({ queryKey: ['questions'] });
    }
  });

  return {
    documents: documentsQuery.data || [],
    isLoading: documentsQuery.isLoading,
    uploadDocument: uploadDocument.mutateAsync,
    isUploading: uploadDocument.isPending,
    deleteDocument: deleteDocument.mutateAsync,
    isDeleting: deleteDocument.isPending
  };
};
