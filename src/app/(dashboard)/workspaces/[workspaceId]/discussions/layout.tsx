import ChannelSidebar from '@/features/channels/components/channels-sidebar';

interface ChannelLayoutProps {
  children: React.ReactNode;
}

const ChannelLayout = async ({ children }: ChannelLayoutProps) => {
  return (
    <div className="flex w-full h-full gap-2">
      <div className="hidden md:block w-[260px] min-w-[260px]">
        <ChannelSidebar />
      </div>
      <div className="flex-1 h-full">
        <main className="w-full h-full">{children}</main>
      </div>
    </div>
  );
};

export default ChannelLayout;
