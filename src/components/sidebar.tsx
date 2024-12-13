import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import Link from 'next/link';
import Navigation from './navigation';
import { WorkspaceSwitcher } from './workspace-switcher';
import { Projects } from './projects';

export const Sidebar = () => {
  return (
    <aside className="h-full bg-neutral-100 p-4 w-full">
      <Link href="/">
        <Image src="/logo.svg" alt="logo" width={40} height={40} />
      </Link>
      <Separator className="my-4" />
      <WorkspaceSwitcher />
      <Separator className="my-4" />
      <Navigation />
      <Separator className="my-4" />
      <Projects />
    </aside>
  );
};
