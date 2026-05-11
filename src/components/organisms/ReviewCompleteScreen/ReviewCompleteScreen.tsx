'use client';

import { Button, Heading, Stack, Text } from '@/components/atoms';
import styles from './ReviewCompleteScreen.module.css';

export function ReviewCompleteScreen({
  totalQuestions,
  onReturn,
}: {
  totalQuestions: number;
  onReturn: () => void;
}) {
  return (
    <section className={styles.screen}>
      <Stack gap="var(--space-5)">
        <Heading as="h1" size="lg">
          Review complete
        </Heading>
        <Text tone="soft">
          You worked through all {totalQuestions} questions and corrected each one before moving on.
        </Text>
        <Button variant="ghost" onClick={onReturn}>
          Back to modes
        </Button>
      </Stack>
    </section>
  );
}
