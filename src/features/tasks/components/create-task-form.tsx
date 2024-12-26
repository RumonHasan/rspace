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
import { useCreateTask } from '../api/use-create-task';
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
import { TaskStatus } from '../types';
import { ProjectAvatar } from '@/features/projects/components/projects-avatar';
import { Textarea } from '@/components/ui/textarea';
import { CheckCheckIcon, WandSparklesIcon } from 'lucide-react';
import { useGetAIResponse } from '@/features/ai/api/use-get-ai-description-summary';
import { useState } from 'react';
import { AiResponseDialog } from './ai-description-dialog';
import { ChecklistProgressMap, ChecklistUI } from '@/features/checklists/types';
import { Checkbox } from '@/components/ui/checkbox';
import { useCreateChecklists } from '@/features/checklists/api/use-post-checklists';
import ChecklistPercentageLoader from '@/features/checklists/components/checklist-percentage-loader';

export interface AiResponseProps {
  content: string;
  type: string;
}

interface CreateTaskFormProps {
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
  initialStatus?: TaskStatus | undefined;
  checklists: ChecklistUI[];
  handleChecklistDelete: (existingId: string) => void;
  handleCheckboxSubmit: (payload: string, checklistId: string) => void;
  handleCheckboxChecked: (
    checkboxId: string,
    checkboxList: string,
    checked: boolean
  ) => void;
  checklistProgress: ChecklistProgressMap;
}

// this is create task form

export const CreateTaskForm = ({
  onCancel,
  handleChecklistDelete,
  handleCheckboxSubmit,
  handleCheckboxChecked,
  checklistProgress,
  projectOptions,
  memberOptions,
  initialStatus,
  checklists,
}: CreateTaskFormProps) => {
  const [isAiResponseOpen, setIsAiResponseOpen] = useState<boolean>(false);
  const [isAiResponse, setIsAiResponse] = useState<AiResponseProps[]>([]);
  // checkbox states
  const [isActiveChecklistId, setIsActiveChecklistId] = useState<string | null>(
    null
  );
  const [checkboxInput, setCheckboxInput] = useState('');

  const { mutate, isPending } = useCreateTask();
  const { mutate: createChecklist } = useCreateChecklists();
  const workspaceId = useWorkspaceId();

  const { mutateAsync: generateAiSummary, isPending: isGeneratingAiSummary } =
    useGetAIResponse();

  const form = useForm<z.infer<typeof createTaskSchema>>({
    resolver: zodResolver(createTaskSchema.omit({ workspaceId: true })),
    defaultValues: {
      name: '',
      status: initialStatus || TaskStatus.TODO,
    },
  });

  const onSubmit = (values: z.infer<typeof createTaskSchema>) => {
    mutate(
      { json: { ...values, workspaceId } },
      {
        onSuccess: async (response) => {
          const data = response.data;
          form.reset();
          // Todo redirect to new task

          // adding the checklists of each individual tasks
          await Promise.all(
            checklists.map(async (checklist) => {
              const newChecklist = {
                workspaceId: data.workspaceId,
                projectId: data.projectId,
                text: checklist.checklistName,
                isCompleted: false,
                taskId: data.$id,
              };
              createChecklist({
                json: { ...newChecklist, list: checklist.list },
              });
            })
          );

          onCancel?.();
        },
      }
    );
    // creating checklists for the tasks
    console.log('checklist after submission', checklists);
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
        <CardTitle className="text-xl font-bold">Create New Task</CardTitle>
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
              {/** check boxes section */}
              {checklists?.map((checklist) => {
                const { checklistName, checklistId, list } = checklist;
                const isCurrentChecklistInputOpen =
                  isActiveChecklistId === checklistId;
                return (
                  <div
                    className="flex flex-col gap-0.1 items-start"
                    key={checklistId}
                  >
                    <div className="flex w-full flex-1 justify-between">
                      <div className="flex items-center justify-center gap-1">
                        <CheckCheckIcon className="text-muted-foreground" />
                        <span className="text-muted-foreground text-lg">
                          {checklistName}
                        </span>
                      </div>
                      <Button
                        className="rounded-md"
                        onClick={() => handleChecklistDelete(checklistId)}
                      >
                        <span>Delete</span>
                      </Button>
                    </div>

                    {/** percentage loader component for checkbox */}
                    <ChecklistPercentageLoader
                      data={
                        checklistProgress[checklistId] ?? {
                          total: 0,
                          completed: 0,
                        }
                      }
                    />

                    {/**  list of all the checkbox items contains two components a label and a checkbox*/}
                    <div className="flex flex-col gap-2 w-full">
                      {list.map((checkboxItem) => {
                        const {
                          checkboxId,
                          checkboxText,
                          checklistSetId,
                          isCheckboxCompleted,
                        } = checkboxItem;
                        return (
                          <div
                            key={checkboxId}
                            className="flex items-center space-x-3 "
                          >
                            <Checkbox
                              id={checkboxId}
                              checked={isCheckboxCompleted}
                              onCheckedChange={() =>
                                handleCheckboxChecked(
                                  checkboxId,
                                  checklistSetId,
                                  isCheckboxCompleted
                                )
                              }
                            />
                            <label
                              htmlFor={checkboxId}
                              className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 
                              ${
                                isCheckboxCompleted
                                  ? 'line-through text-muted-foreground'
                                  : ''
                              }`}
                            >
                              {checkboxText}
                            </label>
                          </div>
                        );
                      })}
                    </div>

                    {isCurrentChecklistInputOpen ? (
                      <div className="flex flex-col items-start justify-center w-full gap-2 mt-1.5">
                        <Input
                          className="w-full h-8"
                          placeholder="Enter an item"
                          value={checkboxInput}
                          onChange={(e) => setCheckboxInput(e.target.value)}
                        />
                        <div className="flex flex-row gap-1">
                          <Button
                            type="button"
                            className="h-8"
                            variant={'outline'}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleCheckboxSubmit(checkboxInput, checklistId);
                              setCheckboxInput('');
                            }}
                          >
                            <span>Add</span>
                          </Button>
                          <Button
                            type="button"
                            variant={'outline'}
                            className="h-8"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setIsActiveChecklistId(null);
                              setCheckboxInput('');
                            }}
                          >
                            <span>Cancel</span>
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        className="rounded-sm items-center justify-center h-8 mt-2"
                        variant={'outline'}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setIsActiveChecklistId(checklistId);
                        }}
                      >
                        <span>Add Item</span>
                      </Button>
                    )}
                  </div>
                );
              })}
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
                  Create Task
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
