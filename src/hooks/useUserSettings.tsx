
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UserSettings {
  id: string;
  user_id: string;
  gemini_api_key: string | null;
  theme: string;
  study_reminders: boolean;
  created_at: string;
  updated_at: string;
}

export const useUserSettings = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: settings,
    isLoading,
    error
  } = useQuery({
    queryKey: ['user-settings', user?.id],
    queryFn: async () => {
      if (!user) return null;

      console.log('Fetching settings for user:', user.id);

      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        console.log('No settings found for user, returning null');
        return null;
      }
      
      if (error) {
        console.error('Error fetching settings:', error);
        throw error;
      }
      
      console.log('Settings fetched successfully:', data);
      return data;
    },
    enabled: !!user
  });

  const updateSettings = useMutation({
    mutationFn: async (updates: { 
      gemini_api_key?: string;
      theme?: string;
      study_reminders?: boolean;
    }) => {
      if (!user) {
        console.error('User not authenticated');
        throw new Error('User not authenticated');
      }

      console.log('Updating settings for user:', user.id, 'with updates:', updates);

      // Check if settings already exist
      const { data: existingSettings } = await supabase
        .from('user_settings')
        .select('id')
        .eq('user_id', user.id)
        .single();

      let result;
      if (existingSettings) {
        // Update existing record
        console.log('Updating existing settings record');
        const { data, error } = await supabase
          .from('user_settings')
          .update({
            ...updates,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
          .select()
          .single();
        
        result = { data, error };
      } else {
        // Insert new record
        console.log('Creating new settings record');
        const { data, error } = await supabase
          .from('user_settings')
          .insert({
            user_id: user.id,
            ...updates,
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
        
        result = { data, error };
      }

      if (result.error) {
        console.error('Error updating settings:', result.error);
        throw result.error;
      }
      
      console.log('Settings updated successfully:', result.data);
      return result.data;
    },
    onSuccess: () => {
      console.log('Settings update successful, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['user-settings'] });
    },
    onError: (error) => {
      console.error('Settings update failed:', error);
    }
  });

  const deleteAllUserData = useMutation({
    mutationFn: async () => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      console.log('Deleting all user data for user:', user.id);

      // Delete in order: quiz_attempts, questions, documents, subjects
      const { error: attemptsError } = await supabase
        .from('quiz_attempts')
        .delete()
        .eq('user_id', user.id);

      if (attemptsError) throw attemptsError;

      const { error: questionsError } = await supabase
        .from('questions')
        .delete()
        .eq('user_id', user.id);

      if (questionsError) throw questionsError;

      const { error: documentsError } = await supabase
        .from('documents')
        .delete()
        .eq('user_id', user.id);

      if (documentsError) throw documentsError;

      const { error: subjectsError } = await supabase
        .from('subjects')
        .delete()
        .eq('user_id', user.id);

      if (subjectsError) throw subjectsError;

      console.log('All user data deleted successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      queryClient.invalidateQueries({ queryKey: ['quiz-attempts'] });
    }
  });

  return {
    settings,
    isLoading,
    error,
    updateSettings: updateSettings.mutateAsync,
    isUpdating: updateSettings.isPending,
    deleteAllUserData: deleteAllUserData.mutateAsync,
    isDeletingData: deleteAllUserData.isPending
  };
};
