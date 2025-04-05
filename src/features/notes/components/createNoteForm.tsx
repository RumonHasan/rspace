'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { NotesSchema } from '../schema';

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
import { Textarea } from '@/components/ui/textarea';
import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id';
import { useCreateNote } from '../api/useCreateNote';
import { z } from 'zod';
import { AiChat } from '@/features/rsearch/schema';
import { useRouter } from 'next/navigation';

interface CreateNoteFormProps {
  initialValues?: AiChat;
  onCancel?: () => void;
}

const CreateNoteForm = ({ initialValues, onCancel }: CreateNoteFormProps) => {
  const router = useRouter();
  const workspaceId = useWorkspaceId();
  const { mutate: createNote, isPending: isCreatingNote } = useCreateNote();

  const form = useForm<z.infer<typeof NotesSchema>>({
    resolver: zodResolver(NotesSchema.omit({ workspaceId: true })),
    // check if there is existing note value from ai reponse
    defaultValues: {
      workspaceId,
      noteTitle: initialValues?.query || '',
      note: initialValues?.response || '',
      projectId: '',
      noteDescription: '',
    },
  });

  // on submit function to create a new note
  const onSubmit = (values: z.infer<typeof NotesSchema>) => {
    createNote(
      {
        json: {
          ...values,
          workspaceId,
        },
      },
      {
        onSuccess: async (response) => {
          if (!response?.data) {
            return;
          }
          const note = response.data;
          // router push to the created note page
          router.push(`/workspaces/${workspaceId}/notes/${note.$id}`);
        },
      }
    );
  };

  return (
    <Card className="w-full h-full border-none shadow-none">
      <CardHeader className="flex p-7">
        <CardTitle className="text-xl font-bold">Create New Note</CardTitle>
      </CardHeader>
      <div className="px-7">
        <Separator />
      </div>
      <CardContent className="p-5">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-y-4">
              <FormField
                control={form.control}
                name="noteTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Note Title</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter Note Title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="noteDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Note Description</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter Note Description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="note"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your note</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={7}
                        {...field}
                        placeholder="Enter Task Description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Separator />
              <div className="flex items-center justify-center gap-3">
                <Button
                  type="button"
                  size={'lg'}
                  variant={'secondary'}
                  disabled={isCreatingNote}
                  onClick={onCancel}
                >
                  Cancel
                </Button>
                <Button type="submit" size={'lg'} disabled={isCreatingNote}>
                  Create Note
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default CreateNoteForm;
