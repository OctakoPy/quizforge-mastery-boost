
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

  return {
    uploadDocument: uploadDocument.mutateAsync,
    isUploading: uploadDocument.isPending
  };
};
