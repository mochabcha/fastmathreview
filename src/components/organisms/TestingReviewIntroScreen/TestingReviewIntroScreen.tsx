'use client';

import { Button, Heading, Stack, Text } from '@/components/atoms';
import styles from './TestingReviewIntroScreen.module.css';

export function TestingReviewIntroScreen({
  correctCount,
  totalQuestions,
  onContinue,
}: {
  correctCount: number;
  totalQuestions: number;
  onContinue: () => void;
}) {
  return (
    <section className={styles.screen}>
      <div className={styles.panel}>
        <Stack gap="var(--space-5)">
          <div className={styles.header}>
            <Text tone="soft">Testing complete</Text>
            <Heading as="h1" size="lg">
              The exam is finished.
            </Heading>
            <Text tone="soft">
              You answered {correctCount} of {totalQuestions} correctly. Next, we’ll review each question and show what was right, what was wrong, and why.
            </Text>
          </div>
          <Button onClick={onContinue}>Start review</Button>
        </Stack>
      </div>
    </section>
  );
}
