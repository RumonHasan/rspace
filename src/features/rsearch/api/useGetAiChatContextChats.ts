import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/rpc';

interface UseGetAiChatContextChatsProps {
  workspaceId: string;
  chatContextId: string;
}
// hook to return the current user
export const useGetAiChatContextChats = ({
  workspaceId,
  chatContextId,
}: UseGetAiChatContextChatsProps) => {
  const query = useQuery({
    queryKey: ['ai-chats-context', workspaceId, chatContextId],
    queryFn: async () => {
      const response = await client.api.rsearch['sonar-response'][
        'chat-context'
      ].$get({
        query: {
          workspaceId,
          chatContextId,
        },
      });
      if (!response.ok) {
        throw new Error('Failed To Fetch Chats under this topic');
      }
      // returns the latest searches with a limit of 6 searches
      const { data } = await response.json();
      return data;
    },
  });
  return query;
};
