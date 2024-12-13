'use client';
import { useGetProjects } from '@/features/projects/api/use-get-projects';
import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id';
import { RiAddCircleFill } from 'react-icons/ri';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useCreateProjectsModal } from '@/features/projects/hooks/use-create-projects-modal';
import { ProjectAvatar } from '@/features/projects/components/projects-avatar';

export const Projects = () => {
  const workspaceId = useWorkspaceId();
  const { data } = useGetProjects({
    workspaceId,
  });
  const pathName = usePathname(); // current path name
  const { open } = useCreateProjectsModal();

  return (
    <div className="flex flex-col gap-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs text-neutral-500">Projects</p>
        <RiAddCircleFill
          onClick={() => {
            open();
          }}
          className="size-5 text-neutral-500 cursor-pointer hover:opacity-75 transition"
        />
      </div>
      <div>
        {data?.documents.map((project) => {
          const href = `/workspaces/${workspaceId}/projects/${project.$id}`;
          const isActive = pathName === href;
          return (
            <Link href={href} key={project.$id}>
              <div
                className={cn(
                  'flex items-center gap-2.5 p-2.5 rounded-md hover:opacity-75 transition cursor-pointer text-neutral-500',
                  isActive &&
                    'bg-white shadow-sm hover:opacity-100 text-primary'
                )}
              >
                <ProjectAvatar image={project.imageUrl} name={project.name} />
                <span className="truncate">{project.name}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
