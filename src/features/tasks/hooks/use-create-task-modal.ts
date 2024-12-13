import { useQueryState, parseAsBoolean, parseAsString } from 'nuqs';
import { TaskStatus } from '../types';

export const useCreateTaskModal = () => {
  const [isOpen, setIsOpen] = useQueryState(
    'create-task',
    parseAsBoolean.withDefault(false).withOptions({ clearOnDefault: true })
  );

  // The parser needs to match the type we want to use
  const [initialStatus, setInitialStatus] = useQueryState<string>(
    'initial',
    parseAsString.withDefault('').withOptions({ clearOnDefault: true })
  );

  const open = (status?: TaskStatus) => {
    setIsOpen(true);
    if (status) {
      setInitialStatus(status);
    }
  };

  const close = () => {
    setIsOpen(false);
    setInitialStatus('');
  };

  // Transform the string to TaskStatus | undefined in the return
  return {
    isOpen,
    initialStatus: initialStatus ? (initialStatus as TaskStatus) : undefined,
    open,
    close,
    setIsOpen,
  };
};
