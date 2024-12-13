import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/rpc';

interface UseGetCommentsProps {
  workspaceId: string;
  taskId: string;
}

// hook to return the current user
export const useGetComments = ({
  workspaceId,
  taskId,
}: UseGetCommentsProps) => {
  const query = useQuery({
    queryKey: ['comments', workspaceId, taskId],
    queryFn: async () => {
      const response = await client.api.comments.$get({
        query: { workspaceId, taskId },
      });
      if (!response.ok) {
        throw new Error('Failed To Fetch Comments');
      }
      // returns the current user
      const { data } = await response.json();
      return data;
    },
  });
  return query;
};
