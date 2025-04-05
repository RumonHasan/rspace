import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/rpc';

interface UseGetAiChatsProps {
  workspaceId: string;
  limit?: number;
}
// hook to return the current user
export const useGetAiChats = ({ workspaceId, limit }: UseGetAiChatsProps) => {
  const query = useQuery({
    queryKey: ['ai-chats', workspaceId],
    queryFn: async () => {
      const response = await client.api.rsearch['recent-searches'][
        'ai-chats'
      ].$get({
        query: {
          workspaceId,
          ...(limit !== undefined && { limit: limit.toString() }), // passing limit as string when its not undefined
        },
      });
      if (!response.ok) {
        throw new Error('Failed To Fetch ai chats');
      }
      // returns the latest searches with a limit of 6 searches
      const { data } = await response.json();
      return data;
    },
  });
  return query;
};
