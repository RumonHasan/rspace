'use client';
import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';

interface DatePickerProps {
  value: Date | undefined;
  onChange: (date: Date) => void;
  className?: string;
  placeHolder?: string;
}

export const DatePicker = ({
  value,
  onChange,
  className,
  placeHolder = 'Select Date',
}: DatePickerProps) => {
  const [open, setOpen] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);

  // Check if device is mobile
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const CalendarButton = (
    <Button
      variant={'outline'}
      size={'lg'}
      className={cn(
        'w-full justify-start text-left font-normal px-3',
        !value && 'text-muted-foreground',
        className
      )}
    >
      <CalendarIcon className="mr-2 h-4 w-4" />
      {value ? format(value, 'PPP') : <span>{placeHolder}</span>}
    </Button>
  );

  const CalendarContent = (
    <Calendar
      mode="single"
      selected={value}
      onSelect={(date) => {
        if (date) {
          onChange(date);
          setOpen(false);
        }
      }}
      initialFocus
    />
  );
  // mobile mode display a different popup for date
  if (isMobile) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{CalendarButton}</DialogTrigger>
        <DialogContent className="flex justify-center p-0">
          {CalendarContent}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{CalendarButton}</PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        {CalendarContent}
      </PopoverContent>
    </Popover>
  );
};
