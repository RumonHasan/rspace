'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { createTaskSchema } from '../schemas';
import { z } from 'zod';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormItem,
  FormField,
  FormMessage,
  FormLabel,
} from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id';
import { DatePicker } from '@/components/date-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MembersAvatar } from '@/features/members/components/members-avatar';
import { Task, TaskStatus } from '../types';
import { ProjectAvatar } from '@/features/projects/components/projects-avatar';
import { Textarea } from '@/components/ui/textarea';
import { WandSparklesIcon } from 'lucide-react';
import { useGetAIResponse } from '@/features/ai/api/use-get-ai-description-summary';
import { useState } from 'react';
import { AiResponseDialog } from './ai-description-dialog';
import { useUpdateTask } from '../api/use-update-task';

export interface AiResponseProps {
  content: string;
  type: string;
}

interface EditTaskFormProps {
  onCancel?: () => void;
  projectOptions: {
    id: string;
    name: string;
    imageUrl: string;
  }[];
  memberOptions: {
    id: string;
    name: string;
  }[];
  initialValues: Task;
}

// this is create task form

export const EditTaskForm = ({
  onCancel,
  projectOptions,
  memberOptions,
  initialValues,
}: EditTaskFormProps) => {
  const [isAiResponseOpen, setIsAiResponseOpen] = useState<boolean>(false);
  const [isAiResponse, setIsAiResponse] = useState<AiResponseProps[]>([]);
  const { mutate, isPending } = useUpdateTask();
  const workspaceId = useWorkspaceId();
  const { mutateAsync: generateAiSummary, isPending: isGeneratingAiSummary } =
    useGetAIResponse();

  const form = useForm<z.infer<typeof createTaskSchema>>({
    resolver: zodResolver(createTaskSchema.omit({ workspaceId: true })),
    defaultValues: {
      ...initialValues,
      dueDate: initialValues.dueDate
        ? new Date(initialValues.dueDate)
        : undefined,
    },
  });

  const onSubmit = (values: z.infer<typeof createTaskSchema>) => {
    mutate(
      { json: values, param: { taskId: initialValues.$id } },
      {
        onSuccess: () => {
          form.reset();
          // Todo redirect to new task

          onCancel?.();
        },
      }
    );
  };
  // asks ai to make a small description if task name is present
  const getAiSummary = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const isTaskDescription = form.getValues('description');

    if (isTaskDescription !== '' && isTaskDescription !== undefined) {
      const response = await generateAiSummary({
        json: {
          workspaceId,
          description: isTaskDescription ?? 'Description Unavailable',
          formats: ['bulleted', 'narrative'], // Request both formats
        },
      });
      const { responses } = response.data.documents[0];
      if (responses.length) {
        setIsAiResponse(responses);
        setIsAiResponseOpen(true);
      }
    }
  };
  // passing the selected ai response to the form values and updating them
  const handleOnSelectAiResponse = (selectedResponse: AiResponseProps) => {
    if (selectedResponse) {
      form.setValue('description', selectedResponse.content);
    }
  };

  return (
    <Card className="w-full h-full border-none shadow-none">
      <AiResponseDialog
        isAiResponseOpen={isAiResponseOpen}
        setIsAiResponseOpen={setIsAiResponseOpen}
        aiResponses={isAiResponse}
        onSelect={handleOnSelectAiResponse}
      />
      <CardHeader className="flex p-7">
        <CardTitle className="text-xl font-bold">Edit A Task</CardTitle>
      </CardHeader>
      <div className="px-7">
        <Separator />
      </div>
      <CardContent className="p-7">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Task Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter Task Name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <FormControl>
                      <DatePicker {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="assigneeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assignee</FormLabel>
                    <Select
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="select Assignee"></SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <FormMessage />
                      <SelectContent>
                        {memberOptions.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            <div className="flex items-center gap-x-2">
                              <MembersAvatar
                                name={member.name}
                                className="size-6"
                              />
                              <span> {member.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="select Status"></SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <FormMessage />
                      <SelectContent>
                        <SelectItem value={TaskStatus.BACKLOG}>
                          Backlog
                        </SelectItem>
                        <SelectItem value={TaskStatus.TODO}>Todo</SelectItem>
                        <SelectItem value={TaskStatus.IN_REVIEW}>
                          In Review
                        </SelectItem>
                        <SelectItem value={TaskStatus.DONE}>Done</SelectItem>
                        <SelectItem value={TaskStatus.IN_PROGRESS}>
                          In Progress
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="projectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Assigned</FormLabel>
                    <Select
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="select Project"></SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <FormMessage />
                      <SelectContent>
                        {projectOptions.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            <div className="flex items-center gap-x-2">
                              <ProjectAvatar
                                name={project.name}
                                className="size-6"
                                image={project.imageUrl}
                              />
                              <span> {project.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              {/**Ai powered task description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center">
                      <FormLabel>Description</FormLabel>
                      <Button
                        disabled={
                          isGeneratingAiSummary ||
                          isPending ||
                          (field.value ?? '').length === 0
                        }
                        onClick={getAiSummary}
                        variant={'secondary'}
                        className="flex items-center justify-center gap-2"
                      >
                        <WandSparklesIcon className="size-6" />
                        <span className="text-md">Summarize</span>
                      </Button>
                    </div>

                    <FormControl>
                      <Textarea
                        rows={7}
                        {...field}
                        placeholder="Enter Task Description"
                        className={cn(
                          isGeneratingAiSummary &&
                            'text-transparent selection:bg-transparent'
                        )}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Separator />
              <div className="flex items-center justify-between">
                <Button
                  type="button"
                  size={'lg'}
                  variant={'secondary'}
                  onClick={onCancel}
                  disabled={isPending}
                  className={cn(!onCancel && 'invisible')}
                >
                  Cancel
                </Button>
                <Button type="submit" size={'lg'} disabled={isPending}>
                  Save Changes
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
