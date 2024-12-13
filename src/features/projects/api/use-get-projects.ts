import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/rpc';

interface UseGetProjectsProps {
  workspaceId: string;
}

// hook to return the current user
export const useGetProjects = ({ workspaceId }: UseGetProjectsProps) => {
  const query = useQuery({
    queryKey: ['projects', workspaceId],
    queryFn: async () => {
      const response = await client.api.projects.$get({
        query: { workspaceId },
      });
      if (!response.ok) {
        throw new Error('Failed To Fetch Projects');
      }
      // returns the current user
      const { data } = await response.json();
      return data;
    },
  });
  return query;
};
