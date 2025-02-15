import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';
import { toast } from 'sonner';

import { client } from '@/lib/rpc';

// checks through proper type for request and response
type ResponseType = InferResponseType<
  (typeof client.api.discussions)['create-channel']['$post'],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.discussions)['create-channel']['$post']
>;

export const useCreateChannel = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const response = await client.api.discussions['create-channel']['$post']({
        json,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }
      return await response.json();
    },
    onSuccess: () => {
      toast.success('Channel has been added');
      queryClient.invalidateQueries({ queryKey: ['channels'] });
    },
    onError: (errorData) => {
      const errorMessage = errorData.message || 'Failed to create channel';
      toast.error(errorMessage);
    },
  });
  return mutation;
};
