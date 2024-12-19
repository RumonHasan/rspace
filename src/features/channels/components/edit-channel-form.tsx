'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { createChannelSchema } from '../schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormField, FormItem, FormLabel } from '@/components/ui/form';
import Select from 'react-select';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { Channel } from '../types';
import { useUpdateChannel } from '../api/use-update-channel';

interface EditChannelFormProps {
  onCancel: () => void;
  memberOptions: { label: string; value: string }[];
  initialValues: Channel; // contains the original channel values
}

const EditChannelForm = ({
  onCancel,
  memberOptions,
  initialValues,
}: EditChannelFormProps) => {
  const router = useRouter();
  // edit form initial values
  const form = useForm<z.infer<typeof createChannelSchema>>({
    resolver: zodResolver(createChannelSchema.omit({ workspaceId: true })),
    defaultValues: {
      ...initialValues,
    },
  });
  // main hook to update a channel
  const { mutate: updateChannel, isPending: isUpdatingChannel } =
    useUpdateChannel();

  // submitting to the form
  const onSubmit = (values: z.infer<typeof createChannelSchema>) => {
    updateChannel(
      {
        json: values,
        param: { channelId: initialValues.$id },
      },
      {
        onSuccess: () => {
          form.reset(); // resetting the edit form
          onCancel(); // close the form
          router.refresh();
        },
      }
    );
  };

  return (
    <Card className="w-full h-full border-none shadow-none">
      <CardHeader className="flex p-7">
        <CardTitle className="text-xl font-bold">Edit Channel</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-y-3">
              <FormField
                control={form.control}
                name="membersId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Choose Members</FormLabel>
                    <Select
                      isMulti
                      options={memberOptions}
                      value={memberOptions.filter((option) =>
                        field.value?.includes(option.value)
                      )}
                      onChange={(newValue) => {
                        field.onChange(newValue?.map((item) => item.value));
                      }}
                      classNames={{
                        control: () => '!border-input',
                        valueContainer: () => '!text-sm',
                        placeholder: () => '!text-muted-foreground',
                      }}
                    />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Channel Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter Channel Name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Channel Description</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter Channel Description"
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
                  className={cn(!onCancel && 'invisible')}
                  disabled={isUpdatingChannel}
                >
                  Cancel
                </Button>
                <Button type="submit" size={'lg'} disabled={isUpdatingChannel}>
                  Edit Channel
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default EditChannelForm;
