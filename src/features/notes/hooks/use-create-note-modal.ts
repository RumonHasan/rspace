import { useQueryState, parseAsBoolean, parseAsString } from 'nuqs';

export const useCreateNoteModal = () => {
  const [isOpen, setIsOpen] = useQueryState(
    'create-note',
    parseAsBoolean.withDefault(false).withOptions({ clearOnDefault: true })
  );

  const [noteId, setNoteId] = useQueryState(
    'note-id',
    parseAsString.withDefault('').withOptions({ clearOnDefault: true })
  );

  const open = (id?: string) => {
    setIsOpen(true);
    // if note id is present then add it to the state
    if (id) {
      setNoteId(id);
    }
  };

  const close = () => {
    setIsOpen(false);
    setNoteId('');
  };

  return {
    isOpen,
    noteId: noteId || undefined,
    open,
    close,
    setIsOpen,
  };
};
