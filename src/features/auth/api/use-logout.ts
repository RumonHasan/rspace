import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferResponseType } from 'hono';
import { toast } from 'sonner';

import { client } from '@/lib/rpc';

// checks through proper type for request and response
type ResponseType = InferResponseType<(typeof client.api.auth.logout)['$post']>;

export const useLogout = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<ResponseType, Error>({
    mutationFn: async () => {
      const response = await client.api.auth.logout['$post']();
      if (!response.ok) {
        throw new Error('Something Went Wrong');
      }
      return await response.json();
    },
    // revalidating by forcing a cleanup of the current user
    onSuccess: () => {
      // Clear cache before navigation
      queryClient.clear();
      toast.success('Logged Out');
      // Use hard navigation - this is the most reliable approach
      window.location.href = '/';
      queryClient.invalidateQueries();
    },
    onError: () => {
      toast.error('Failed to log out');
    },
  });
  return mutation;
};
