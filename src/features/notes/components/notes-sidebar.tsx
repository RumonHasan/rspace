'use client';
import { useGetAllNotes } from '../api/useGetAllNotes';
import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id';
import { useDeleteNote } from '../api/useDeleteNote';
import { Note } from '../types';
import { NotebookIcon, DeleteIcon, PlusCircleIcon } from 'lucide-react';
import { PageLoader } from '@/components/page-loader';
import { cn } from '@/lib/utils';
import { useRouter, usePathname } from 'next/navigation';
import { useConfirm } from '@/hooks/use-confirm';
import { useCreateNoteModal } from '../hooks/use-create-note-modal';
import { Button } from '@/components/ui/button';

const NotesSidebar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const workspaceId = useWorkspaceId();
  const { data: notes, isLoading: isLoadingNotes } = useGetAllNotes({
    workspaceId,
  });
  const { mutate: deleteNote, isPending: isDeletingNote } = useDeleteNote();

  // dialogs
  const [DeleteNoteDialog, deleteNoteConfirmation] = useConfirm(
    'Delete Note',
    'This note will permanently deleted from this workspace',
    'destructive'
  );
  const { open: openCreateNoteModal } = useCreateNoteModal();

  // Extract the note ID from the pathname
  const currentNoteId = pathname.split('/').pop();

  // Check if we're already in a note view
  const isInNotesView = pathname.includes('/notes/');

  // Function to handle note selection
  const handleSelectNote = (note: Note) => {
    // Navigate to the note page while preserving workspace context
    router.push(`/workspaces/${workspaceId}/notes/${note.$id}`);
  };

  const handleDeleteNote = async (noteId: string) => {
    const ok = await deleteNoteConfirmation();
    if (!ok || !noteId) return;
    // function to delete note
    deleteNote(
      {
        param: {
          noteId,
        },
      },
      {
        onSuccess: (response) => {
          if (!response.data) {
            return;
          }
          const deletedNoteId = response.data.$id;
          router.refresh();
          // jumping to the first note after deletion
          const remainingNotes = notes?.documents.filter(
            (note) => note.$id !== deletedNoteId
          );
          const path = `/workspaces/${workspaceId}/notes`;
          if (remainingNotes?.length) {
            // if there are notes then jump to the first one else jump to general notes
            router.push(`${path}/${remainingNotes[0].$id}`);
          } else {
            router.push(path);
          }
        },
        onError: (errorData) => {
          throw errorData;
        },
      }
    );
  };

  if (isLoadingNotes) {
    return <PageLoader />;
  }

  if (notes?.documents.length === 0) {
    return (
      <div className="p-4 flex justify-between items-center">
        <p className="text-sm text-muted-foreground">No notes available </p>
        <div>
          <Button
            onClick={() => openCreateNoteModal()}
            className="hover:bg-muted transition-all duration-200 hover:scale-105 p-2 rounded-full"
            variant="ghost"
          >
            <PlusCircleIcon className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 flex flex-col gap-1">
      <DeleteNoteDialog />
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">Create New Note</p>
        <Button
          onClick={() => openCreateNoteModal()}
          className="hover:bg-muted transition-all duration-200 hover:scale-105 p-2 rounded-full"
          variant="ghost"
        >
          <PlusCircleIcon className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
        </Button>
      </div>
      <div className="flex flex-col gap-1.5">
        {notes?.documents.map((note: Note) => {
          const isSelected = isInNotesView && currentNoteId === note.$id;

          return (
            <div
              key={note.$id}
              className={cn(
                'group relative flex items-center justify-between gap-2 p-1 w-full text-left rounded-md hover:bg-muted transition cursor-pointer',
                isSelected && 'border border-primary'
              )}
            >
              <div
                onClick={() => handleSelectNote(note)}
                className="flex items-center gap-2 flex-1"
              >
                <NotebookIcon className="w-4 h-4" />
                <p className="truncate">
                  {note.noteTitle.length > 20
                    ? note.noteTitle.slice(0, 20) + '...'
                    : note.noteTitle}
                </p>
              </div>

              <Button
                onClick={(e) => {
                  e.stopPropagation(); // prevent navigating when deleting
                  handleDeleteNote(note.$id);
                }}
                variant={'ghost'}
                disabled={isDeletingNote}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-100"
              >
                <DeleteIcon className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NotesSidebar;
