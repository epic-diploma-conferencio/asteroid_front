import clsx from 'clsx';
import type { ReactNode } from 'react';
import './text.scss';

type Style =
  | 'HeadingGrande'
  | 'Heading'
  | 'MicroHeading'
  | 'UnderHeadingGrande'
  | 'UnderHeading'
  | 'UnderMicroHeading'
  | 'MessageText';

interface TextProps {
  style: Style;
  children: ReactNode;
  className?: string;
}

export const Text = ({ style, children, className }: TextProps) =>
  style === 'HeadingGrande' ? (
    <h1 className={clsx('big-heading', className)}>{children}</h1>
  ) : style === 'Heading' ? (
    <h3 className={clsx('heading', className)}>{children}</h3>
  ) : style === 'MicroHeading' ? (
    <h6 className={clsx('micro-heading', className)}>{children}</h6>
  ) : style === 'UnderHeadingGrande' ? (
    <p className={clsx('under-big-heading', className)}>{children}</p>
  ) : style === 'UnderHeading' ? (
    <p className={clsx('under-heading', className)}>{children}</p>
  ) : style === 'UnderMicroHeading' ? (
    <p className={clsx('under-micro-heading', className)}>{children}</p>
  ) : (
    <span className={clsx('message-text', className)}>{children}</span>
  );
