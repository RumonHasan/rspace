'use client';
import { MobileSidebar } from '@/components/mobile-sidebaar';
import { UserButton } from '../features/auth/components/user-button';
import { usePathname } from 'next/navigation';
import { SearchBar } from './search-bar';

const pathNameMap = {
  tasks: {
    title: 'My Tasks',
    description: 'View all of your tasks here!',
  },
  projects: {
    title: 'My Projects',
    description: 'View tasks of your projects right here!',
  },
};

const defaultMap = {
  title: 'Home',
  description: 'Monitor all of your projects here',
};

export const Navbar = () => {
  const pathName = usePathname();
  const pathNameParts = pathName.split('/');
  const pathnameKey = pathNameParts[3] as keyof typeof pathNameMap;
  const { title, description } = pathNameMap[pathnameKey] || defaultMap;

  return (
    <nav className="pt-4 px-6 flex items-center justify-between">
      <div className="flex-col hidden lg:flex">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <MobileSidebar />
      <div className="flex-1 flex justify-center items-center max-w-2xl mx-4">
        <SearchBar />
      </div>
      <UserButton />
    </nav>
  );
};
