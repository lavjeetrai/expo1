import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Classroom from '@/models/Classroom';

function generateCode(length = 6): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous chars like 0/O, 1/I
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function POST(req: Request) {
  try {
    const { name, subject, professorEmail, professorName } = await req.json();

    if (!name || !subject || !professorEmail || !professorName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectToDatabase();

    // Generate unique code
    let code = generateCode();
    let attempts = 0;
    while (await Classroom.findOne({ code }) && attempts < 10) {
      code = generateCode();
      attempts++;
    }

    const classroom = await Classroom.create({
      name,
      subject,
      code,
      professorEmail,
      professorName,
    });

    return NextResponse.json(classroom, { status: 201 });
  } catch (error: any) {
    console.error('Create classroom error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
