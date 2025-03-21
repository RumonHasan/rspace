import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

import { client } from '@/lib/rpc';

// checks through proper type for request and response
type ResponseType = InferResponseType<(typeof client.api.notes)['$post'], 200>;
type RequestType = InferRequestType<(typeof client.api.notes)['$post']>;

export const useCreateNote = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const response = await client.api.notes['$post']({ json });
      if (!response.ok) {
        throw new Error('Failed To Create Note');
      }
      return await response.json();
    },
    onSuccess: () => {
      toast.success('Note Created');
      router.refresh();
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
    onError: () => {
      toast.success('Failed To Create Note');
    },
  });
  return mutation;
};
