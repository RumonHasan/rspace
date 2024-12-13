import { useQueryState, parseAsBoolean } from 'nuqs';

export const useCreateChannelModal = () => {
  const [isOpen, setIsOpen] = useQueryState(
    'create-channel',
    parseAsBoolean.withDefault(false).withOptions({ clearOnDefault: true })
  );

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  return {
    isOpen,
    open,
    close,
    setIsOpen,
  };
};