import { Heading, MathText, Text } from '@/components/atoms';
import { formatResponse } from '@/lib/assessment/formatResponse';
import type { AssessmentQuestion, EvaluationResult, QuestionResponseValue } from '@/types/assessment';
import styles from './AnswerFeedbackPanel.module.css';

export function AnswerFeedbackPanel({
  question,
  response,
  evaluation,
}: {
  question: AssessmentQuestion;
  response: QuestionResponseValue | undefined;
  evaluation: EvaluationResult | undefined;
}) {
  if (!evaluation) {
    return null;
  }

  return (
    <section className={styles.panel} data-state={evaluation.isCorrect ? 'correct' : 'incorrect'}>
      <div className={styles.header}>
        <Heading as="h3" size="sm">
          {evaluation.isCorrect ? 'You got it right' : 'Let’s correct it'}
        </Heading>
        <Text tone="soft">{evaluation.isCorrect ? 'Keep that structure in mind for the next one.' : 'Compare your choice to the correct answer below.'}</Text>
      </div>

      <div className={styles.summaryGrid}>
        <div className={styles.summaryBlock}>
          <Text tone="soft">Your answer</Text>
          <Text>
            <MathText text={formatResponse(question, response)} />
          </Text>
        </div>
        <div className={styles.summaryBlock}>
          <Text tone="soft">Correct answer</Text>
          <Text>
            <MathText text={question.answerDisplay} />
          </Text>
        </div>
      </div>

      <div className={styles.explanation}>
        <Text tone="soft">Why</Text>
        <Text>
          <MathText text={question.explanation} />
        </Text>
      </div>
    </section>
  );
}
