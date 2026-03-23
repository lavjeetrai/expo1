import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import StudentActivity from '@/models/StudentActivity';
import { generateClassroomSummary } from '@/lib/gemini';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const classroomId = searchParams.get('classroomId');

    if (!classroomId) {
      return NextResponse.json({ error: 'classroomId is required' }, { status: 400 });
    }

    await connectToDatabase();

    const activities = await StudentActivity.find({ classroomId }).lean();

    if (activities.length === 0) {
      return NextResponse.json({ summary: "## 📊 Executive Summary\n\nNo student activities logged yet. A summary report will be generated once students start asking questions or submitting assignments." }, { status: 200 });
    }

    // ── Per-student aggregation ────────────────────────────────────────
    const studentMap: Record<string, { name: string; email: string; scores: number[]; weakConcepts: string[]; questions: string[]; submissionCount: number; questionCount: number }> = {};
    const topicCount: Record<string, number> = {};
    const weakConceptCount: Record<string, number> = {};

    activities.forEach(a => {
      const key = a.studentEmail;
      if (!studentMap[key]) {
        studentMap[key] = { name: a.studentName || a.studentEmail.split('@')[0], email: a.studentEmail, scores: [], weakConcepts: [], questions: [], submissionCount: 0, questionCount: 0 };
      }
      const s = studentMap[key];
      s.scores.push(a.confidenceScore);
      s.weakConcepts.push(...a.weakConcepts);
      if (a.type === 'question') { s.questionCount++; s.questions.push(a.content.slice(0, 120)); }
      else s.submissionCount++;

      topicCount[a.topic] = (topicCount[a.topic] || 0) + 1;
      a.weakConcepts.forEach((wc: string) => { weakConceptCount[wc] = (weakConceptCount[wc] || 0) + 1; });
    });

    const topTopics = Object.entries(topicCount).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([t, c]) => `${t} (${c} activities)`);
    const topWeaknesses = Object.entries(weakConceptCount).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([wc, c]) => `${wc} (${c} students)`);

    const allScores = activities.map(a => a.confidenceScore);
    const avgConfidence = Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length);

    const studentSummaries = Object.values(studentMap).map(s => {
      const avg = s.scores.length ? Math.round(s.scores.reduce((a, b) => a + b, 0) / s.scores.length) : 0;
      return `- ${s.name} (${s.email}): avg confidence ${avg}%, ${s.questionCount} questions / ${s.submissionCount} submitted` +
        (s.questions.length ? `\n  Sample questions: ${s.questions.slice(0, 2).join(' | ')}` : '') +
        (s.weakConcepts.length ? `\n  Weak areas: ${[...new Set(s.weakConcepts)].slice(0, 3).join(', ')}` : '');
    }).join('\n');

    const classDataString = `
Overall Class Average Confidence: ${avgConfidence}%
Total Students: ${Object.keys(studentMap).length}
Total Activities: ${activities.length}

Top Topics Being Asked About:
${topTopics.join('\n') || 'None'}

Top Weak Concepts Across Class:
${topWeaknesses.join('\n') || 'None'}

Per-Student Breakdown:
${studentSummaries || 'No individual data available.'}
    `.trim();

    const summaryText = await generateClassroomSummary(classDataString);

    return NextResponse.json({ summary: summaryText }, { status: 200 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Internal Server Error';
    console.error('Analytics summary error:', error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
