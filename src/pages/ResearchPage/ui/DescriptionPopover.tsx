import * as Popover from '@radix-ui/react-popover';
import { FileText } from 'lucide-react';

import './description-popover.scss';

interface Props {
  description: string | null;
}

export const DescriptionPopover = ({ description }: Props) => {
  const hasDescription = Boolean(description && description.trim().length);

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button type="button" className="description-trigger">
          <FileText size={18} strokeWidth={2.5} />
          Описание
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="description-popover"
          side="bottom"
          align="end"
          sideOffset={10}
          collisionPadding={16}
        >
          <h4 className="description-popover__title">Описание исследования</h4>
          {hasDescription ? (
            <p className="description-popover__text">{description}</p>
          ) : (
            <p className="description-popover__empty">
              Описание не указано. Нажмите «Редактировать», чтобы добавить.
            </p>
          )}
          <Popover.Arrow className="description-popover__arrow" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};
