import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import StudentActivity from '@/models/StudentActivity';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const classroomId = searchParams.get('classroomId');
    const studentEmail = searchParams.get('studentEmail');

    if (!classroomId || !studentEmail) {
      return NextResponse.json({ error: 'classroomId and studentEmail are required' }, { status: 400 });
    }

    await connectToDatabase();

    // Fetch questions only (not submissions) for this student in this classroom
    const history = await StudentActivity.find({
      classroomId,
      studentEmail,
      type: 'question',
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return NextResponse.json(history);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Internal Server Error';
    console.error('History API error:', error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
