import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Submission from '@/models/Submission';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const assignmentId = searchParams.get('assignmentId');

    if (!assignmentId) {
      return NextResponse.json({ error: 'assignmentId is required' }, { status: 400 });
    }

    await connectToDatabase();

    const submissions = await Submission.find({ assignmentId })
      .sort({ submittedAt: -1 })
      .lean();

    return NextResponse.json(submissions, { status: 200 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Internal Server Error';
    console.error('List submissions error:', error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
