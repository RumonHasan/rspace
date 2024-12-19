'use client';
import { ResponsiveModal } from '@/components/responsive-modal';
import EditChannelFormWrapper from './edit-channel-form-wrapper';
import { useEditChannelModal } from '../hooks/use-edit-channel-modal';

export const EditChannelModal = () => {
  const { channelId, close } = useEditChannelModal();

  return (
    <ResponsiveModal open={!!channelId} onOpenChange={close}>
      {channelId && <EditChannelFormWrapper onCancel={close} id={channelId} />}
    </ResponsiveModal>
  );
};
