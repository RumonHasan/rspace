import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@radix-ui/react-avatar';

interface MembersAvatarProps {
  name: string;
  className?: string;
  fallbackClassName?: string;
}

export const MembersAvatar = ({
  name,
  className,
  fallbackClassName,
}: MembersAvatarProps) => {
  return (
    <Avatar
      className={cn(
        'h-5 w-5 transition border border-neutral-300 rounded-full relative',
        className
      )}
    >
      <AvatarFallback
        className={cn(
          'h-full w-full bg-neutral-200 font-medium  flex items-center justify-center rounded-full text-sm', // Added h-full w-full and text-sm
          fallbackClassName
        )}
      >
        {name[0].charAt(0).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
};
