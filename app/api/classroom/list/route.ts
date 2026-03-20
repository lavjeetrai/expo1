import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Classroom from '@/models/Classroom';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role');
    const email = searchParams.get('email');

    if (!role || !email) {
      return NextResponse.json({ error: 'role and email are required' }, { status: 400 });
    }

    await connectToDatabase();

    let classrooms;
    if (role === 'professor') {
      classrooms = await Classroom.find({ professorEmail: email }).sort({ createdAt: -1 });
    } else {
      classrooms = await Classroom.find({ students: email }).sort({ createdAt: -1 });
    }

    return NextResponse.json(classrooms, { status: 200 });
  } catch (error: any) {
    console.error('List classrooms error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
