import { MathText } from '@/components/atoms';
import { cx } from '@/lib/utils/cx';
import styles from './QuestionOption.module.css';

export function QuestionOption({
  label,
  content,
  selected,
  reviewState = 'neutral',
  onClick,
}: {
  label: string;
  content: string;
  selected: boolean;
  reviewState?: 'neutral' | 'correct' | 'incorrect';
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={cx(
        styles.option,
        selected && styles.selected,
        reviewState === 'correct' && styles.correct,
        reviewState === 'incorrect' && styles.incorrect,
      )}
      onClick={onClick}
    >
      <span className={styles.label}>{label}</span>
      <span className={styles.content}>
        <MathText text={content} />
      </span>
    </button>
  );
}
