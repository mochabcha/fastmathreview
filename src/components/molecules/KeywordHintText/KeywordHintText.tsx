'use client';

import { MathText, Text } from '@/components/atoms';
import type { KeywordHint } from '@/types/assessment';
import styles from './KeywordHintText.module.css';

interface TextSegment {
  type: 'plain' | 'hint';
  content: string;
  hint?: KeywordHint;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildSegments(text: string, hints: KeywordHint[]): TextSegment[] {
  if (!hints.length) {
    return [{ type: 'plain', content: text }];
  }

  const orderedHints = [...hints].sort((left, right) => right.phrase.length - left.phrase.length);
  const segments: TextSegment[] = [];
  let cursor = 0;

  while (cursor < text.length) {
    let matchedHint: KeywordHint | undefined;
    let matchedValue = '';

    for (const hint of orderedHints) {
      const pattern = new RegExp(`^${escapeRegExp(hint.phrase)}`, 'i');
      const result = text.slice(cursor).match(pattern);

      if (result) {
        matchedHint = hint;
        matchedValue = result[0];
        break;
      }
    }

    if (matchedHint) {
      segments.push({
        type: 'hint',
        content: matchedValue,
        hint: matchedHint,
      });
      cursor += matchedValue.length;
      continue;
    }

    let nextCursor = cursor + 1;
    while (nextCursor < text.length) {
      const upcomingText = text.slice(nextCursor);
      const hasUpcomingHint = orderedHints.some((hint) =>
        new RegExp(`^${escapeRegExp(hint.phrase)}`, 'i').test(upcomingText),
      );

      if (hasUpcomingHint) {
        break;
      }

      nextCursor += 1;
    }

    segments.push({
      type: 'plain',
      content: text.slice(cursor, nextCursor),
    });
    cursor = nextCursor;
  }

  return segments;
}

export function KeywordHintText({
  text,
  hints,
}: {
  text: string;
  hints?: KeywordHint[];
}) {
  const segments = buildSegments(text, hints ?? []);

  return (
    <>
      {segments.map((segment, index) => {
        if (segment.type === 'plain') {
          return <MathText key={`${segment.content}-${index}`} text={segment.content} />;
        }

        return (
          <span
            key={`${segment.content}-${index}`}
            className={styles.highlight}
            data-operation={segment.hint?.operation}
            tabIndex={0}
          >
            <strong>
              <MathText text={segment.content} />
            </strong>
            <span className={styles.popover}>
              <Text as="span">{segment.hint?.rationale}</Text>
            </span>
          </span>
        );
      })}
    </>
  );
}
