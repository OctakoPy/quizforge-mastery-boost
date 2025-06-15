
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
      questionCount 
    }: { 
      file: File; 
      subjectId: string; 
      questionCount: number;
    }) => {
      if (!user) throw new Error('User not authenticated');

      // Call the edge function to handle document upload and processing
      const { data, error } = await supabase.functions.invoke('process-document', {
        body: {
          fileName: file.name,
          fileSize: file.size,
          subjectId,
          questionCount,
          fileData: await file.arrayBuffer()
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate both documents and subjects queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
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
