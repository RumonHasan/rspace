import { useQueryState, parseAsString } from 'nuqs';

// passing states through urls
export const useEditChannelModal = () => {
  const [channelId, setChannelId] = useQueryState(
    'edit-channel',
    parseAsString
  );

  const open = (id: string) => setChannelId(id);
  const close = () => setChannelId(null);

  return {
    channelId,
    open,
    close,
    setChannelId,
  };
};
