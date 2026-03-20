import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { analyzeStudentContent } from '@/lib/gemini';
import StudentActivity from '@/models/StudentActivity';

export async function POST(req: NextRequest) {
  try {
    const { classroomId, studentEmail, studentName, content, type } = await req.json();

    if (!classroomId || !studentEmail || !content || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectToDatabase();

    // Run Gemini analysis
    const analysis = await analyzeStudentContent(content);

    // Save to database
    const activity = await StudentActivity.create({
      classroomId,
      studentEmail,
      studentName: studentName || '',
      type,
      content: content.slice(0, 2000), // cap at 2000 chars
      topic: analysis.topic,
      weakConcepts: analysis.weakConcepts,
      confidenceScore: analysis.confidenceScore,
      aiFeedback: analysis.aiFeedback,
    });

    return NextResponse.json({ ...analysis, activityId: activity._id }, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Analysis failed';
    console.error('Analyze API error:', error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
