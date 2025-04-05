import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/rpc';

interface UseGetAiChatProps {
  aiChatResponseId: string;
}
// hook to return the details of a single ai chat response based on chat response id
export const useGetAiChat = ({ aiChatResponseId }: UseGetAiChatProps) => {
  const query = useQuery({
    queryKey: ['ai-chat', aiChatResponseId],
    queryFn: async () => {
      const response = await client.api.rsearch[':aiChatResponseId'].$get({
        param: { aiChatResponseId },
      });
      if (!response.ok) {
        throw new Error('Failed To Fetch ai chat response details');
      }
      const { data } = await response.json();
      return data;
    },
  });
  return query;
};
