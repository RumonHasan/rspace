'use client';
import { useParams } from 'next/navigation';
import { useGetNote } from '@/features/notes/api/useGetNote';
import { PageLoader } from '@/components/page-loader';

const NotesIdClientPage = () => {
  const params = useParams();
  const noteId = params.noteId as string;

  const { data: note, isLoading } = useGetNote({
    noteId,
  });

  if (isLoading) {
    return <PageLoader />;
  }

  if (!note) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Note not found</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{note.noteTitle}</h1>
          {note.noteDescription && (
            <p className="mt-2 text-muted-foreground">{note.noteDescription}</p>
          )}
        </div>

        <div className="border-t pt-4">
          <div className="prose max-w-none">{note.note}</div>
        </div>
      </div>
    </div>
  );
};

export default NotesIdClientPage;
