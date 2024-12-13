import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/rpc';
import { InferResponseType } from 'hono';

interface UseGetProjectAnalyticsProps {
  projectId: string;
}

export type ProjectAnalyticsResponseType = InferResponseType<
  (typeof client.api.projects)[':projectId']['analytics']['$get'],
  200
>;

// hook to return the current user
export const useGetProjectAnalytics = ({
  projectId,
}: UseGetProjectAnalyticsProps) => {
  const query = useQuery({
    queryKey: ['project-analytics', projectId],
    queryFn: async () => {
      const response = await client.api.projects[':projectId'].analytics.$get({
        param: { projectId },
      });
      if (!response.ok) {
        throw new Error('Failed To Fetch Project analytics');
      }
      // returns the current user
      const { data } = await response.json();
      return data;
    },
  });
  return query;
};
