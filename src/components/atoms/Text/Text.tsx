import type { ElementType, ReactNode } from 'react';
import { cx } from '@/lib/utils/cx';
import styles from './Text.module.css';

interface TextProps {
  as?: ElementType;
  children: ReactNode;
  tone?: 'default' | 'soft';
  className?: string;
}

export function Text({
  as: Component = 'p',
  children,
  tone = 'default',
  className,
}: TextProps) {
  return <Component className={cx(styles.text, styles[tone], className)}>{children}</Component>;
}
