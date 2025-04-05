import NotesSidebar from '@/features/notes/components/notes-sidebar';

interface NotebookLayoutProps {
  children: React.ReactNode;
}

export default function NotesLayout({ children }: NotebookLayoutProps) {
  return (
    <div className="flex h-screen">
      <div className="w-1/5 border-r">
        <NotesSidebar />
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}
