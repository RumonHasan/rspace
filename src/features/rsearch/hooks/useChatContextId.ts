import { useParams } from 'next/navigation';

export const useChatContextId = () => {
  const params = useParams();
  return params.chatContextId as string;
};
