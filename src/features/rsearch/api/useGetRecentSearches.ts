import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/rpc';

interface UseGetRecentSearchQueriesProps {
  workspaceId: string;
}

// hook to return the current user
export const useGetRecentSearchQueries = ({
  workspaceId,
}: UseGetRecentSearchQueriesProps) => {
  const query = useQuery({
    queryKey: ['searchQueries', workspaceId],
    queryFn: async () => {
      const response = await client.api.rsearch.$get({
        query: { workspaceId },
      });
      if (!response.ok) {
        throw new Error('Failed To Fetch existing search queries');
      }
      // returns the latest searches with a limit of 6 searches
      const { data } = await response.json();
      return data;
    },
  });
  return query;
};
