import { useMutation, useQueryClient } from '@tanstack/react-query';
import { client } from '@/lib/rpc';
import { InferRequestType, InferResponseType } from 'hono';
import { toast } from 'sonner';

// checks through proper type for request and response
type ResponseType = InferResponseType<
  (typeof client.api.rsearch)['sonar-response']['$post'],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.rsearch)['sonar-response']['$post']
>;

// custom hook to get ai response from teh initial search query
export const useGetSonarResponse = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const response = await client.api.rsearch['sonar-response']['$post']({
        json,
      });
      if (!response.ok) {
        throw new Error('Failed To Generate Sonar Response');
      }
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['search-queries'] }); // update the existing search queries
      queryClient.invalidateQueries({ queryKey: ['ai-chats'] }); // to regenerate the ai responses received
    },
    onError: () => {
      toast.error('Failed To Fetch Response');
    },
  });
  return mutation;
};
