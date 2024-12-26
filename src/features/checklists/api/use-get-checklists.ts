import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/rpc';

interface UseGetChecklistsProps {
  workspaceId: string;
  taskId: string;
}

// hook to return the current user
export const useGetChecklists = ({
  workspaceId,
  taskId,
}: UseGetChecklistsProps) => {
  const query = useQuery({
    queryKey: ['checklists', workspaceId, taskId],
    queryFn: async () => {
      const response = await client.api.checklists.$get({
        query: { workspaceId, taskId },
      });
      if (!response.ok) {
        throw new Error('Failed To Fetch Checlists');
      }
      // returns the current user
      const { data } = await response.json();
      return data;
    },
  });
  return query;
};
