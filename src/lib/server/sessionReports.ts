import 'server-only';

import type { AssessmentSessionReport } from '@/types/assessment';
import { getMongoDatabase } from './mongodb';

export async function saveSessionReport(report: AssessmentSessionReport) {
  const database = await getMongoDatabase();
  const collection = database.collection<AssessmentSessionReport & { createdAt: Date }>('sessionReports');
  const result = await collection.insertOne({
    ...report,
    createdAt: new Date(),
  });

  return result.insertedId.toString();
}
