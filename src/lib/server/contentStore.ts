import 'server-only';

import type { AssessmentDefinition, ReferenceSheet, StandardDefinition } from '@/types/assessment';
import { getMongoDatabase, isMongoConfigured } from './mongodb';

interface ContentDocument<T> {
  key: string;
  value: T;
  updatedAt: Date;
}

async function getBootstrappedContent<T>(key: string, fallbackValue: T): Promise<T> {
  if (!isMongoConfigured()) {
    return fallbackValue;
  }

  try {
    const database = await getMongoDatabase();
    const collection = database.collection<ContentDocument<T>>('content');
    const existing = await collection.findOne({ key });

    if (existing) {
      return existing.value;
    }

    await collection.insertOne({
      key,
      value: fallbackValue,
      updatedAt: new Date(),
    });

    return fallbackValue;
  } catch {
    return fallbackValue;
  }
}

export async function getAssessmentContent(fallbackValue: AssessmentDefinition) {
  return getBootstrappedContent('assessment:grade4-fast-review', fallbackValue);
}

export async function getStandardsContent(fallbackValue: StandardDefinition[]) {
  return getBootstrappedContent('standards:grade4-fast-standards', fallbackValue);
}

export async function getReferenceContent(fallbackValue: ReferenceSheet) {
  return getBootstrappedContent('references:grade4-fast-reference', fallbackValue);
}
