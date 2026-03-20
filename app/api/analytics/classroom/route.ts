import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import StudentActivity from '@/models/StudentActivity';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const classroomId = searchParams.get('classroomId');

    if (!classroomId) {
      return NextResponse.json({ error: 'classroomId is required' }, { status: 400 });
    }

    await connectToDatabase();

    const activities = await StudentActivity.find({ classroomId })
      .sort({ createdAt: -1 })
      .lean();

    if (activities.length === 0) {
      return NextResponse.json({
        totalActivities: 0,
        avgConfidence: 0,
        students: [],
        topWeakConcepts: [],
        topicBreakdown: [],
        timeline: [],
      });
    }

    // ── Per-student aggregation ────────────────────────────────────────────
    const studentMap: Record<string, {
      name: string;
      email: string;
      scores: number[];
      weakConcepts: Record<string, number>;
      topics: string[];
      questionCount: number;
      submissionCount: number;
      recentFeedback: string;
      activities: typeof activities;
    }> = {};

    for (const a of activities) {
      const key = a.studentEmail;
      if (!studentMap[key]) {
        studentMap[key] = {
          name: a.studentName || a.studentEmail.split('@')[0],
          email: a.studentEmail,
          scores: [],
          weakConcepts: {},
          topics: [],
          questionCount: 0,
          submissionCount: 0,
          recentFeedback: '',
          activities: [],
        };
      }
      const s = studentMap[key];
      s.scores.push(a.confidenceScore);
      s.topics.push(a.topic);
      if (a.type === 'question') s.questionCount++;
      else s.submissionCount++;
      if (a.aiFeedback) s.recentFeedback = a.aiFeedback;
      for (const wc of a.weakConcepts) {
        s.weakConcepts[wc] = (s.weakConcepts[wc] || 0) + 1;
      }
      s.activities.push(a);
    }

    // Build student summary list
    const students = Object.values(studentMap).map((s) => {
      const avgConfidence = Math.round(s.scores.reduce((a, b) => a + b, 0) / s.scores.length);
      const topWeakConcepts = Object.entries(s.weakConcepts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([concept, count]) => ({ concept, count }));
      return {
        name: s.name,
        email: s.email,
        avgConfidence,
        topWeakConcepts,
        questionCount: s.questionCount,
        submissionCount: s.submissionCount,
        recentFeedback: s.recentFeedback,
        totalActivities: s.scores.length,
      };
    }).sort((a, b) => a.avgConfidence - b.avgConfidence); // weakest first

    // ── Class-wide weak concepts ──────────────────────────────────────────
    const classWeakMap: Record<string, number> = {};
    for (const a of activities) {
      for (const wc of a.weakConcepts) {
        classWeakMap[wc] = (classWeakMap[wc] || 0) + 1;
      }
    }
    const topWeakConcepts = Object.entries(classWeakMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([concept, count]) => ({ concept, count }));

    // ── Topic breakdown ───────────────────────────────────────────────────
    const topicMap: Record<string, { count: number; avgScore: number; scores: number[] }> = {};
    for (const a of activities) {
      if (!topicMap[a.topic]) topicMap[a.topic] = { count: 0, avgScore: 0, scores: [] };
      topicMap[a.topic].count++;
      topicMap[a.topic].scores.push(a.confidenceScore);
    }
    const topicBreakdown = Object.entries(topicMap)
      .map(([topic, data]) => ({
        topic,
        count: data.count,
        avgScore: Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // ── Timeline (daily avg confidence over last 14 days) ─────────────────
    const timelineMap: Record<string, number[]> = {};
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      timelineMap[key] = [];
    }
    for (const a of activities) {
      const key = new Date(a.createdAt).toISOString().slice(0, 10);
      if (timelineMap[key]) timelineMap[key].push(a.confidenceScore);
    }
    const timeline = Object.entries(timelineMap).map(([date, scores]) => ({
      date,
      avgConfidence: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null,
      count: scores.length,
    }));

    // ── Overall class avg ─────────────────────────────────────────────────
    const allScores = activities.map(a => a.confidenceScore);
    const avgConfidence = Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length);

    return NextResponse.json({
      totalActivities: activities.length,
      avgConfidence,
      students,
      topWeakConcepts,
      topicBreakdown,
      timeline,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Internal Server Error';
    console.error('Analytics error:', error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
