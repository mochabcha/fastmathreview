'use client';

import { Heading, Stack, Text } from '@/components/atoms';
import type { AssessmentDefinition } from '@/types/assessment';
import styles from './AssessmentEntryScreen.module.css';

export function AssessmentEntryScreen({
  assessment,
  onStartReview,
  onStartTesting,
}: {
  assessment: AssessmentDefinition;
  onStartReview: () => void;
  onStartTesting: () => void;
}) {
  return (
    <section className={styles.screen}>
      <div className={styles.center}>
        <Stack gap="var(--space-6)">
          <div className={styles.header}>
            <Text className={styles.kicker}>Florida Grade 4</Text>
            <Heading as="h1" size="lg">
              {assessment.title}
            </Heading>
            <Text tone="soft">{assessment.subtitle}</Text>
          </div>

          <div className={styles.modeList}>
            <button type="button" className={styles.modeButton} onClick={onStartReview}>
              <span>Review Mode</span>
              <small>Checks on next. Wrong answers open help and must be fixed before moving on.</small>
            </button>
            <button type="button" className={styles.modeButton} onClick={onStartTesting}>
              <span>Testing Mode</span>
              <small>Moves freely question to question. Everything is graded and reviewed at the end.</small>
            </button>
          </div>

          <Text className={styles.sourceNote} tone="soft">
            {assessment.sourceNote}
          </Text>
        </Stack>
      </div>
    </section>
  );
}
