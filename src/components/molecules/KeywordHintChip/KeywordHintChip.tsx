'use client';

import { useState } from 'react';
import { Text } from '@/components/atoms';
import type { KeywordHint } from '@/types/assessment';
import styles from './KeywordHintChip.module.css';

export function KeywordHintChip({
  hint,
}: {
  hint: KeywordHint;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <button
      type="button"
      className={styles.chip}
      data-operation={hint.operation}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onFocus={() => setIsOpen(true)}
      onBlur={() => setIsOpen(false)}
      onClick={() => setIsOpen((current) => !current)}
    >
      <span>{hint.phrase}</span>
      <span className={styles.operationLabel}>{hint.operation}</span>
      {isOpen ? (
        <span className={styles.popover}>
          <Text>{hint.rationale}</Text>
        </span>
      ) : null}
    </button>
  );
}
