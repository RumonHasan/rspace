import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';
import { toast } from 'sonner';
import { client } from '@/lib/rpc';

// checks through proper type for request and response
type ResponseType = InferResponseType<
  (typeof client.api.notes)[':noteId']['$delete'],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.notes)[':noteId']['$delete']
>;

export const useDeleteNote = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ param }) => {
      const response = await client.api.notes[':noteId']['$delete']({
        param,
      });
      if (!response.ok) {
        throw new Error('Failed To Delete The Note');
      }
      return await response.json();
    },
    onSuccess: ({ data }) => {
      toast.success('Note has been deleted');
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['notes', data.$id] }); // deleting the note and invalidating all the other in the collection
    },
    onError: () => {
      toast.success('Failed To Delete The Note');
    },
  });
  return mutation;
};
