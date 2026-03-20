import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Classroom from '@/models/Classroom';

export async function POST(req: Request) {
  try {
    const { code, studentEmail } = await req.json();

    if (!code || !studentEmail) {
      return NextResponse.json({ error: 'Code and student email are required' }, { status: 400 });
    }

    await connectToDatabase();

    const classroom = await Classroom.findOne({ code: code.toUpperCase().trim() });
    if (!classroom) {
      return NextResponse.json({ error: 'Classroom not found. Check the code and try again.' }, { status: 404 });
    }

    // Add student if not already in the classroom
    if (!classroom.students.includes(studentEmail)) {
      classroom.students.push(studentEmail);
      await classroom.save();
    }

    return NextResponse.json(classroom, { status: 200 });
  } catch (error: any) {
    console.error('Join classroom error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
