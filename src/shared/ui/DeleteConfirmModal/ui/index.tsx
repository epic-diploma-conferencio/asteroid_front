import { ConfirmModal } from '@/shared/ui/ConfirmModal';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export const DeleteConfirmModal = ({ open, onOpenChange, onConfirm }: Props) => (
  <ConfirmModal
    open={open}
    onOpenChange={onOpenChange}
    onConfirm={onConfirm}
    title="Удалить исследование?"
    message="Вы действительно хотите удалить исследование? Все несохраненные данные о нем будут утеряны!"
    confirmLabel="Удалить"
    confirmVariant="danger"
  />
);
