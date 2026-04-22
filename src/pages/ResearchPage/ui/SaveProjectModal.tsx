import { zodResolver } from '@hookform/resolvers/zod';
import { clsx } from 'clsx';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { ErrorMessage } from '@/shared/ui/ErrorMessage';
import { Modal } from '@/shared/ui/Modal';

import '@/features/authorization/ui/styles/auth-form.scss';
import './save-project-modal.scss';

const SaveProjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, 'Название должно содержать от 3 до 40 символов')
    .max(40, 'Название должно содержать от 3 до 40 символов'),
  comment: z.string().max(500, 'Комментарий не должен превышать 500 символов'),
});

export type SaveProjectValues = z.infer<typeof SaveProjectSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (values: SaveProjectValues) => void;
}

export const SaveProjectModal = ({ open, onOpenChange, onSave }: Props) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SaveProjectValues>({
    resolver: zodResolver(SaveProjectSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: { name: '', comment: '' },
  });

  const handleFormSubmit = (values: SaveProjectValues) => {
    onSave?.(values);
    reset();
    onOpenChange(false);
  };

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next);
    if (!next) {
      reset();
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={handleOpenChange}
      title="Сохранить исследование"
      description="Форма сохранения исследования"
      className="dialog--auth save-project-modal"
      showCloseButton={false}
    >
      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className="auth-form save-project-form"
        noValidate
      >
        <div className="auth-form__field">
          <label className="auth-form__label" htmlFor="project-name">
            Название проекта
          </label>
          <input
            className={clsx('auth-form__input', {
              'auth-form__input--error': errors.name,
            })}
            {...register('name')}
            type="text"
            id="project-name"
            placeholder="от 3 до 40 символов"
            autoComplete="off"
            aria-invalid={Boolean(errors.name)}
          />
          <ErrorMessage message={errors.name?.message} className="auth-form__error" />
        </div>

        <div className="auth-form__field">
          <label className="auth-form__label" htmlFor="project-comment">
            Комментарий к проекту
          </label>
          <textarea
            className={clsx('auth-form__input', 'save-project-form__textarea', {
              'auth-form__input--error': errors.comment,
            })}
            {...register('comment')}
            id="project-comment"
            placeholder="до 500 символов"
            rows={5}
            aria-invalid={Boolean(errors.comment)}
          />
          <ErrorMessage message={errors.comment?.message} className="auth-form__error" />
        </div>

        <button type="submit" className="auth-form__submit">
          Сохранить
        </button>
      </form>
    </Modal>
  );
};
