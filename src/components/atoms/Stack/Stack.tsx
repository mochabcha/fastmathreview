import type { CSSProperties, ElementType, ReactNode } from 'react';
import { cx } from '@/lib/utils/cx';
import styles from './Stack.module.css';

interface StackProps {
  as?: ElementType;
  children: ReactNode;
  gap?: string;
  className?: string;
}

export function Stack({
  as: Component = 'div',
  children,
  gap = 'var(--space-4)',
  className,
}: StackProps) {
  return (
    <Component className={cx(styles.stack, className)} style={{ '--stack-gap': gap } as CSSProperties}>
      {children}
    </Component>
  );
}
