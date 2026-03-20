import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Assignment from '@/models/Assignment';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const classroomId = searchParams.get('classroomId');

    if (!classroomId) {
      return NextResponse.json({ error: 'classroomId is required' }, { status: 400 });
    }

    await connectToDatabase();

    const assignments = await Assignment.find({ classroomId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(assignments, { status: 200 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Internal Server Error';
    console.error('List assignments error:', error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
