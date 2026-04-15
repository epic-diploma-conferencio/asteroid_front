import * as Dialog from '@radix-ui/react-dialog';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';

import './modal.scss';

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  showCloseButton?: boolean;
}

export const Modal = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  showCloseButton = true,
}: ModalProps) => (
  <Dialog.Root open={open} onOpenChange={onOpenChange}>
    <Dialog.Portal>
      <Dialog.Overlay className="dialog-overlay" />
      <Dialog.Content className="dialog" onOpenAutoFocus={(e) => e.preventDefault()}>
        <VisuallyHidden.Root asChild>
          <Dialog.Title>{title}</Dialog.Title>
        </VisuallyHidden.Root>
        {description && (
          <VisuallyHidden.Root asChild>
            <Dialog.Description>{description}</Dialog.Description>
          </VisuallyHidden.Root>
        )}
        {children}
        {showCloseButton && (
          <Dialog.Close asChild>
            <button className="dialog__close" aria-label="Закрыть">
              <X size={24} strokeWidth={3} />
            </button>
          </Dialog.Close>
        )}
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
);
