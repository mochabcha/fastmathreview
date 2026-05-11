'use client';

import { useMemo, useState } from 'react';
import { Heading, MathText, Text } from '@/components/atoms';
import { SegmentedTabs } from '@/components/molecules';
import type { ReferenceSheet } from '@/types/assessment';
import styles from './ReferenceDrawer.module.css';

export function ReferenceDrawer({
  isOpen,
  references,
  onClose,
}: {
  isOpen: boolean;
  references: ReferenceSheet;
  onClose: () => void;
}) {
  const groups = useMemo(
    () => references.groups.map((group) => ({ id: group.id, label: group.title })),
    [references.groups],
  );
  const [activeGroupId, setActiveGroupId] = useState(references.groups[0]?.id ?? '');
  const activeGroup = references.groups.find((group) => group.id === activeGroupId) ?? references.groups[0];

  return (
    <>
      <button
        type="button"
        aria-label="Close reference drawer"
        className={isOpen ? styles.backdropVisible : styles.backdropHidden}
        onClick={onClose}
      />
      <aside className={isOpen ? styles.drawerOpen : styles.drawerClosed}>
        <div className={styles.header}>
          <div>
            <Heading as="h2" size="sm">
              {references.title}
            </Heading>
            <Text tone="soft">Quick formulas and conversions without leaving the question.</Text>
          </div>
          <button type="button" className={styles.close} onClick={onClose}>
            Close
          </button>
        </div>

        <SegmentedTabs items={groups} activeId={activeGroup?.id ?? ''} onChange={setActiveGroupId} />

        <div className={styles.content}>
          {activeGroup ? (
            <section className={styles.group}>
              <Heading as="h3" size="sm">
                {activeGroup.title}
              </Heading>
              <ul className={styles.list}>
                {activeGroup.items.map((item) => (
                  <li key={item}>
                    <MathText text={item} />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </aside>
    </>
  );
}
