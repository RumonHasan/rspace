import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/rpc';

interface UseGetNoteProps {
  noteId: string;
}

// hook to return the current user
export const useGetNote = ({ noteId }: UseGetNoteProps) => {
  const query = useQuery({
    queryKey: ['notes', noteId],
    queryFn: async () => {
      const response = await client.api.notes[':noteId'].$get({
        param: { noteId },
      });
      if (!response.ok) {
        throw new Error('Failed To Fetch Current Note Details');
      }
      // returns the current user
      const { data } = await response.json();
      return data;
    },
  });
  return query;
};
