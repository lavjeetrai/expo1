import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Classroom from '@/models/Classroom';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const classroomId = searchParams.get('classroomId');

    if (!classroomId) {
      return NextResponse.json({ error: 'classroomId is required' }, { status: 400 });
    }

    await connectToDatabase();

    const classroom = await Classroom.findById(classroomId);
    if (!classroom) {
      return NextResponse.json({ error: 'Classroom not found' }, { status: 404 });
    }

    // Fetch user details for all student emails in this classroom
    const students = await User.find(
      { email: { $in: classroom.students } },
      { email: 1, name: 1, registrationNumber: 1, course: 1, section: 1, createdAt: 1 }
    ).lean();

    return NextResponse.json(students, { status: 200 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Internal Server Error';
    console.error('Student details API error:', error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
