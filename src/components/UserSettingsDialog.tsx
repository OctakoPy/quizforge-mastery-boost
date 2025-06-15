
import { useState } from 'react';
import { Settings, Sun, Moon, Monitor, Trash2, Mail, Lock, Bell } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface UserSettingsDialogProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const UserSettingsDialog = ({ trigger, open, onOpenChange }: UserSettingsDialogProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const { settings, updateSettings, isUpdating, deleteAllUserData, isDeletingData } = useUserSettings();
  const { user, updateEmail, updatePassword } = useAuth();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  const isControlled = open !== undefined && onOpenChange !== undefined;
  const dialogOpen = isControlled ? open : internalOpen;
  const setDialogOpen = isControlled ? onOpenChange : setInternalOpen;

  const handleOpen = (isOpen: boolean) => {
    setDialogOpen(isOpen);
    if (isOpen && user?.email) {
      setNewEmail(user.email);
    }
  };

  const handleThemeChange = async (newTheme: string) => {
    try {
      setTheme(newTheme);
      await updateSettings({ theme: newTheme });
      toast({
        title: "Theme updated",
        description: "Your theme preference has been saved."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update theme. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleEmailUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newEmail || newEmail === user?.email) {
      toast({
        title: "No changes",
        description: "Please enter a different email address.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await updateEmail(newEmail);
      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Email update requested",
          description: "Please check your new email address for a confirmation link."
        });
        setNewEmail('');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update email. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword || newPassword.length < 6) {
      toast({
        title: "Invalid password",
        description: "Password must be at least 6 characters long.",
        variant: "destructive"
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords are identical.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await updatePassword(newPassword);
      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Password updated",
          description: "Your password has been updated successfully."
        });
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update password. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleStudyRemindersToggle = async (enabled: boolean) => {
    try {
      await updateSettings({ study_reminders: enabled });
      toast({
        title: "Study reminders updated",
        description: enabled ? "Study reminders are now enabled." : "Study reminders are now disabled."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update study reminders. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteAllData = async () => {
    try {
      await deleteAllUserData();
      toast({
        title: "All data deleted",
        description: "All your subjects, documents, and quizzes have been permanently deleted."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete data. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Theme Settings */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Sun className="h-4 w-4" />
              <Label className="text-base font-medium">Theme</Label>
            </div>
            <RadioGroup
              value={theme}
              onValueChange={handleThemeChange}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="light" id="light" />
                <Label htmlFor="light" className="flex items-center space-x-1">
                  <Sun className="h-4 w-4" />
                  <span>Light</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dark" id="dark" />
                <Label htmlFor="dark" className="flex items-center space-x-1">
                  <Moon className="h-4 w-4" />
                  <span>Dark</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="system" id="system" />
                <Label htmlFor="system" className="flex items-center space-x-1">
                  <Monitor className="h-4 w-4" />
                  <span>System</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Email Settings */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4" />
              <Label className="text-base font-medium">Change Email Address</Label>
            </div>
            <form onSubmit={handleEmailUpdate} className="space-y-3">
              <div>
                <Label htmlFor="current-email" className="text-sm text-gray-600">Current Email</Label>
                <Input
                  id="current-email"
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-gray-50"
                />
              </div>
              <div>
                <Label htmlFor="new-email">New Email Address</Label>
                <Input
                  id="new-email"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Enter new email address"
                />
              </div>
              <Button type="submit" size="sm">
                Update Email
              </Button>
            </form>
          </div>

          {/* Password Settings */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Lock className="h-4 w-4" />
              <Label className="text-base font-medium">Change Password</Label>
            </div>
            <form onSubmit={handlePasswordUpdate} className="space-y-3">
              <div>
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
              </div>
              <div>
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                />
              </div>
              <Button type="submit" size="sm">
                Update Password
              </Button>
            </form>
          </div>

          {/* Study Reminders */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Bell className="h-4 w-4" />
              <Label className="text-base font-medium">Study Reminders</Label>
            </div>
            <div className="flex items-center space-x-3">
              <Switch
                id="study-reminders"
                checked={settings?.study_reminders || false}
                onCheckedChange={handleStudyRemindersToggle}
                disabled={isUpdating}
              />
              <Label htmlFor="study-reminders" className="text-sm">
                Send me email reminders if I miss a day of study
              </Label>
            </div>
          </div>

          {/* Delete All Data */}
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <Trash2 className="h-4 w-4 text-red-500" />
              <Label className="text-base font-medium text-red-700">Danger Zone</Label>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <h4 className="font-medium text-red-800 mb-2">Delete All Subjects and Quizzes</h4>
              <p className="text-sm text-red-600 mb-3">
                This will permanently delete all your subjects, documents, questions, and quiz history. This action cannot be undone.
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" disabled={isDeletingData}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    {isDeletingData ? 'Deleting...' : 'Delete All Data'}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete all your:
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Subjects</li>
                        <li>Documents</li>
                        <li>Questions</li>
                        <li>Quiz attempts and history</li>
                      </ul>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAllData}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Yes, delete everything
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserSettingsDialog;
