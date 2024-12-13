import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/rpc';

interface UseGetProjectProps {
  projectId: string;
}

// hook to return the current user
export const useGetProject = ({ projectId }: UseGetProjectProps) => {
  const query = useQuery({
    queryKey: ['projects', projectId],
    queryFn: async () => {
      const response = await client.api.projects[':projectId'].$get({
        param: { projectId },
      });
      if (!response.ok) {
        throw new Error('Failed To Fetch Project');
      }
      // returns the current user
      const { data } = await response.json();
      return data;
    },
  });
  return query;
};
