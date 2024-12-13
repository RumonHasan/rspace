'use client';
import { ResponsiveModal } from '@/components/responsive-modal';

import { CreateProjectForm } from './create-project-form';
import { useCreateProjectsModal } from '../hooks/use-create-projects-modal';

export const CreateProjectModal = () => {
  const { isOpen, setIsOpen, close } = useCreateProjectsModal();
  // oncancel is passed down
  return (
    <ResponsiveModal open={isOpen} onOpenChange={setIsOpen}>
      <CreateProjectForm onCancel={close} />
    </ResponsiveModal>
  );
};
