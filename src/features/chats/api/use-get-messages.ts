import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/rpc';

interface UseGetMessagesProps {
  workspaceId: string;
  channelId: string;
}

// hook to return the current user
export const useGetMessages = ({
  workspaceId,
  channelId,
}: UseGetMessagesProps) => {
  const query = useQuery({
    queryKey: ['chats', workspaceId, channelId],
    queryFn: async () => {
      const response = await client.api.chats.$get({
        query: { workspaceId, channelId },
      });
      if (!response.ok) {
        throw new Error('Failed To Fetch Messages');
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
