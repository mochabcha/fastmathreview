import type { ElementType, ReactNode } from 'react';
import { cx } from '@/lib/utils/cx';
import styles from './Surface.module.css';

interface SurfaceProps {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  tone?: 'default' | 'tint' | 'strong';
}

export function Surface({
  as: Component = 'section',
  children,
  className,
  tone = 'default',
}: SurfaceProps) {
  return <Component className={cx(styles.surface, styles[tone], className)}>{children}</Component>;
}
