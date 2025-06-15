
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import UserSettingsDialog from '@/components/UserSettingsDialog';

interface SettingsReminderProps {
  hasApiKey: boolean;
}

const SettingsReminder = ({ hasApiKey }: SettingsReminderProps) => {
  if (hasApiKey) return null;

  return (
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
  );
};

export default SettingsReminder;
