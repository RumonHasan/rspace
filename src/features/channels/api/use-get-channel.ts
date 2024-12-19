import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/rpc';
import { toast } from 'sonner';

interface UseGetChannelProps {
  channelId: string;
}

// hook to return the current user
export const useGetChannel = ({ channelId }: UseGetChannelProps) => {
  const query = useQuery({
    queryKey: ['channel', channelId],
    queryFn: async () => {
      const response = await client.api.discussions[':channelId'].$get({
        param: { channelId },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch channel');
      }
      // returns the current user
      const { data } = await response.json();
      if (!data) {
        toast('no Channel Data Available');
      }
      return data;
    },
  });
  return query;
};
