import { useState } from 'react';

import { PencilIcon, XIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';

import { Task } from '../types';
import { useUpdateTask } from '../api/use-update-task';

interface TaskDescriptionProps {
  task: Task;
}

export const TaskDescription = ({ task }: TaskDescriptionProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(task.description);

  const { mutate, isPending } = useUpdateTask();

  // saving the updating edit function
  const handleSave = () => {
    mutate(
      {
        json: { description: value },
        param: { taskId: task.$id },
      },
      {
        onSuccess: () => {
          setIsEditing(false);
        },
      }
    );
  };

  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-center justify-between">
        <p className="text-lg font-semibold">Overview</p>
        <Button
          size={'sm'}
          variant={'secondary'}
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? (
            <XIcon className="size-4 mr-2" />
          ) : (
            <PencilIcon className="size-4 mr-2" />
          )}

          {isEditing ? 'Cancel' : 'Edit'}
        </Button>
      </div>
      <Separator className="my-4" />

      {isEditing ? (
        <div className="flex flex-col gap-y-4">
          <Textarea
            placeholder="Add a description"
            value={value}
            defaultValue={value}
            rows={7}
            onChange={(e) => setValue(e.target.value)}
            disabled={isPending}
          />
          <Button
            size={'sm'}
            className="w-fit ml-auto"
            onClick={handleSave}
            disabled={isPending}
          >
            {isPending ? 'Saving...' : 'Saving Changes'}
          </Button>
        </div>
      ) : (
        <div>
          {task.description || (
            <span className="text-muted-foreground">No Description Found</span>
          )}
        </div>
      )}
    </div>
  );
};
