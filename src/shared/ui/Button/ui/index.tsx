import { clsx } from 'clsx';
import type { ComponentProps, ReactNode } from 'react';
import './button.scss';

type ButtonStyle = 'primary' | 'secondary' | 'link';
type ButtonType = 'button' | 'submit' | 'reset';

interface ButtonProps extends ComponentProps<'button'> {
  variant?: ButtonStyle;
  type?: ButtonType;
  children: ReactNode;
}
export const Button = ({
  variant = 'primary',
  type = 'button',
  children,
  className,
  onClick,
}: ButtonProps) => (
  <button onClick={onClick} className={clsx(variant, 'button', className)} type={type}>
    {children}
  </button>
);
