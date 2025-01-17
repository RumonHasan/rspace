'use client';

import { useCurrent } from '@/features/auth/api/user-current';
import { useChannelId } from '@/features/channels/hooks/use-channel-id';
import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id';
import { useForm } from 'react-hook-form';
import { createChatSchema } from '../schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateMessage } from '../api/use-post-message';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PenSquare, InfoIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useGetAIResponse } from '@/features/ai/api/use-get-ai-description-summary';
import { AiResponseProps } from '@/features/tasks/components/create-task-form';
import { AiResponseDialog } from '@/features/tasks/components/ai-description-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const ChatInput = () => {
  const workspaceId = useWorkspaceId();
  const channelId = useChannelId();
  const { data: currentUser } = useCurrent();
  // states
  const [isAiResponseOpen, setIsAiResponseOpen] = useState<boolean>(false);
  const [isAiResponse, setIsAiResponse] = useState<AiResponseProps[]>([]);

  const form = useForm<z.infer<typeof createChatSchema>>({
    resolver: zodResolver(createChatSchema),
    defaultValues: {
      workspaceId: workspaceId,
      message: '',
      channelId: channelId,
      userId: currentUser?.$id ?? '',
      replyTo: '',
    },
  });

  const { mutate: createMessage, isPending: isCreatingMessage } =
    useCreateMessage();
  const { mutateAsync: generateAiResponse, isPending: isGeneratingAiReponse } =
    useGetAIResponse(); // will fetch ai response when reponse is sent via json format

  const isLoading = isCreatingMessage || isGeneratingAiReponse;

  const onSubmit = async (values: z.infer<typeof createChatSchema>) => {
    if (!values.message.trim()) return; // Don't send empty messages

    createMessage(
      {
        form: {
          ...values,
          message: values.message.trim(),
        },
      },
      {
        onSuccess: () => {
          // Reset only the message field, keep other values
          form.reset({
            ...values,
            message: '',
          });
        },
        onSettled: () => {
          // Enable form regardless of success/failure
          form.reset({
            ...values,
            message: '',
          });
        },
      }
    );
  };
  useEffect(() => {
    if (currentUser?.$id) {
      form.setValue('userId', currentUser.$id);
    }
  }, [currentUser, form]);

  // updating the channel and workspace when it changes
  useEffect(() => {
    if (channelId) {
      form.setValue('channelId', channelId);
    }
    if (workspaceId) {
      form.setValue('workspaceId', workspaceId);
    }
  }, [channelId, workspaceId, form]);

  // generating ai response based on the input from the input box
  const generatingAiResponse = async (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    const messagePrompt = form.getValues('message');
    if (messagePrompt !== '' && messagePrompt !== undefined) {
      const response = await generateAiResponse({
        json: {
          workspaceId,
          description: messagePrompt ?? 'Message unavailable',
          formats: ['bulleted', 'narrative'],
        },
      });
      const { responses } = response.data.documents[0];
      if (responses.length) {
        setIsAiResponse(responses);
        setIsAiResponseOpen(true);
      }
    }
  };

  // getting the ai response from the dialog box
  const handleOnSelectAiResponse = (selectedResponse: AiResponseProps) => {
    if (selectedResponse) {
      form.setValue('message', selectedResponse.content);
    }
  };

  return (
    <div className="w-full">
      <AiResponseDialog
        isAiResponseOpen={isAiResponseOpen}
        setIsAiResponseOpen={setIsAiResponseOpen}
        aiResponses={isAiResponse}
        onSelect={handleOnSelectAiResponse}
        dialogTitle={'Your message has been summarized'}
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex flex-row gap-2 items-center">
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem className="w-full relative">
                  <div className="relative">
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Write your message"
                        className="rounded-md h-12 border-gray-300"
                      />
                    </FormControl>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            <Button
              type="submit"
              size={'sm'}
              disabled={isLoading}
              className="rounded-full p-2 h-12 w-12 flex items-center justify-center shrink-0"
            >
              <PenSquare className="size-5" />
            </Button>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size={'sm'}
                  disabled={isLoading}
                  variant={'secondary'}
                  onClick={generatingAiResponse}
                  className="rounded-full p-2 h-12 w-12 flex items-center justify-center shring-0"
                >
                  <InfoIcon className="size-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-sm">Generate ai response</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ChatInput;
