
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSubjects } from '@/hooks/useSubjects';
import { useToast } from '@/hooks/use-toast';

const PREDEFINED_COLORS = [
  'bg-blue-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-red-500',
  'bg-yellow-500',
  'bg-indigo-500',
  'bg-pink-500',
  'bg-orange-500',
];

interface AddSubjectDialogProps {
  trigger?: React.ReactNode;
  onSubjectCreated?: (subjectId: string) => void;
}

const AddSubjectDialog = ({ trigger, onSubjectCreated }: AddSubjectDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PREDEFINED_COLORS[0]);
  const { createSubject, isCreating } = useSubjects();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a subject name.",
        variant: "destructive"
      });
      return;
    }

    try {
      await createSubject({ name: name.trim(), color: selectedColor });
      toast({
        title: "Success",
        description: "Subject created successfully!"
      });
      setOpen(false);
      setName('');
      setSelectedColor(PREDEFINED_COLORS[0]);
      if (onSubjectCreated) {
        // We'd need to get the created subject ID, but for now we'll just call the callback
        onSubjectCreated('');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create subject. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Subject
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Subject</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="subject-name">Subject Name</Label>
            <Input
              id="subject-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter subject name"
              className="mt-1"
            />
          </div>
          
          <div>
            <Label>Choose Color</Label>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {PREDEFINED_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`w-8 h-8 rounded-full ${color} ${
                    selectedColor === color 
                      ? 'ring-2 ring-gray-400 ring-offset-2' 
                      : ''
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isCreating || !name.trim()}
            >
              {isCreating ? 'Creating...' : 'Create Subject'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddSubjectDialog;
