import type { ElementType, ReactNode } from 'react';
import { cx } from '@/lib/utils/cx';
import styles from './Heading.module.css';

interface HeadingProps {
  as?: ElementType;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  className?: string;
}

export function Heading({
  as: Component = 'h2',
  children,
  size = 'md',
  className,
}: HeadingProps) {
  return <Component className={cx(styles.heading, styles[size], className)}>{children}</Component>;
}
