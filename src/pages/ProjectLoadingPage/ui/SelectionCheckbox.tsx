import * as Checkbox from '@radix-ui/react-checkbox';
import type { CheckedState } from '@radix-ui/react-checkbox';
import { Check, Minus } from 'lucide-react';

interface Props {
  checked: CheckedState;
  disabled?: boolean;
  onCheckedChange: (checked: CheckedState) => void;
  ariaLabel: string;
}

export const SelectionCheckbox = ({
  checked,
  disabled = false,
  onCheckedChange,
  ariaLabel,
}: Props) => (
  <span className="project-load__checkbox-slot">
    <Checkbox.Root
      className="project-load__checkbox"
      checked={checked}
      disabled={disabled}
      onCheckedChange={onCheckedChange}
      aria-label={ariaLabel}
    >
      <Checkbox.Indicator className="project-load__checkbox-indicator">
        {checked === 'indeterminate' ? (
          <Minus size={14} strokeWidth={2.75} />
        ) : (
          <Check size={14} strokeWidth={2.75} />
        )}
      </Checkbox.Indicator>
    </Checkbox.Root>
  </span>
);
