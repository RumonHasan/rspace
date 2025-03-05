'use client';
//import { Input } from '@/components/ui/input';
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

const searchSchema = z.object({
  search: z.string().optional().default(''),
});

const RSearchInput = () => {
  const form = useForm<z.infer<typeof searchSchema>>({
    resolver: zodResolver(searchSchema),
    defaultValues: { search: '' }, // Set default value for search input
  });

  const { handleSubmit } = form;

  // for submitting the first search query
  const onSubmit = (values: z.infer<typeof searchSchema>) => {
    console.log(values);
  };

  // fires on pressing enter key
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); // Prevent default new line
      form.handleSubmit(onSubmit)(); // Trigger form submission
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="search"
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
                  />
                </FormControl>
                <FormMessage />
              </div>
            </FormItem>
          )}
        ></FormField>
      </form>
    </Form>
  );
};

export default RSearchInput;
