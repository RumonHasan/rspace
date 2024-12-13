'use client';

import { useChannelId } from '@/features/channels/hooks/use-channel-id';
import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id';
import { useGetMessages } from '../api/use-get-messages';
import { client } from '@/lib/appwrite-client';
import { useEffect, useRef } from 'react';
import { CHATS_ID, DATABASE_ID } from '@/config';
import { useQueryClient } from '@tanstack/react-query';
import { useCurrent } from '@/features/auth/api/user-current';
import { cn } from '@/lib/utils';
import { Chat } from '../types';

interface ChatProps extends Chat {
  $createdAt: string;
}
interface QueryData {
  documents: ChatProps[];
}

interface SubscriptionResponse {
  events: string[];
  payload: ChatProps;
}

const ChatPanel = () => {
  const channelId = useChannelId();
  const workspaceId = useWorkspaceId();
  const queryClient = useQueryClient();
  const { data: currentUser } = useCurrent();

  const { data: messages } = useGetMessages({
    workspaceId,
    channelId,
  });
  const messagesEndContainerRef = useRef<HTMLDivElement>(null);

  // when a new message is entered it scrolls to the bottom
  // TODO fix the parent container also scrolling down
  const scrollToBottomMessage = () => {
    if (messagesEndContainerRef.current) {
      messagesEndContainerRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };
  // runs only when a new message has been added
  useEffect(() => {
    scrollToBottomMessage();
  }, [messages?.documents]);

  // realtime functionality for getting messages
  useEffect(() => {
    let unsubscribe: () => void;

    const setupSubscription = () => {
      unsubscribe = client.subscribe(
        `databases.${DATABASE_ID}.collections.${CHATS_ID}.documents`,
        (response: SubscriptionResponse) => {
          if (
            response.events.includes(
              'databases.*.collections.*.documents.*.create'
            )
          ) {
            queryClient.setQueryData<QueryData>(
              ['chats', workspaceId, channelId],
              (oldData?: QueryData) => {
                if (!oldData) return { documents: [response.payload] };

                const newDocuments = [...oldData.documents, response.payload];

                return {
                  ...oldData,
                  documents: newDocuments.sort(
                    (a, b) =>
                      new Date(b.$createdAt).getTime() -
                      new Date(a.$createdAt).getTime()
                  ),
                };
              }
            );
          }
        }
      );
    };

    setupSubscription();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [channelId, workspaceId, queryClient]);

  return (
    <div className="flex flex-col">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages?.documents.map((message) => {
          const isCurrentUser = message.userId === currentUser?.$id;

          return (
            <div
              key={message.$id}
              className={cn(
                'flex w-full',
                isCurrentUser ? 'justify-end' : 'justify-start'
              )}
            >
              <div
                className={cn(
                  'max-w-[70%] rounded-lg p-3',
                  isCurrentUser
                    ? 'bg-blue-500 text-white rounded-br-none'
                    : 'bg-gray-200 text-gray-900 rounded-bl-none'
                )}
              >
                {/* Message header with name and time */}
                <div
                  className={cn(
                    'text-xs mb-1',
                    isCurrentUser ? 'text-blue-100' : 'text-gray-500'
                  )}
                >
                  <span className="ml-2">
                    {new Date(message.$createdAt).toLocaleTimeString()}
                  </span>
                </div>

                {/* Message content */}
                <div className="break-words">{message.message}</div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndContainerRef} />
      </div>

    </div>
  );
};
export default ChatPanel;
