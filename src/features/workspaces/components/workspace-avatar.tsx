import Image from 'next/image';

import { cn } from '@/lib/utils';

import { Avatar, AvatarFallback } from '@radix-ui/react-avatar';

interface WorkspaceAvatarProps {
  image?: string;
  name: string;
  className?: string;
}

export const WorkspaceAvatar = ({
  image,
  name,
  className,
}: WorkspaceAvatarProps) => {
  if (image) {
    return (
      <div
        className={cn('size-10 rounded-md relative overflow-hidden', className)}
      >
        <Image src={image} alt={name} fill className={'object-cover'} />
      </div>
    );
  }
  return (
    <Avatar
      className={cn(
        'size-10 flex items-center justify-center rounded-md',
        className
      )}
    >
      <AvatarFallback className="text-white bg-blue-600 font-semibold text-lg uppercase rounded-md p-2">
        {name[0]}
      </AvatarFallback>
    </Avatar>
  );
};
