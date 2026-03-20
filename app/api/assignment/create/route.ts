import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Assignment from '@/models/Assignment';

export async function POST(req: NextRequest) {
  try {
    const { classroomId, title, description, dueDate, attachments } = await req.json();

    if (!classroomId || !title) {
      return NextResponse.json({ error: 'classroomId and title are required' }, { status: 400 });
    }

    await connectToDatabase();

    const assignment = await Assignment.create({
      classroomId,
      title,
      description: description || '',
      dueDate: dueDate || undefined,
      attachments: attachments || [],
    });

    return NextResponse.json(assignment, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Internal Server Error';
    console.error('Create assignment error:', error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
