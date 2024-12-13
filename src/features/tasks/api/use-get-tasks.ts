import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/rpc';
import { TaskStatus } from '../types';

interface UseGetTasksProps {
  workspaceId: string;
  projectId?: string | null;
  assigneeId?: string | null;
  status?: TaskStatus | null;
  dueDate?: string | null;
  search?: string | null;
  projectIdPresentInTask?: string | null;
}

export const useGetTasks = ({
  workspaceId,
  projectId,
  status,
  assigneeId,
  dueDate,
  search,
  projectIdPresentInTask,
}: UseGetTasksProps) => {
  const query = useQuery({
    queryKey: [
      'tasks',
      workspaceId,
      projectId,
      status,
      search,
      assigneeId,
      dueDate,
      projectIdPresentInTask,
    ],
    queryFn: async () => {
      const response = await client.api.tasks.$get({
        query: {
          workspaceId,
          projectId: projectId ?? undefined,
          status: status ?? undefined,
          assigneeId: assigneeId ?? undefined,
          dueDate: dueDate ?? undefined,
          search: search ?? undefined,
          projectIdPresentInTask: projectIdPresentInTask ?? undefined,
        },
      });

      if (!response.ok) {
        throw new Error('Failed To Fetch Tasks');
      }

      const { data } = await response.json();
      return data;
    },
    // for returning a placeholder of empty task set if there is not tasks available
    placeholderData: {
      documents: [],
      total: 0,
    },
    retry: false,
    staleTime: 30 * 1000, // 30 seconds
  });
  return query;
};