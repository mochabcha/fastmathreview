import type { CSSProperties, ElementType, ReactNode } from 'react';
import { cx } from '@/lib/utils/cx';
import styles from './Cluster.module.css';

interface ClusterProps {
  as?: ElementType;
  children: ReactNode;
  gap?: string;
  className?: string;
}

export function Cluster({
  as: Component = 'div',
  children,
  gap = 'var(--space-3)',
  className,
}: ClusterProps) {
  return (
    <Component className={cx(styles.cluster, className)} style={{ '--cluster-gap': gap } as CSSProperties}>
      {children}
    </Component>
  );
}
