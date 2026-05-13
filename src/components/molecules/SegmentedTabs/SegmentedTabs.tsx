'use client';

import { cx } from '@/lib/utils/cx';
import styles from './SegmentedTabs.module.css';

interface SegmentedTabItem {
  id: string;
  label: string;
  tone?: 'default' | 'correct' | 'incorrect';
}

export function SegmentedTabs({
  items,
  activeId,
  onChange,
  className,
}: {
  items: SegmentedTabItem[];
  activeId: string;
  onChange: (nextId: string) => void;
  className?: string;
}) {
  return (
    <div className={cx(styles.tabs, className)} role="tablist" aria-label="Panel switcher">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          role="tab"
          aria-selected={item.id === activeId}
          className={cx(
            styles.tab,
            item.tone === 'correct' && styles.correct,
            item.tone === 'incorrect' && styles.incorrect,
            item.id === activeId && styles.active,
          )}
          onClick={() => onChange(item.id)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
