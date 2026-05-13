import { NextResponse } from 'next/server';
import type { AssessmentSessionReport } from '@/types/assessment';
import { isMongoConfigured } from '@/lib/server/mongodb';
import { saveSessionReport } from '@/lib/server/sessionReports';

export async function POST(request: Request) {
  try {
    const report = (await request.json()) as AssessmentSessionReport;

    if (!isMongoConfigured()) {
      return NextResponse.json(
        { error: 'MongoDB is not configured for this deployment.' },
        { status: 503 },
      );
    }

    const reportId = await saveSessionReport(report);

    return NextResponse.json({ reportId });
  } catch {
    return NextResponse.json(
      { error: 'Could not save session report.' },
      { status: 500 },
    );
  }
}
