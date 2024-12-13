import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';
import { toast } from 'sonner';

import { client } from '@/lib/rpc';

// checks through proper type for request and response
type ResponseType = InferResponseType<
  (typeof client.api.chats)['create-message']['$post'],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.chats)['create-message']['$post']
>;

export const useCreateMessage = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ form }) => {
      const response = await client.api.chats['create-message']['$post']({
        form,
      });
      if (!response.ok) {
        throw new Error('Failed To Message Message');
      }
      return await response.json();
    },
    onSuccess: () => {
      toast.success('Message has been added');
      queryClient.invalidateQueries({
        queryKey: ['chats'],
      });
    },
    onError: () => {
      toast.error('Failed To Send Message');
    },
  });
  return mutation;
};
