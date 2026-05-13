import { MongoClient } from 'mongodb';
import assessment from '../src/content/assessments/grade4-fast-review.json' with { type: 'json' };
import questionHelp from '../src/content/review/grade4-fast-question-help.json' with { type: 'json' };
import problemSupport from '../src/content/review/grade4-fast-problem-support.json' with { type: 'json' };
import operationKeywords from '../src/content/review/grade4-fast-operation-keywords.json' with { type: 'json' };
import references from '../src/content/reference/grade4-fast-reference.json' with { type: 'json' };
import standards from '../src/content/standards/grade4-fast-standards.json' with { type: 'json' };
import questionTemplates from '../src/content/templates/grade4-fast-question-formats.json' with { type: 'json' };

const mongoUri = process.env.MONGODB_URI;
const databaseName = process.env.MONGODB_DB || 'fastmathreview';

if (!mongoUri) {
  throw new Error('MONGODB_URI is not configured');
}

const contentDocuments = [
  { key: 'assessment:grade4-fast-review', value: assessment },
  { key: 'standards:grade4-fast-standards', value: standards },
  { key: 'references:grade4-fast-reference', value: references },
  { key: 'question-help:grade4-fast-question-help', value: questionHelp },
  { key: 'problem-support:grade4-fast-problem-support', value: problemSupport },
  { key: 'keyword-catalog:grade4-fast-operation-keywords', value: operationKeywords },
  { key: 'question-templates:grade4-fast-question-formats', value: questionTemplates },
];

const client = new MongoClient(mongoUri);

try {
  await client.connect();

  const database = client.db(databaseName);
  const collection = database.collection('content');
  const now = new Date();

  await collection.bulkWrite(
    contentDocuments.map((document) => ({
      updateOne: {
        filter: { key: document.key },
        update: {
          $set: {
            value: document.value,
            updatedAt: now,
          },
        },
        upsert: true,
      },
    })),
  );

  const storedDocuments = await collection
    .find(
      {
        key: {
          $in: contentDocuments.map((document) => document.key),
        },
      },
      {
        projection: { _id: 0, key: 1, updatedAt: 1 },
      },
    )
    .sort({ key: 1 })
    .toArray();

  console.log(JSON.stringify({ databaseName, storedDocuments }, null, 2));
} finally {
  await client.close();
}
