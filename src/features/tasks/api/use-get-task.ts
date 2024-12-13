import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/rpc';

interface UseGetTaskProps {
  taskId: string;
}

// hook to return the current user
export const useGetTask = ({ taskId }: UseGetTaskProps) => {
  const query = useQuery({
    queryKey: ['task', taskId],
    queryFn: async () => {
      const response = await client.api.tasks[':taskId'].$get({
        param: { taskId },
      });
      if (!response.ok) {
        throw new Error('Failed To Fetch Task');
      }
      const { data } = await response.json();
      return data;
    },
  });
  return query;
};
