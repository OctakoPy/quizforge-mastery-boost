
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UserSettings {
  id: string;
  user_id: string;
  gemini_api_key: string | null;
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
    mutationFn: async (updates: { gemini_api_key?: string }) => {
      if (!user) {
        console.error('User not authenticated');
        throw new Error('User not authenticated');
      }

      console.log('Updating settings for user:', user.id, 'with updates:', updates);

      const { data, error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          ...updates,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error updating settings:', error);
        throw error;
      }
      
      console.log('Settings updated successfully:', data);
      return data;
    },
    onSuccess: () => {
      console.log('Settings update successful, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['user-settings'] });
    },
    onError: (error) => {
      console.error('Settings update failed:', error);
    }
  });

  return {
    settings,
    isLoading,
    error,
    updateSettings: updateSettings.mutateAsync,
    isUpdating: updateSettings.isPending
  };
};
