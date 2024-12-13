import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/rpc';
// hook to return the current user
export const useCurrent = () => {
  const query = useQuery({
    queryKey: ['current'],
    queryFn: async () => {
      const response = await client.api.auth.current.$get();
      if (!response.ok) {
        return null;
      }
      // returns the current user
      const { data } = await response.json();
      return data;
    },
  });
  return query;
};
