'use client';

import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Textarea } from '@/components/ui/textarea';
import { searchSchema } from '@/features/rsearch/schema';
import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id';
import { usePostSearchQuery } from '@/features/rsearch/api/usePostSearchQuery';
import { usePostAiChatContextChats } from '@/features/rsearch/api/usePostAiChatContextChats';
import { useChatContextId } from '@/features/rsearch/hooks/useChatContextId';

// change api to search only based on current context chats
const RSearchInputBottom = () => {
  const { mutate: postSonarSearchQuery } = usePostSearchQuery();
  const { mutate: postAiContextChats, isPending: isPostingAiContextChats } =
    usePostAiChatContextChats();
  // workspace and chat context ids
  const workspaceId = useWorkspaceId();
  const chatContextId = useChatContextId();
  // Form setup
  const form = useForm<z.infer<typeof searchSchema>>({
    resolver: zodResolver(searchSchema),
    defaultValues: { query: '', workspaceId },
  });

  // Submit handler
  const onSubmit = (values: z.infer<typeof searchSchema>) => {
    if (values.query) {
      // Call the sonar API with the query
      postAiContextChats(
        {
          json: {
            query: values.query,
            workspaceId,
            chatContextId,
          },
        },
        {
          onSuccess: (response) => {
            if (response.data) {
              form.reset({ query: '', workspaceId });
            }
          },
        }
      );
      // Save search query
      postSonarSearchQuery({
        json: {
          workspaceId,
          query: values.query,
        },
      });
    }
  };

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      form.handleSubmit(onSubmit)();
    }
  };

  return (
    <div className="fixed bottom-0 p-4">
      <div className="mx-auto w-full max-w-7xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex items-center gap-2">
              <FormField
                control={form.control}
                name="query"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Textarea
                        {...field}
                        onKeyDown={handleKeyDown}
                        rows={4}
                        disabled={isPostingAiContextChats}
                        placeholder="Continue your conversation..."
                        className="
                          w-full
                          p-3
                          text-base
                          rounded-lg
                          border
                          border-gray-200
                          focus:outline-none
                          focus:ring-0
                          focus:ring-blue-200
                          resize-none
                          shadow-sm
                          hover:shadow-md
                          transition-shadow
                          duration-300
                          bg-white
                          text-gray-700
                          min-h-0
                          min-w-[700px]
                        "
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default RSearchInputBottom;
