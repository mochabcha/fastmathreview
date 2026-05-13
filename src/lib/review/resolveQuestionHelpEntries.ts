import type {
  AssessmentQuestion,
  KeywordHint,
  OperationKeywordCatalog,
  PartialQuestionHelpEntryMap,
  QuestionHelpEntry,
  QuestionHelpEntryMap,
} from '@/types/assessment';

type BasicOperationHint = 'addition' | 'subtraction' | 'multiplication' | 'division';

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function dedupeKeywords(keywords: KeywordHint[]) {
  const seen = new Set<string>();

  return keywords.filter((keyword) => {
    const normalized = keyword.phrase.trim().toLowerCase();

    if (seen.has(normalized)) {
      return false;
    }

    seen.add(normalized);
    return true;
  });
}

function includesPhrase(text: string, phrase: string) {
  return new RegExp(escapeRegExp(phrase), 'i').test(text);
}

function detectPrimaryOperation(question: AssessmentQuestion, questionHelp: Partial<QuestionHelpEntry>): BasicOperationHint | null {
  const text = [question.prompt, ...(question.contextLines ?? []), questionHelp.mathSetup ?? '', questionHelp.translation ?? '']
    .join(' ')
    .toLowerCase();

  if (
    /÷|divide|division|quotient|remainder|equally|shared|share|split|full groups/.test(text)
  ) {
    return 'division';
  }

  if (
    /subtract|subtraction|difference|remaining|remain|left|change|less than|take away|\s-\s/.test(text)
  ) {
    return 'subtraction';
  }

  if (
    /×|multiply|multiplication|product|times|twice|double|for each|in each|of each|equal-price|groups of|per /.test(text)
  ) {
    return 'multiplication';
  }

  if (
    /\+|add|addition|sum|altogether|in all|combine|combined|together|total amount/.test(text)
  ) {
    return 'addition';
  }

  return null;
}

function matchKeywordEntries(
  texts: string[],
  entries: { phrase: string; rationale: string }[],
  operation: BasicOperationHint,
): KeywordHint[] {
  return entries
    .filter((entry) => texts.some((text) => includesPhrase(text, entry.phrase)))
    .map((entry) => ({
      phrase: entry.phrase,
      rationale: entry.rationale,
      operation,
    }));
}

function getAutoKeywords(
  question: AssessmentQuestion,
  questionHelp: Partial<QuestionHelpEntry>,
  keywordCatalog: OperationKeywordCatalog,
): KeywordHint[] {
  const primaryOperation = detectPrimaryOperation(question, questionHelp);

  if (!primaryOperation) {
    return [];
  }

  const texts = [question.prompt, ...(question.contextLines ?? [])];
  const operationKeywords = matchKeywordEntries(texts, keywordCatalog[primaryOperation], primaryOperation);
  const equalGroupKeywords =
    primaryOperation === 'multiplication' || primaryOperation === 'division'
      ? matchKeywordEntries(texts, keywordCatalog.equalGroups, primaryOperation)
      : [];

  return dedupeKeywords([...operationKeywords, ...equalGroupKeywords]);
}

export function resolveQuestionHelpEntries({
  questions,
  helpEntries,
  supportEntries,
  keywordCatalog,
}: {
  questions: AssessmentQuestion[];
  helpEntries: QuestionHelpEntryMap;
  supportEntries: PartialQuestionHelpEntryMap;
  keywordCatalog: OperationKeywordCatalog;
}) {
  return questions.reduce<QuestionHelpEntryMap>((accumulator, question) => {
    const helpEntry = helpEntries[question.id];
    const supportEntry = supportEntries[question.id];
    const composedHelp = {
      ...(helpEntry ?? { mathSetup: '', translation: '' }),
      ...(supportEntry ?? {}),
    };
    const autoKeywords = getAutoKeywords(question, composedHelp, keywordCatalog);
    const mergedKeywords = dedupeKeywords([...(supportEntry?.keywords ?? []), ...autoKeywords]);

    if (!helpEntry && !supportEntry && !mergedKeywords.length) {
      return accumulator;
    }

    accumulator[question.id] = {
      mathSetup: composedHelp.mathSetup ?? '',
      translation: composedHelp.translation ?? '',
      ...(supportEntry?.guidedSteps ? { guidedSteps: supportEntry.guidedSteps } : {}),
      ...(mergedKeywords.length ? { keywords: mergedKeywords } : {}),
    };

    return accumulator;
  }, {});
}
