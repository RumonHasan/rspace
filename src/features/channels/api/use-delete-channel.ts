import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';
import { toast } from 'sonner';
import { client } from '@/lib/rpc';

// checks through proper type for request and response
type ResponseType = InferResponseType<
  (typeof client.api.discussions)[':channelId']['$delete'],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.discussions)[':channelId']['$delete']
>;

export const useDeleteChannel = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (param) => {
      const response = await client.api.discussions[':channelId']['$delete'](
        param
      );
      if (!response.ok) {
        throw new Error('Failed To Delete Channel');
      }
      return await response.json();
    },
    onSuccess: () => {
      toast.success('Channel deleted');
      queryClient.invalidateQueries({ queryKey: ['workspaces'] }); // updating that specific workspaces
      queryClient.invalidateQueries({ queryKey: ['channels'] }); // refetch the channels
      queryClient.invalidateQueries({ queryKey: ['chats'] }); // refetch the chats
    },
    onError: () => {
      toast.error('Failed To Delete Channel');
    },
  });
  return mutation;
};
