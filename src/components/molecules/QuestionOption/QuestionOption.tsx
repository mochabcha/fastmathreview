import { MathText } from '@/components/atoms';
import { cx } from '@/lib/utils/cx';
import styles from './QuestionOption.module.css';

export function QuestionOption({
  label,
  content,
  selected,
  onClick,
}: {
  label: string;
  content: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" className={cx(styles.option, selected && styles.selected)} onClick={onClick}>
      <span className={styles.label}>{label}</span>
      <span className={styles.content}>
        <MathText text={content} />
      </span>
    </button>
  );
}
