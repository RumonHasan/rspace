import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/rpc';

interface UseGetSearchBarTasksProps {
  workspaceId: string;
}

export const useGetSearchBarTasks = ({
  workspaceId,
}: UseGetSearchBarTasksProps) => {
  const query = useQuery({
    queryKey: ['search-bar-tasks', workspaceId],
    queryFn: async () => {
      if (!workspaceId) {
        throw new Error('workspace Id is undefined');
      }
      const response = await client.api.tasks['search-bar']['tasks'].$get({
        query: {
          workspaceId: workspaceId,
        },
      });
      if (!response.ok) {
        throw new Error('Failed To Fetch Search bar tasks');
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
