import clsx from 'clsx';
import type { ReactNode } from 'react';
import './badge.scss';

type BadgeColor = 'blue' | 'red';

export const Badge = ({
  color = 'blue',
  rounded = false,
  children,
}: {
  color?: BadgeColor;
  rounded?: boolean;
  children: ReactNode;
}) => <div className={clsx('badge', color, { rounded })}>{children}</div>;
