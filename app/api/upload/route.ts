import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // 1. Read the file into an ArrayBuffer
    const bytes = await file.arrayBuffer();
    
    // 2. Convert the buffer to a Base64 string
    const buffer = Buffer.from(bytes);
    const base64String = buffer.toString('base64');
    
    // 3. Create a Data URI (this acts as the "path" for MongoDB)
    // Example: data:application/pdf;base64,JVBERi0xLjQK...
    const fileDataUri = `data:${file.type};base64,${base64String}`;

    // Return the strings needed for your Assignment Schema
    return NextResponse.json({
      fileName: file.name,
      filePath: fileDataUri, 
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Upload failed';
    console.error('Upload error:', error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}