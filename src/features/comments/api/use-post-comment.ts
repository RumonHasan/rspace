import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';
import { toast } from 'sonner';

import { client } from '@/lib/rpc';

// checks through proper type for request and response
type ResponseType = InferResponseType<
  (typeof client.api.comments)['$post'],
  200
>;
type RequestType = InferRequestType<(typeof client.api.comments)['$post']>;

export const useCreateComment = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ form }) => {
      const response = await client.api.comments['$post']({ form });
      if (!response.ok) {
        throw new Error('Failed To Create Comment');
      }
      return await response.json();
    },
    onSuccess: () => {
      toast.success('Comment has been added');
      queryClient.invalidateQueries({ queryKey: ['comments'] });
    },
    onError: () => {
      toast.success('Failed To Create Comment');
    },
  });
  return mutation;
};
