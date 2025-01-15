import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';
import { toast } from 'sonner';

import { client } from '@/lib/rpc';

// checks through proper type for request and response
type ResponseType = InferResponseType<
  (typeof client.api.chats)['get-message']['$post'],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.chats)['get-message']['$post']
>;

export const useGetMessage = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const response = await client.api.chats['get-message']['$post']({
        json,
      });
      if (!response.ok) {
        throw new Error('Failed To Fetch Message');
      }
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['chat'],
      });
    },
    onError: () => {
      toast.error('Failed To Fetch Message');
    },
  });
  return mutation;
};
