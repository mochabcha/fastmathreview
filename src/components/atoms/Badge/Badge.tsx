import type { ReactNode } from 'react';
import { cx } from '@/lib/utils/cx';
import styles from './Badge.module.css';

export function Badge({
  children,
  tone = 'default',
}: {
  children: ReactNode;
  tone?: 'default' | 'accent' | 'success' | 'danger';
}) {
  return <span className={cx(styles.badge, styles[tone])}>{children}</span>;
}
