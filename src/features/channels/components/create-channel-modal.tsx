'use client';
import { ResponsiveModal } from '@/components/responsive-modal';

import { useCreateChannelModal } from '../hooks/use-create-channel-modal';
import CreateChannelFormWrapper from './create-channel-form-wrapper';

export const CreateChannelModal = () => {
  const { isOpen, setIsOpen, close } = useCreateChannelModal();
  // oncancel is passed down
  return (
    <ResponsiveModal open={isOpen} onOpenChange={setIsOpen}>
      <CreateChannelFormWrapper onCancel={close} />
    </ResponsiveModal>
  );
};
