import { useMutation } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

import { client } from '@/lib/rpc';

type ResponseType = InferResponseType<
  (typeof client.api.auth.register)['$post']
>;
type RequestType = InferRequestType<(typeof client.api.auth.register)['$post']>;

// use register hook
export const useRegister = () => {
  const router = useRouter();
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const response = await client.api.auth.register.$post({ json });
      if (!response.ok) {
        throw new Error('Something Went Wrong');
      }
      return await response.json();
    },
    onSuccess: () => {
      router.refresh();
      toast.success('Registration Successfull');
    },
    onError: () => {
      toast.error('Failed to Register');
    },
  });
  return mutation;
};
