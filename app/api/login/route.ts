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

    const user = await User.findOne({ email }).select('+password');
    
    console.log("=== LOGIN DEBUG ===");
    console.log("Attempting login for email:", `"${email}"`);
    console.log("Password provided:", `"${password}"`);
    
    if (!user) {
      console.log("Login failed: User not found in DB.");
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

    console.log("User found in DB. DB Password:", `"${user.password}"`);

    if (user.password !== password) {
      console.log("Login failed: Password mismatch.");
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    console.log("Login successful! Password matched.");
    // Don't send the password back to the client
    const userObj = user.toObject();
    delete userObj.password;

    return NextResponse.json({ message: 'Login successful', user: userObj }, { status: 200 });
  } catch (error: any) {
    console.error("Login API error:", error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
