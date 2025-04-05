'use client';

import { useGetAiChat } from '@/features/rsearch/api/useGetAiChat';
import CreateNoteForm from './createNoteForm';
import { PageLoader } from '@/components/page-loader';

interface CreateNoteFormWrapperProps {
  onCancel: () => void;
  noteId?: string;
}

const CreateNoteFormWrapper = ({
  onCancel,
  noteId,
}: CreateNoteFormWrapperProps) => {
  const { data: noteResponseRaw, isLoading: isNoteResponseRawLoading } =
    useGetAiChat({
      aiChatResponseId: noteId ?? '',
    });

  if (isNoteResponseRawLoading) {
    return (
      <div className="flex items-center justify-center p-10">
        <PageLoader />
      </div>
    );
  }

  // getting the ai response to populate the create note form if there is one present
  const noteResponse = noteResponseRaw
    ? {
        id: noteResponseRaw.$id,
        query: noteResponseRaw.query,
        workspaceId: noteResponseRaw.workspaceId,
        isHuman: noteResponseRaw.isHuman,
        userId: noteResponseRaw.userId,
        response: noteResponseRaw.response,
        chatContextId: noteResponseRaw.chatContextId,
      }
    : undefined;

  return (
    <div>
      <CreateNoteForm onCancel={onCancel} initialValues={noteResponse} />
    </div>
  );
};

export default CreateNoteFormWrapper;
