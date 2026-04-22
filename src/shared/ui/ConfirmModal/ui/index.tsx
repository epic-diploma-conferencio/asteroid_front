import type { ReactNode } from 'react';

import { Button } from '@/shared/ui/Button';
import { Modal } from '@/shared/ui/Modal';

import './confirm-modal.scss';

export type ConfirmVariant = 'danger' | 'dark';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  message: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  confirmVariant?: ConfirmVariant;
}

export const ConfirmModal = ({
  open,
  onOpenChange,
  onConfirm,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Отмена',
  confirmVariant = 'danger',
}: Props) => (
  <Modal
    open={open}
    onOpenChange={onOpenChange}
    title={title}
    description={title}
    className="confirm-modal"
    showCloseButton={false}
  >
    <div className="confirm-modal__body">
      <h2 className="confirm-modal__title">{title}</h2>
      <p className="confirm-modal__text">{message}</p>
      <div className="confirm-modal__actions">
        <Button
          variant="secondary"
          className="confirm-modal__cancel"
          onClick={() => onOpenChange(false)}
        >
          {cancelLabel}
        </Button>
        <Button
          className={`confirm-modal__confirm confirm-modal__confirm--${confirmVariant}`}
          onClick={onConfirm}
        >
          {confirmLabel}
        </Button>
      </div>
    </div>
  </Modal>
);
