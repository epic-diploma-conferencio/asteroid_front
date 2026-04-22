import { Button } from '@/shared/ui/Button';
import { Modal } from '@/shared/ui/Modal';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export const DeleteConfirmModal = ({ open, onOpenChange, onConfirm }: Props) => (
  <Modal
    open={open}
    onOpenChange={onOpenChange}
    title="Удалить исследование?"
    description="Подтверждение удаления сохранённого исследования"
    className="saved-confirm"
    showCloseButton={false}
  >
    <div className="saved-confirm__body">
      <h2 className="saved-confirm__title">Удалить исследование?</h2>
      <p className="saved-confirm__text">
        Вы действительно хотите удалить исследование? Все несохраненные данные о нем будут утеряны!
      </p>
      <div className="saved-confirm__actions">
        <Button variant="secondary" className="otmena" onClick={() => onOpenChange(false)}>
          Отмена
        </Button>
        <Button className="saved-confirm__delete" onClick={onConfirm}>
          Удалить
        </Button>
      </div>
    </div>
  </Modal>
);
