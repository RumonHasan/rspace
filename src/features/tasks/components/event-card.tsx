import { Project } from '@/features/projects/types';
import { TaskStatus } from '../types';
import { cn } from '@/lib/utils';
import { MembersAvatar } from '@/features/members/components/members-avatar';
import { ProjectAvatar } from '@/features/projects/components/projects-avatar';
import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id';
import { useRouter } from 'next/navigation';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { User } from 'lucide-react';

interface EventCardProps {
  title: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  assignee: any;
  project: Project;
  status: TaskStatus;
  id: string;
}
const statusMapColor: Record<TaskStatus, string> = {
  [TaskStatus.BACKLOG]: 'border-l-pink-500',
  [TaskStatus.TODO]: 'border-l-red-500',
  [TaskStatus.IN_PROGRESS]: 'border-l-yellow-500',
  [TaskStatus.IN_REVIEW]: 'border-l-blue-500',
  [TaskStatus.DONE]: 'border-l-emerald-500',
};

export const EventCard = ({
  title,
  assignee,
  project,
  status,
  id,
}: EventCardProps) => {
  const workspaceId = useWorkspaceId();
  const router = useRouter();

  const onClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    router.push(`/workspaces/${workspaceId}/tasks/${id}`);
  };
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="px-2">
          <div
            onClick={onClick}
            className={cn(
              'p-1.5 text-xs bg-white text-primary border rounded-md border-l-4 flex flex-col gap-y-1.5 cursor-pointer hover:opacity-75 transition',
              statusMapColor[status]
            )}
          >
            <p>{title}</p>
            <div className="flex items-center gap-1">
              <MembersAvatar name={assignee?.name} />
              <div className="size-1 rounded-full bg-neutral-300" />
              <ProjectAvatar name={project?.name} image={project?.imageUrl} />
            </div>
          </div>
        </div>
      </TooltipTrigger>

      <TooltipContent className="bg-popover border shadow-md p-3 max-w-[200px]">
        <div className="space-y-2">
          {/* Project Name */}
          <p className="font-medium text-black text-sm truncate">
            {project?.name}
          </p>

          {/* Assignee */}
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-muted flex items-center justify-center">
              <User className="w-3 h-3 text-muted-foreground" />
            </div>
            <span className="text-xs text-muted-foreground">
              {assignee?.name}
            </span>
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
};
