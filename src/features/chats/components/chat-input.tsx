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
import { PenSquare } from 'lucide-react';
import { useEffect } from 'react';

const ChatInput = () => {
  const workspaceId = useWorkspaceId();
  const channelId = useChannelId();
  const { data: currentUser } = useCurrent();

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

  return (
    <div className="w-full">
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
              disabled={isCreatingMessage}
              className="rounded-full p-2 h-12 w-12 flex items-center justify-center shrink-0"
            >
              <PenSquare className="size-5" />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ChatInput;
