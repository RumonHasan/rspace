import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';
import { toast } from 'sonner';

import { client } from '@/lib/rpc';

// checks through proper type for request and response
type ResponseType = InferResponseType<
  (typeof client.api.rsearch)['$post'],
  200
>;
type RequestType = InferRequestType<(typeof client.api.rsearch)['$post']>;

export const usePostSearchQuery = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const response = await client.api.rsearch['$post']({ json });
      if (!response.ok) {
        throw new Error('Failed To Save Query');
      }
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['searchQueries'] });
    },
    onError: () => {
      toast.success('Failed To Save Search Query');
    },
  });
  return mutation;
};
