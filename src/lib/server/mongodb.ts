import 'server-only';

import { MongoClient } from 'mongodb';

declare global {
  var __fastMathMongoClientPromise__: Promise<MongoClient> | undefined;
}

function getMongoUri() {
  return process.env.MONGODB_URI;
}

export function isMongoConfigured() {
  return Boolean(getMongoUri());
}

export async function getMongoClient() {
  const mongoUri = getMongoUri();

  if (!mongoUri) {
    throw new Error('MONGODB_URI is not configured');
  }

  if (!global.__fastMathMongoClientPromise__) {
    const client = new MongoClient(mongoUri);
    global.__fastMathMongoClientPromise__ = client.connect();
  }

  return global.__fastMathMongoClientPromise__;
}

export async function getMongoDatabase() {
  const client = await getMongoClient();
  return client.db(process.env.MONGODB_DB || 'fastmathreview');
}
