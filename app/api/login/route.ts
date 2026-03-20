import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    await connectToDatabase();

    // The '+password' ensures the password field is returned even though it's set to select: false in schema
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      // Auto-provision test accounts if they don't exist yet
      if (email === 'lavjeet@gmail.com' && password === '123456') {
        const newUser = await User.create({ email, password, role: 'student', name: 'Lavjeet' });
        const userObj = newUser.toObject();
        delete userObj.password;
        return NextResponse.json({ message: 'Login successful', user: userObj }, { status: 200 });
      }
      if (email === 'lavjeet1@gmail.com' && password === '123456') {
        const newUser = await User.create({ email, password, role: 'professor', name: 'Lavjeet Professor' });
        const userObj = newUser.toObject();
        delete userObj.password;
        return NextResponse.json({ message: 'Login successful', user: userObj }, { status: 200 });
      }
      
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    if (user.password !== password) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Don't send the password back to the client
    const userObj = user.toObject();
    delete userObj.password;

    return NextResponse.json({ message: 'Login successful', user: userObj }, { status: 200 });
  } catch (error: any) {
    console.error("Login API error:", error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
