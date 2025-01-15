'use client';
import { useChannelId } from '@/features/channels/hooks/use-channel-id';
import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id';
import { useGetMessages } from '../api/use-get-messages';
import { useCreateMessage } from '../api/use-post-message';
import { useGetMessage } from '../api/use-get-message';
import { useEffect, useRef, useState } from 'react';
import { useCurrent } from '@/features/auth/api/user-current';
import { cn } from '@/lib/utils';
import { Reply } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Chat } from '../types';

interface ModifiedMessage extends Chat {
  isHovered: boolean;
}

const ChatPanel = () => {
  const channelId = useChannelId();
  const workspaceId = useWorkspaceId();
  const { data: currentUser } = useCurrent();
  const { mutate: createReplyMessage, isPending: isCreatingReplyMessage } =
    useCreateMessage(); // hook for replying to an existing message
  const { data } = useGetMessages({
    workspaceId,
    channelId,
  });

  // states
  const [hoverMessageId, setIsHoverMessageId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ModifiedMessage[] | null>([]);
  const messagesEndContainerRef = useRef<HTMLDivElement>(null);
  const [hoverDropdownOpen, setIsHoverDropdownOpen] = useState(false);
  const [replyMessage, setIsReplyMessage] = useState('');

  // message to reply
  const { mutate: getMessageToReply } = useGetMessage();

  // when a new message is entered it scrolls to the bottom
  // TODO fix the parent container also scrolling down
  const scrollToBottomMessage = () => {
    if (messagesEndContainerRef.current) {
      messagesEndContainerRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // populating messages with addition component for boolean
  useEffect(() => {
    if (data?.documents) {
      const modifiedMessages = data?.documents.map((message) => {
        return {
          ...message,
          isHovered: false,
        };
      });
      setMessages(modifiedMessages);
    }
  }, [data]);

  // runs only when a new message has been added
  useEffect(() => {
    scrollToBottomMessage();
  }, [messages]);

  // adding id when hovered Message
  const handleOnHoverEnter = (id: string) => {
    if (id) {
      setIsHoverMessageId(id);
    }
  };
  const handleOnHoverLeave = () => {
    setIsHoverMessageId(null);
  };

  // updating the hover show state when message is hovered
  useEffect(() => {
    if (hoverMessageId && messages?.length) {
      setMessages((prevMessages) =>
        prevMessages
          ? prevMessages.map((message) => {
              if (message.$id === hoverMessageId) {
                return {
                  ...message,
                  isHovered: message.$id === hoverMessageId,
                };
              } else {
                return {
                  ...message,
                  isHovered: false,
                };
              }
            })
          : []
      );
    }
  }, [hoverMessageId, messages?.length]);

  //triggers when reply button is clicked
  const handleReply = (messageId: string) => {
    if (replyMessage) {
      getMessageToReply(
        {
          json: {
            messageId,
          },
        },
        {
          onSuccess: (response) => {
            if (data) {
              const message = response.data;
              const replyMessageId = message.$id;
              // create a new message but add the replyToMessage id to the new message
              const replyMessageObject = {
                workspaceId: workspaceId,
                message: replyMessage.trim(),
                channelId: channelId,
                userId: currentUser?.$id ?? '',
              };
              createReplyMessage({
                form: {
                  ...replyMessageObject,
                  replyTo: JSON.stringify({
                    id: replyMessageId,
                    message: message.message.substring(0, 50),
                  }),
                },
              });
              setIsHoverDropdownOpen(false);
              setIsReplyMessage('');
            }
          },
        }
      );
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages?.map((message) => {
          const { replyTo } = message;
          const replyToObject = replyTo ? JSON.parse(replyTo) : ''; // converts the reply to back to an object
          const isCurrentUser = message.userId === currentUser?.$id;
          return (
            <div
              onMouseEnter={() => handleOnHoverEnter(message.$id)}
              onMouseLeave={handleOnHoverLeave}
              key={message.$id}
              className={cn(
                'flex w-full group relative',
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

                {replyToObject && (
                  <div
                    className={cn(
                      'text-xs mb-1 rounded-md',
                      isCurrentUser
                        ? 'text-blue-100 bg-blue-400 p-1'
                        : 'text-gray-500 bg-gray-400 p-1'
                    )}
                  >
                    <span className="ml-2">{replyToObject.message}</span>
                  </div>
                )}

                {/* Message content */}
                <div className="break-words">{message.message}</div>
              </div>
              {/* showing reply button on hover */}
              {message.isHovered && (
                <DropdownMenu
                  open={hoverDropdownOpen}
                  onOpenChange={setIsHoverDropdownOpen}
                >
                  <DropdownMenuTrigger asChild>
                    <Button
                      onClick={() => {
                        setIsReplyMessage(''); // clearing state before opening
                      }}
                      variant="ghost"
                      size="sm"
                      className={cn(
                        'absolute top-2 flex items-center gap-1',
                        'opacity-100'
                      )}
                    >
                      <span className="text-xs">Reply</span>
                      <Reply size={14} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="flex flex-col items-center p-2 gap-2 w-[300px]">
                    <span className="text-muted-foreground">
                      Add Your Reply
                    </span>
                    <Input
                      className="flex w-full"
                      value={replyMessage}
                      onChange={(e) => setIsReplyMessage(e.target.value)}
                    />
                    <div className="flex flex-row gap-1 items-start">
                      <Button
                        disabled={isCreatingReplyMessage}
                        variant={'secondary'}
                        onClick={() => setIsHoverDropdownOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => handleReply(message.$id)}
                        disabled={isCreatingReplyMessage}
                      >
                        Reply
                      </Button>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          );
        })}
        <div ref={messagesEndContainerRef} />
      </div>
    </div>
  );
};
export default ChatPanel;
