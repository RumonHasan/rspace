import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/rpc';

interface UseGetAllNotesProps {
  workspaceId: string;
}

// hook to return the current user
export const useGetAllNotes = ({ workspaceId }: UseGetAllNotesProps) => {
  const query = useQuery({
    queryKey: ['notes', workspaceId],
    queryFn: async () => {
      const response = await client.api.notes.$get({
        query: { workspaceId },
      });
      if (!response.ok) {
        throw new Error('Failed To Fetch Notes Within This Workspace');
      }
      // returns the current user
      const { data } = await response.json();
      return data;
    },
  });
  return query;
};
