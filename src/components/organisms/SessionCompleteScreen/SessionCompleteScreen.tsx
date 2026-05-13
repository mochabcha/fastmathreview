'use client';

import { Button, Heading, Stack, Text } from '@/components/atoms';
import styles from './SessionCompleteScreen.module.css';

export function SessionCompleteScreen({
  mode,
  correctCount,
  totalQuestions,
  reportState,
  onReturn,
}: {
  mode: 'review' | 'testing';
  correctCount: number;
  totalQuestions: number;
  reportState: {
    status: 'idle' | 'saving' | 'saved' | 'error';
    reportId?: string;
  };
  onReturn: () => void;
}) {
  const statusCopy =
    reportState.status === 'saving'
      ? 'Saving session report...'
      : reportState.status === 'saved'
        ? `Session report saved${reportState.reportId ? ` as ${reportState.reportId}` : '.'}`
        : reportState.status === 'error'
          ? 'Session report could not be saved.'
          : 'Session report is ready.';

  return (
    <section className={styles.screen}>
      <div className={styles.panel}>
        <Stack gap="var(--space-5)">
          <div className={styles.header}>
            <Text tone="soft">{mode === 'testing' ? 'Testing review complete' : 'Review complete'}</Text>
            <Heading as="h1" size="lg">
              Session complete
            </Heading>
            <Text tone="soft">
              Final score: {correctCount} out of {totalQuestions}.
            </Text>
            <Text tone="soft">{statusCopy}</Text>
          </div>
          <Button onClick={onReturn}>Back to modes</Button>
        </Stack>
      </div>
    </section>
  );
}
