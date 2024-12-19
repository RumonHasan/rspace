import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';
import { toast } from 'sonner';

import { client } from '@/lib/rpc';

// checks through proper type for request and response
type ResponseType = InferResponseType<
  (typeof client.api.discussions)[':channelId']['$patch'],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.discussions)[':channelId']['$patch']
>;

export const useUpdateChannel = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json, param }) => {
      // params contain the channel id and json has the updated data
      const response = await client.api.discussions[':channelId']['$patch']({
        json,
        param,
      });
      if (!response.ok) {
        throw new Error('Failed To Update Channel');
      }
      return await response.json();
    },
    onSuccess: () => {
      toast.success('Channel Updated');
      queryClient.invalidateQueries({ queryKey: ['channels'] });
    },
    onError: () => {
      toast.error('Failed To Update Channel');
    },
  });
  return mutation;
};
