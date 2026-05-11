import type { ReactNode } from 'react';
import styles from './MathText.module.css';

function renderFraction(rawValue: string, key: string) {
  const mixedMatch = rawValue.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  const simpleMatch = rawValue.match(/^(\d+)\/(\d+)$/);

  if (mixedMatch) {
    return (
      <span key={key} className={styles.mixed}>
        <span>{mixedMatch[1]}</span>
        <span className={styles.fraction}>
          <span>{mixedMatch[2]}</span>
          <span>{mixedMatch[3]}</span>
        </span>
      </span>
    );
  }

  if (simpleMatch) {
    return (
      <span key={key} className={styles.fraction}>
        <span>{simpleMatch[1]}</span>
        <span>{simpleMatch[2]}</span>
      </span>
    );
  }

  return rawValue;
}

function normalizeSegment(segment: string) {
  return segment
    .replace(/ x /g, ' × ')
    .replace(/(\d+)\s+degrees/g, '$1°')
    .replace(/(\d+)-degree/g, '$1°');
}

export function MathText({ text }: { text: string }) {
  const parts = text.split(/(\d+\s+\d+\/\d+|\d+\/\d+)/g);

  const content = parts.flatMap((part, index): ReactNode[] => {
    if (!part) {
      return [];
    }

    if (/^\d+\s+\d+\/\d+$/.test(part) || /^\d+\/\d+$/.test(part)) {
      return [renderFraction(part, `${part}-${index}`)];
    }

    return [normalizeSegment(part)];
  });

  return <span className={styles.mathText}>{content}</span>;
}
