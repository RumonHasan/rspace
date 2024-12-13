import { Button } from '@/components/ui/button';
import { Task } from '../types';
import { PencilIcon } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Overview } from './overview-property';
import { MembersAvatar } from '@/features/members/components/members-avatar';
import { TaskDate } from './task-date';
import { Badge } from '@/components/ui/badge';
import { snakeCaseToTitleCase } from '@/lib/utils';
import { useEditTaskModal } from '../hooks/use-edit-task-modal';

interface TaskOverviewProps {
  task: Task;
}

export const TaskOverview = ({ task }: TaskOverviewProps) => {
  const { open } = useEditTaskModal();
  return (
    <div className="flex flex-col gap-y-4 col-span-1">
      <div className="bg-muted rounded-lg p-4">
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold">Overview</p>
          <Button
            size={'sm'}
            variant={'secondary'}
            onClick={() => open(task.$id)}
          >
            <PencilIcon className="size-4 mr-2" />
            Edit
          </Button>
        </div>
        <Separator className="my-4" />
        <div className="flex flex-col gap-y-4">
          <Overview label="Assignee">
            <MembersAvatar name={task.assignee.name} className="size-6" />
            <p className="text-sm font-medium">{task.assignee.name}</p>
          </Overview>
          <Overview label="Due Date">
            <TaskDate value={task.dueDate} className="text-sm font-medium" />
          </Overview>
          <Overview label="Status">
            <Badge variant={task.status}>
              {snakeCaseToTitleCase(task.status)}
            </Badge>
          </Overview>
        </div>
      </div>
    </div>
  );
};
