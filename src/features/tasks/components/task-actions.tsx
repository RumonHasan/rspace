'use client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ExternalLinkIcon } from 'lucide-react';
import { PencilIcon, DeleteIcon } from 'lucide-react';

import { useDeleteTask } from '../api/use-delete-task';
import { useConfirm } from '@/hooks/use-confirm';
import { useRouter } from 'next/navigation';
import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id';
import { useEditTaskModal } from '../hooks/use-edit-task-modal';

interface TaskActionProps {
  id: string;
  projectId: string;
  children: React.ReactNode;
}

export const TaskActions = ({ id, projectId, children }: TaskActionProps) => {
  const workspaceId = useWorkspaceId();
  const { mutate: deleteTask, isPending: isDeletingTask } = useDeleteTask();
  const router = useRouter();
  const { open } = useEditTaskModal();

  const [DeleteTaskDialog, deleteTaskConfirm] = useConfirm(
    'Delete Task',
    'This task will be deleted permanently along with all its data including checklists, images and etc...',
    'destructive'
  );
  // deleting tasks
  const onDeleteTask = async () => {
    const ok = await deleteTaskConfirm();
    if (!ok) return;
    deleteTask(
      { param: { taskId: id } },
      {
        onSuccess: () => {
          setTimeout(() => {
            router.push(`/workspaces/${workspaceId}/tasks`);
          }, 100);
        },
      }
    );
  };

  // on open task
  const onOpenTask = () => {
    router.push(`/workspaces/${workspaceId}/tasks/${id}`);
  };
  // on open project
  const onOpenProject = () => {
    router.push(`/workspaces/${workspaceId}/projects/${projectId}`);
  };

  return (
    <div className="flex justify-end">
      <DeleteTaskDialog />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem
            onClick={onOpenTask}
            className="font-medium p-[10px]"
          >
            <ExternalLinkIcon className="size-4 mr-2 stroke-2" />
            Task Details
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-amber-700 focus:text-amber-700 font-medium p-[10px]"
            onClick={onOpenProject}
          >
            <ExternalLinkIcon className="size-4 mr-2 stroke-2" />
            Open Project
          </DropdownMenuItem>
          <DropdownMenuItem
            className="font-medium p-[10px]"
            onClick={() => open(id)}
          >
            <PencilIcon className="size-4 mr-2 stroke-2" />
            Edit Task
          </DropdownMenuItem>
          <DropdownMenuItem
            className="font-medium p-[10px]"
            onClick={onDeleteTask}
            disabled={isDeletingTask}
          >
            <DeleteIcon className="size-4 mr-2 stroke-2" />
            Delete Task
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
