import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(req: Request) {
  try {
    const { email, password, role, firebaseUid, name, registrationNumber, course, section } = await req.json();

    if (!email || !role) {
      return NextResponse.json({ error: 'Email and role are required' }, { status: 400 });
    }

    await connectToDatabase();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      // If authenticating via Google, we don't treat existing users as errors
      if (firebaseUid) {
        return NextResponse.json({ message: 'User verified via Google', user: existingUser }, { status: 200 });
      }
      return NextResponse.json({ error: 'A user with this email already exists' }, { status: 400 });
    }

    const userData: Record<string, unknown> = { email, role, name, firebaseUid };

    // Save student-specific fields when the role is student
    if (role === 'student') {
      if (registrationNumber) userData.registrationNumber = registrationNumber;
      if (course) userData.course = course;
      if (section) userData.section = section;
    }

    const user = await User.create(userData);

    return NextResponse.json({ message: 'User created successfully', user }, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Internal Server Error';
    console.error("Signup API error:", error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
