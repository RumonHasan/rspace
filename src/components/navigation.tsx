'use client';
import { cn } from '@/lib/utils';
import { SettingsIcon, UsersIcon } from 'lucide-react';
import Link from 'next/link';
import {
  GoCheckCircle,
  GoCheckCircleFill,
  GoHome,
  GoHomeFill,
} from 'react-icons/go';
import { MessageSquareIcon, Globe2Icon } from 'lucide-react';

import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id';
import { usePathname } from 'next/navigation';

const routes = [
  {
    label: 'Home',
    href: '',
    icon: GoHome,
    activeIcon: GoHomeFill,
  },
  {
    label: 'My Tasks',
    href: '/tasks',
    icon: GoCheckCircle,
    activeIcon: GoCheckCircleFill,
  },
  {
    label: 'Discussions',
    href: '/discussions',
    icon: MessageSquareIcon,
    activeIcon: MessageSquareIcon,
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: SettingsIcon,
    activeIcon: SettingsIcon,
  },

  {
    label: 'Members',
    href: '/members',
    icon: UsersIcon,
    activeIcon: UsersIcon,
  },
  // route for searching using sonar api of perplexity
  {
    label: 'RSearch',
    href: '/rsearch',
    icon: Globe2Icon,
    activeIcon: Globe2Icon,
  },
];

const Navigation = () => {
  const workspaceId = useWorkspaceId();
  const pathName = usePathname();

  return (
    <ul className="flex flex-col">
      {routes.map((route) => {
        // will need to redirect to the current route/settings
        const fullHref = `/workspaces/${workspaceId}${route.href}`;
        const isActive = pathName === fullHref;
        const Icon = isActive ? route.activeIcon : route.icon;
        return (
          <Link key={route.href} href={fullHref}>
            <div
              className={cn(
                'flex items-center gap-2.5 p-2.5 rounded-md font-medium hover:text-primary transition text-neutral-500',
                isActive && 'bg-white shadow-sm hover-opacity-100 text-primary'
              )}
            >
              <Icon className="size-5 text-neutral-500" />
              <span>{route.label}</span>
            </div>
          </Link>
        );
      })}
    </ul>
  );
};
export default Navigation;
