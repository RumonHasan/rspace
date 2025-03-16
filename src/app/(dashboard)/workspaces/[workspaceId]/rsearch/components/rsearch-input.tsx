'use client';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Textarea } from '@/components/ui/textarea';
import { searchSchema } from '@/features/rsearch/schema';
import { useGetSonarResponse } from '@/features/rsearch/api/useGetRSearchResponse';
import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id';
import RecentSearches from './recent-searches';
import { useRouter } from 'next/navigation';

const RSearchInput = () => {
  const router = useRouter();
  const { mutate: generateSonarResponse, isPending: isFetchingSonarResponse } =
    useGetSonarResponse(); // hook that calls the sonar api
  const workspaceId = useWorkspaceId();

  //default form states
  const form = useForm<z.infer<typeof searchSchema>>({
    resolver: zodResolver(searchSchema),
    defaultValues: { query: '', workspaceId }, // Set default value for search input
  });

  // for submitting the first search query
  const onSubmit = (values: z.infer<typeof searchSchema>) => {
    if (values.query) {
      // Call the sonar API with the query
      generateSonarResponse(
        {
          json: {
            query: values.query,
            workspaceId,
          },
        },
        {
          onSuccess: (response) => {
            if (!response?.data) {
              console.error('No data in response');
              return;
            }
            const chatContextId = response.data.response?.chatContextId;

            if (!chatContextId) {
              console.error('Missing chatContextId:', response.data);
              return;
            }

            router.push(
              `/workspaces/${workspaceId}/rsearch/rsearch-channel/${chatContextId}`
            );
          },
        }
      );
    }
  };

  // adding search through enter clicks
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      form.handleSubmit(onSubmit)();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="mx-auto w-11/12 lg:w-10/12 xl:w-9/12">
          <div className="flex flex-col gap-6">
            <FormField
              control={form.control}
              name="query"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-center">
                    <FormControl>
                      <Textarea
                        onKeyDown={handleKeyDown}
                        rows={7}
                        {...field}
                        placeholder="Enter your query"
                        className="
                                w-full 
                                p-4 
                                text-lg 
                                rounded-xl 
                                border 
                                border-gray-200 
                                focus:outline-none 
                                focus:ring-0
                                focus:ring-blue-200 
                                resize-none 
                                min-h-[150px]
                                shadow-md 
                                hover:shadow-lg 
                                transition-shadow 
                                duration-300 
                                bg-white 
                                text-gray-700
                            "
                        disabled={isFetchingSonarResponse}
                      />
                    </FormControl>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            ></FormField>

            <RecentSearches workspaceId={workspaceId} />
          </div>
        </div>
      </form>
    </Form>
  );
};

export default RSearchInput;
