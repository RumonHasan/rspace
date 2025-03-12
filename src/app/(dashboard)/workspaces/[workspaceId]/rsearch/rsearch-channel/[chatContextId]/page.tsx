'use client';
import RSearchInputBottom from '../../components/rsearch-input-bottom';
import AiChatBody from '../../components/ai-chat-body';
import { useGetAiChatContextChats } from '@/features/rsearch/api/useGetAiChatContextChats';
import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id';
import { useChatContextId } from '@/features/rsearch/hooks/useChatContextId';
import LoaderPage from '@/app/loading';

const ChannelContextIdPage = () => {
  const workspaceId = useWorkspaceId();
  const chatContextId = useChatContextId();

  const { data: aiContextBasedChats, isLoading: isAiContextBasedChatsLoading } =
    useGetAiChatContextChats({ workspaceId, chatContextId }); // hook for fetching the chats in the current chat context

  if (isAiContextBasedChatsLoading) {
    return <LoaderPage />;
  }

  // fetches the current ai chats from the current context id
  //TODO add proper typings
  const transformedAiChats =
    aiContextBasedChats?.documents.map((doc) => ({
      query: doc.query, // map properties correctly based on actual structure
      workspaceId: doc.workspaceId,
      isHuman: doc.isHuman,
      userId: doc.userId,
      response: doc.response,
      chatContextId: doc.chatContextId,
    })) ?? [];

  return (
    <div className="flex flex-col justify-center items-center w-full">
      <AiChatBody aiChats={transformedAiChats ?? []} />
      <RSearchInputBottom />
    </div>
  );
};

export default ChannelContextIdPage;
