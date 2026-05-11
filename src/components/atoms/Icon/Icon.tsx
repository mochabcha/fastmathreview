import { cx } from '@/lib/utils/cx';
import styles from './Icon.module.css';

const paths = {
  arrowLeft: 'M14.25 5.25L7.5 12l6.75 6.75M8.25 12h12',
  arrowRight: 'M9.75 5.25L16.5 12l-6.75 6.75M15.75 12h-12',
  book: 'M5.25 6.75A2.25 2.25 0 0 1 7.5 4.5h11.25v15H7.5a2.25 2.25 0 0 0-2.25 2.25V6.75Zm0 0A2.25 2.25 0 0 0 3 9v10.5h15.75',
  spark: 'M12 3.75l1.912 4.338 4.338 1.912-4.338 1.912L12 16.25l-1.912-4.338-4.338-1.912 4.338-1.912L12 3.75Z',
} as const;

export type IconName = keyof typeof paths;

export function Icon({
  name,
  className,
}: {
  name: IconName;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={cx(styles.icon, className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={paths[name]} />
    </svg>
  );
}
