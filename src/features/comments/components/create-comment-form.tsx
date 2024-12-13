'use client';

import { Task } from '@/features/tasks/types';
import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { createCommentSchema } from '../schemas';
import { useCreateComment } from '../api/use-post-comment';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PenSquare, X } from 'lucide-react';
import { useTaskId } from '@/features/tasks/hooks/use-task-id';
import { useCurrent } from '@/features/auth/api/user-current';
import { useRef, useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface CreateTaskFormProps {
  initialData: Task;
}

export const CreateCommentForm = ({ initialData }: CreateTaskFormProps) => {
  const workspaceId = useWorkspaceId();
  const taskId = useTaskId();
  const currentUser = useCurrent();
  const [selectedCommentImageFile, setSelectedCommentImageFile] =
    useState<File | null>(null);

  const form = useForm<z.infer<typeof createCommentSchema>>({
    resolver: zodResolver(createCommentSchema),
    defaultValues: {
      workspaceId: workspaceId,
      taskId: taskId,
      projectId: initialData.projectId,
      commentorId: currentUser.data?.$id,
      comment: '',
      commentImage: undefined,
    },
  });

  const { mutate: createComment, isPending: isCreatingComment } =
    useCreateComment();

  const onSubmit = (values: z.infer<typeof createCommentSchema>) => {
    if (values.comment || selectedCommentImageFile) {
      createComment(
        {
          form: {
            ...values,
            comment: values.comment,
            commentImage:
              selectedCommentImageFile instanceof File
                ? selectedCommentImageFile
                : '',
          },
        },
        {
          onSuccess: () => {
            form.reset();
            clearSelectedFile(); // clearing the file input ref
          },
        }
      );
    }
  };

  const handleSubmit = (e: React.MouseEvent) => {
    e.preventDefault();
    form.handleSubmit(onSubmit)();
  };

  const commentImageInputRef = useRef<HTMLInputElement>(null);

  // setting the file input image
  const handleCommentImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedCommentImageFile(file);
    }
  };
  // clearing selected file
  const clearSelectedFile = () => {
    setSelectedCommentImageFile(null);
    if (commentImageInputRef.current) {
      commentImageInputRef.current.value = '';
    }
  };

  return (
    <div className="p-4 bg-white">
      <div className="w-full">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex flex-row gap-2 items-center">
              <FormField
                control={form.control}
                name="comment"
                render={({ field }) => (
                  <FormItem className="w-full relative">
                    <div className="relative">
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Write a comment..."
                          className="rounded-full h-12 px-4 border-gray-300"
                        />
                      </FormControl>
                      {selectedCommentImageFile && (
                        <div className="absolute left-4 top-14 p-4 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-md flex items-center gap-1">
                          {selectedCommentImageFile.name}
                          <button
                            type="button"
                            onClick={clearSelectedFile}
                            className="hover:text-blue-600"
                          >
                            <X className="size-3" />
                          </button>
                        </div>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="commentImage"
                render={({ field }) => (
                  <div className="flex flex-col gap-y-2">
                    <div className="flex items-center gap-x-5">
                      <div className="flex flex-col">
                        <input
                          className="hidden"
                          type="file"
                          accept=".jpeg, .png, .jpg, .png, .heic"
                          ref={commentImageInputRef}
                          onChange={handleCommentImage}
                          disabled={isCreatingComment}
                        />
                        {field.value ? (
                          <Button
                            type="button"
                            disabled={isCreatingComment}
                            variant={'destructive'}
                            size={'xs'}
                            className="w-fit mt-2"
                            onClick={() => {
                              field.onChange(null);
                              if (commentImageInputRef.current) {
                                commentImageInputRef.current.value = '';
                              }
                            }}
                          >
                            Remove Image
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            disabled={isCreatingComment}
                            variant={'teritary'}
                            size={'xs'}
                            className="rounded-full p-2 h-12 w-12 flex items-center justify-center shrink-0"
                            onClick={() =>
                              commentImageInputRef.current?.click()
                            }
                          >
                            <ImageIcon size={'sm'} />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              />

              <Button
                onClick={handleSubmit}
                type="submit"
                size={'sm'}
                disabled={isCreatingComment}
                className="rounded-full p-2 h-12 w-12 flex items-center justify-center shrink-0"
              >
                <PenSquare className="size-5" />
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};
