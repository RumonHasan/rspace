import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/rpc';

interface UseGetSearchBarProjectsProps {
  workspaceId: string;
}

// hook to return the current user
export const useGetSearchBarProjects = ({
  workspaceId,
}: UseGetSearchBarProjectsProps) => {
  const query = useQuery({
    queryKey: ['search-bar-projects', workspaceId],
    queryFn: async () => {
      const response = await client.api.projects['search-bar']['projects'].$get(
        {
          query: { workspaceId },
        }
      );
      if (!response.ok) {
        throw new Error('Failed To Fetch the search bar projects ');
      }
      // returns the current user
      const { data } = await response.json();
      return data;
    },
  });
  return query;
};
