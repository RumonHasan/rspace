import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/rpc';

interface UseGetChannelsProps {
  workspaceId: string;
}

// hook to return the current user
export const useGetChannels = ({ workspaceId }: UseGetChannelsProps) => {
  const query = useQuery({
    queryKey: ['channels', workspaceId],
    queryFn: async () => {
      const response = await client.api.discussions.$get({
        query: { workspaceId },
      });
      if (!response.ok) {
        throw new Error('Failed To Fetch Channels');
      }
      // returns the current user
      const { data } = await response.json();
      return data;
    },
    retry: false,
    placeholderData: { documents: [], total: 0 },
  });
  return query;
};
