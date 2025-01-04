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
import { CheckCheckIcon, WandSparklesIcon } from 'lucide-react';
import { useGetAIResponse } from '@/features/ai/api/use-get-ai-description-summary';
import { useState } from 'react';
import { AiResponseDialog } from './ai-description-dialog';
import { useUpdateTask } from '../api/use-update-task';
import { ChecklistProgressMap, ChecklistUI } from '@/features/checklists/types';
import { Checkbox } from '@/components/ui/checkbox';
import ChecklistPercentageLoader from '@/features/checklists/components/checklist-percentage-loader';
import { useUpdateChecklists } from '@/features/checklists/api/use-update-checklists';
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

export const EditTaskForm = ({
  onCancel,
  projectOptions,
  memberOptions,
  initialValues,
  checklists,
  handleChecklistDelete,
  handleCheckboxSubmit,
  handleCheckboxChecked,
  checklistProgress,
}: EditTaskFormProps) => {
  const [isAiResponseOpen, setIsAiResponseOpen] = useState<boolean>(false);
  const [isAiResponse, setIsAiResponse] = useState<AiResponseProps[]>([]);
  const [isActiveChecklistId, setIsActiveChecklistId] = useState<string | null>(
    null
  );
  const [checkboxInput, setCheckboxInput] = useState('');

  const { mutate, isPending } = useUpdateTask();
  const { mutate: updateChecklist } = useUpdateChecklists();
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

  // In your onSubmit function:
  const onSubmit = async (values: z.infer<typeof createTaskSchema>) => {
    mutate(
      { json: values, param: { taskId: initialValues.$id } },
      {
        onSuccess: async (response) => {
          const data = response.data;
          // Update checklists
          await Promise.all(
            checklists.map(async (checklist) => {
              // Create a clean checklist object
              const updatedChecklist = {
                workspaceId: data.workspaceId,
                projectId: data.projectId,
                text: checklist.checklistName,
                isCompleted: false,
                taskId: data.$id,
                // IMPORTANT: Create clean checkbox objects without spreading
                list: checklist.list.map((item) => ({
                  checkboxId: item.checkboxId,
                  checklistSetId: checklist.checklistId, // Always use the current checklist ID
                  checkboxText: item.checkboxText,
                  isCheckboxCompleted: item.isCheckboxCompleted,
                })),
              };

              console.log(
                `Updating checklist ${checklist.checklistId} with items:`,
                updatedChecklist.list
              );

              updateChecklist({
                json: updatedChecklist,
                param: { checklistId: checklist.checklistId },
              });
            })
          );
          form.reset();
          onCancel?.();
        },
      }
    );
  };

  const getAiSummary = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const isTaskDescription = form.getValues('description');

    if (isTaskDescription !== '' && isTaskDescription !== undefined) {
      const response = await generateAiSummary({
        json: {
          workspaceId,
          description: isTaskDescription ?? 'Description Unavailable',
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
        <CardTitle className="text-xl font-bold">Edit Task</CardTitle>
      </CardHeader>
      <div className="px-7">
        <Separator />
      </div>
      <CardContent className="p-7">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-y-4">
              {/* Task Name */}
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

              {/* Due Date */}
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

              {/* Assignee */}
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
                          <SelectValue placeholder="select Assignee" />
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
                              <span>{member.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              {/* Status */}
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
                          <SelectValue placeholder="select Status" />
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

              {/* Project */}
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
                          <SelectValue placeholder="select Project" />
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
                              <span>{project.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              {/* Checklists */}
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

                    <ChecklistPercentageLoader
                      data={
                        checklistProgress[checklistId] ?? {
                          total: 0,
                          completed: 0,
                        }
                      }
                    />

                    <div className="flex flex-col gap-2 w-full">
                      {list.map((checkboxItem) => {
                        const {
                          checkboxId,
                          checkboxText,
                          isCheckboxCompleted,
                        } = checkboxItem;
                        return (
                          <div
                            key={checkboxId}
                            className="flex items-center space-x-3"
                          >
                            <Checkbox
                              id={checkboxId}
                              checked={isCheckboxCompleted}
                              onCheckedChange={() =>
                                handleCheckboxChecked(
                                  checkboxId,
                                  checklistId,
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
