import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from '@/lib/utils/cx';
import styles from './Button.module.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  fullWidth?: boolean;
}

export function Button({
  children,
  className,
  variant = 'primary',
  fullWidth = false,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={cx(styles.button, styles[variant], fullWidth && styles.fullWidth, className)}
    >
      {children}
    </button>
  );
}
