'use client';
import { ResponsiveModal } from '@/components/responsive-modal';
import { useCreateNoteModal } from '../hooks/use-create-note-modal';
import CreateNoteFormWrapper from './createNoteFormWrapper';

export const CreateNoteModal = () => {
  const { isOpen, setIsOpen, close, noteId } = useCreateNoteModal();

  return (
    <ResponsiveModal open={isOpen} onOpenChange={setIsOpen}>
      <CreateNoteFormWrapper
        onCancel={close}
        noteId={noteId}
      ></CreateNoteFormWrapper>
    </ResponsiveModal>
  );
};
