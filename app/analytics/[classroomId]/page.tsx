'use client';

import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { useParams, useRouter } from 'next/navigation';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  LineChart, Line, Cell
} from 'recharts';
import {
  Loader2, ChevronLeft, Users, Brain, TrendingUp,
  AlertTriangle, CheckCircle, BookOpen, Sparkles, BarChart2
} from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────────────────
interface WeakConcept { concept: string; count: number }
interface TopicItem { topic: string; count: number; avgScore: number }
interface StudentSummary {
  name: string; email: string; avgConfidence: number;
  topWeakConcepts: WeakConcept[];
  questionCount: number; submissionCount: number;
  recentFeedback: string; totalActivities: number;
}
interface TimelineItem { date: string; avgConfidence: number | null; count: number }
interface AnalyticsData {
  totalActivities: number; avgConfidence: number;
  students: StudentSummary[];
  topWeakConcepts: WeakConcept[];
  topicBreakdown: TopicItem[];
  timeline: TimelineItem[];
}

// ─── Confidence color ───────────────────────────────────────────────────────
function confidenceColor(score: number) {
  if (score < 35) return '#f87171'; // red
  if (score < 60) return '#fb923c'; // orange
  if (score < 80) return '#facc15'; // yellow
  return '#4ade80'; // green
}

function confidenceLabel(score: number) {
  if (score < 35) return 'Needs Help';
  if (score < 60) return 'Developing';
  if (score < 80) return 'Progressing';
  return 'Strong';
}

// ─── Custom Tooltip ─────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-[#1a1a1e] border border-white/10 rounded-xl px-3 py-2 text-xs text-white shadow-xl">
      <p className="text-[#8a8a8f]">{label}</p>
      <p className="font-bold">{payload[0].value}</p>
    </div>
  );
}

// ─── Main Analytics Page ────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const params = useParams();
  const router = useRouter();
  const classroomId = params.classroomId as string;

  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [classroomName, setClassroomName] = useState('Classroom');
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/analytics/classroom?classroomId=${classroomId}`);
        if (!res.ok) throw new Error('Failed to load analytics');
        const d = await res.json();
        setData(d);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed');
      } finally {
        setLoading(false);
      }
    };

    // Also try to get classroom name
    const fetchName = async () => {
      try {
        const res = await fetch(`/api/classroom/list?role=professor&email=x`);
        if (res.ok) {
          const classrooms = await res.json();
          const found = classrooms.find((c: { _id: string; name: string }) => c._id === classroomId);
          if (found) setClassroomName(found.name);
        }
      } catch { /* ignore */ }
    };

    const fetchSummary = async () => {
      try {
        const res = await fetch(`/api/analytics/classroom/summary?classroomId=${classroomId}`);
        if (res.ok) {
          const d = await res.json();
          setAiSummary(d.summary);
        } else {
          setAiSummary("Failed to generate AI summary.");
        }
      } catch {
        setAiSummary("Error loading AI summary.");
      } finally {
        setLoadingSummary(false);
      }
    };

    fetchData();
    fetchName();
    fetchSummary();
  }, [classroomId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Loader2 className="size-10 text-indigo-400 animate-spin" />
            <div className="absolute inset-0 size-10 rounded-full bg-indigo-500/10 animate-ping" />
          </div>
          <p className="text-[#8a8a8f] text-sm">Loading AI analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  const isEmpty = !data || data.totalActivities === 0;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Grid background */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />
      {/* Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Nav */}
      <header className="sticky top-0 z-20 h-14 border-b border-white/[0.06] bg-[#0a0a0a]/80 backdrop-blur-xl flex items-center px-6 gap-3">
        <button onClick={() => router.push('/dashboard')} className="p-1.5 rounded-lg text-[#8a8a8f] hover:text-white hover:bg-white/5 transition-all">
          <ChevronLeft className="size-4" />
        </button>
        <div className="flex items-center gap-2">
          <div className="size-5 rounded-md bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center">
            <Sparkles className="size-3 text-white" />
          </div>
          <span className="text-white font-semibold text-sm">{classroomName}</span>
          <span className="text-[#8a8a8f] text-xs">· AI Analytics</span>
        </div>
        <button onClick={() => { setLoading(true); window.location.reload(); }}
          className="ml-auto text-xs text-[#8a8a8f] hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all">
          <TrendingUp className="size-3" /> Refresh
        </button>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8 pb-20">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/[0.06]">
              <Brain className="size-10 text-[#5a5a5f]" />
            </div>
            <h2 className="text-xl font-bold text-[#5a5a5f]">No data yet</h2>
            <p className="text-[#3a3a3f] text-sm text-center max-w-sm">
              Analytics will appear here once students start asking questions or submitting assignments in this classroom.
            </p>
          </div>
        ) : (
          <>
            {/* ── AI Topic Summary Report ── */}
            <div className="mb-8 p-6 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
                <Sparkles className="size-24 text-indigo-400" />
              </div>
              <div className="flex items-center gap-3 mb-3 relative z-10">
                <div className="p-2 bg-indigo-500/20 rounded-xl">
                  <Brain className="size-5 text-indigo-400" />
                </div>
                <h3 className="text-lg font-bold text-white">AI Topic Summary Report</h3>
              </div>
              {loadingSummary ? (
                <div className="flex items-center gap-3 text-indigo-300 animate-pulse relative z-10">
                  <Loader2 className="size-4 animate-spin" />
                  <p className="text-sm">Analyzing class performance & generating insights...</p>
                </div>
              ) : (
                <div className="relative z-10 prose prose-invert max-w-none">
                  <ReactMarkdown
                    components={{
                      h2: ({ children }) => (
                        <h2 className="text-base font-bold text-white mt-5 mb-2 first:mt-0 flex items-center gap-2">
                          {children}
                        </h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="text-sm font-semibold text-indigo-200 mt-3 mb-1">{children}</h3>
                      ),
                      p: ({ children }) => (
                        <p className="text-indigo-100/90 text-sm leading-relaxed mb-2">{children}</p>
                      ),
                      ul: ({ children }) => (
                        <ul className="space-y-1.5 mb-3">{children}</ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="space-y-1.5 mb-3 counter-reset-none list-none">{children}</ol>
                      ),
                      li: ({ children }) => (
                        <li className="flex gap-2 text-sm text-indigo-100/85 leading-relaxed before:content-['▸'] before:text-indigo-400 before:shrink-0 before:mt-0.5">
                          <span>{children}</span>
                        </li>
                      ),
                      strong: ({ children }) => (
                        <strong className="text-white font-semibold">{children}</strong>
                      ),
                      hr: () => <hr className="border-indigo-500/20 my-4" />,
                    }}
                  >
                    {aiSummary || ''}
                  </ReactMarkdown>
                </div>
              )}
            </div>

            {/* ── Section 1: Overview cards ── */}
            <div className="mb-10">
              <h1 className="text-2xl font-bold text-white mb-1">Class Analytics</h1>
              <p className="text-[#8a8a8f] text-sm mb-6">AI-powered insights from student questions and submissions</p>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    label: 'Avg. Class Confidence',
                    value: `${data!.avgConfidence}%`,
                    icon: <Brain className="size-5" />,
                    color: confidenceColor(data!.avgConfidence),
                    sub: confidenceLabel(data!.avgConfidence),
                  },
                  {
                    label: 'Students Tracked',
                    value: data!.students.length,
                    icon: <Users className="size-5" />,
                    color: '#818cf8',
                    sub: 'unique learners',
                  },
                  {
                    label: 'Total Activities',
                    value: data!.totalActivities,
                    icon: <BarChart2 className="size-5" />,
                    color: '#34d399',
                    sub: 'questions + submissions',
                  },
                  {
                    label: 'Struggling Students',
                    value: data!.students.filter(s => s.avgConfidence < 50).length,
                    icon: <AlertTriangle className="size-5" />,
                    color: '#f87171',
                    sub: 'confidence < 50%',
                  },
                ].map((card, i) => (
                  <div key={i} className="bg-[#111115] border border-white/[0.06] rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 rounded-xl" style={{ backgroundColor: `${card.color}15`, color: card.color }}>
                        {card.icon}
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-white mb-0.5" style={{ color: card.color }}>{card.value}</p>
                    <p className="text-[#8a8a8f] text-xs font-medium">{card.label}</p>
                    <p className="text-[#5a5a5f] text-xs mt-1">{card.sub}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Section 2: Charts row ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">

              {/* Weak Concepts Bar Chart */}
              <div className="bg-[#111115] border border-white/[0.06] rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-6">
                  <AlertTriangle className="size-4 text-red-400" />
                  <h3 className="text-white font-semibold">Class-Wide Weak Areas</h3>
                  <span className="text-xs text-[#8a8a8f] ml-auto">students struggling per concept</span>
                </div>
                {data!.topWeakConcepts.length === 0 ? (
                  <div className="flex items-center justify-center h-48 text-[#5a5a5f] text-sm">No weak areas detected yet</div>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={data!.topWeakConcepts} layout="vertical" margin={{ left: 10, right: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                      <XAxis type="number" tick={{ fill: '#8a8a8f', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis dataKey="concept" type="category" width={140} tick={{ fill: '#a0a0a5', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                      <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                        {data!.topWeakConcepts.map((_, i) => (
                          <Cell key={i} fill={`hsl(${10 + i * 12}, 80%, ${60 - i * 3}%)`} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Topic Breakdown Radar */}
              <div className="bg-[#111115] border border-white/[0.06] rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-6">
                  <BookOpen className="size-4 text-indigo-400" />
                  <h3 className="text-white font-semibold">Topic Activity Breakdown</h3>
                  <span className="text-xs text-[#8a8a8f] ml-auto">avg confidence per topic</span>
                </div>
                {data!.topicBreakdown.length === 0 ? (
                  <div className="flex items-center justify-center h-48 text-[#5a5a5f] text-sm">No topics yet</div>
                ) : data!.topicBreakdown.length <= 3 ? (
                  // Fallback: horizontal bar chart for <= 3 topics
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={data!.topicBreakdown} margin={{ left: 0, right: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                      <XAxis dataKey="topic" tick={{ fill: '#a0a0a5', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 100]} tick={{ fill: '#8a8a8f', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                      <Bar dataKey="avgScore" radius={[6, 6, 0, 0]}>
                        {data!.topicBreakdown.map((item, i) => (
                          <Cell key={i} fill={confidenceColor(item.avgScore)} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <RadarChart data={data!.topicBreakdown.slice(0, 8)} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                      <PolarGrid stroke="rgba(255,255,255,0.06)" />
                      <PolarAngleAxis dataKey="topic" tick={{ fill: '#a0a0a5', fontSize: 10 }} />
                      <PolarRadiusAxis domain={[0, 100]} tick={{ fill: '#8a8a8f', fontSize: 9 }} />
                      <Radar name="Avg Confidence" dataKey="avgScore" stroke="#818cf8" fill="#818cf8" fillOpacity={0.2} strokeWidth={2} />
                    </RadarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* ── Section 3: Timeline ── */}
            <div className="bg-[#111115] border border-white/[0.06] rounded-2xl p-6 mb-10">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="size-4 text-emerald-400" />
                <h3 className="text-white font-semibold">Confidence Trend (14 days)</h3>
                <span className="text-xs text-[#8a8a8f] ml-auto">daily class avg</span>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={data!.timeline} margin={{ left: 0, right: 20, top: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="date"
                    tick={{ fill: '#8a8a8f', fontSize: 10 }}
                    tickFormatter={(d) => { const dt = new Date(d); return `${dt.getMonth() + 1}/${dt.getDate()}`; }}
                    axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#8a8a8f', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(v: unknown) => {
                      const val = v as number | null;
                      return [val === null ? 'No data' : `${val}%`, 'Avg Confidence'] as [string, string];
                    }}
                    labelFormatter={(d) => new Date(d as string).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    contentStyle={{ background: '#1a1a1e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff', fontSize: 12 }}
                  />
                  <Line dataKey="avgConfidence" stroke="#4ade80" strokeWidth={2.5} dot={{ fill: '#4ade80', r: 3 }}
                    activeDot={{ r: 5, fill: '#4ade80' }} connectNulls={false} type="monotone" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* ── Section 4: Overall Class Summary ── */}
            <div>
              <div className="flex items-center gap-2 mb-5">
                <Brain className="size-4 text-purple-400" />
                <h2 className="text-white font-semibold">Overall Class Summary</h2>
                <span className="ml-auto text-xs text-[#8a8a8f]">{data!.students.length} students tracked</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Key Topics to Revise */}
                <div className="bg-[#111115] border border-white/[0.06] rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="size-4 text-red-400" />
                    <h3 className="text-white font-semibold text-sm">Priority Topics to Revise</h3>
                  </div>
                  {data!.topWeakConcepts.length === 0 ? (
                    <p className="text-[#5a5a5f] text-sm">No weak areas detected yet.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {data!.topWeakConcepts.map(({ concept, count }, i) => (
                        <span key={concept}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium border transition-all"
                          style={{
                            backgroundColor: `hsla(${10 + i * 15}, 80%, 60%, 0.1)`,
                            borderColor: `hsla(${10 + i * 15}, 80%, 60%, 0.25)`,
                            color: `hsl(${10 + i * 15}, 80%, 72%)`,
                          }}>
                          <span className="size-1.5 rounded-full shrink-0" style={{ backgroundColor: `hsl(${10 + i * 15}, 80%, 60%)` }} />
                          {concept}
                          <span className="text-xs opacity-60 ml-0.5">×{count}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Topic Coverage */}
                <div className="bg-[#111115] border border-white/[0.06] rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <BookOpen className="size-4 text-blue-400" />
                    <h3 className="text-white font-semibold text-sm">Topics Covered by Students</h3>
                  </div>
                  {data!.topicBreakdown.length === 0 ? (
                    <p className="text-[#5a5a5f] text-sm">No topics recorded yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {data!.topicBreakdown.slice(0, 5).map(({ topic, count, avgScore }) => (
                        <div key={topic} className="flex items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-white text-xs font-medium truncate">{topic}</p>
                              <span className="text-xs shrink-0 ml-2" style={{ color: avgScore >= 70 ? '#4ade80' : avgScore >= 45 ? '#fb923c' : '#f87171' }}>{avgScore}%</span>
                            </div>
                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full rounded-full transition-all duration-700"
                                style={{ width: `${avgScore}%`, backgroundColor: avgScore >= 70 ? '#4ade80' : avgScore >= 45 ? '#fb923c' : '#f87171' }} />
                            </div>
                          </div>
                          <span className="text-xs text-[#8a8a8f] shrink-0">{count} activities</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Student Roster Summary Table */}
              {data!.students.length > 0 && (
                <div className="bg-[#111115] border border-white/[0.06] rounded-2xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-white/[0.06] flex items-center gap-2">
                    <Users className="size-4 text-blue-400" />
                    <h3 className="text-white font-semibold text-sm">Student Overview</h3>
                    <span className="ml-auto text-xs text-[#5a5a5f]">sorted by confidence</span>
                  </div>
                  <div className="divide-y divide-white/[0.04]">
                    {data!.students.map((s) => (
                      <div key={s.email} className="flex items-center gap-4 px-6 py-3 hover:bg-white/[0.02] transition-all">
                        <div className="size-8 rounded-full bg-gradient-to-tr from-indigo-600/30 to-purple-600/30 border border-white/[0.06] flex items-center justify-center shrink-0">
                          <span className="text-xs text-white font-bold">{s.name.charAt(0).toUpperCase()}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">{s.name}</p>
                          <p className="text-[#5a5a5f] text-xs truncate">{s.email}</p>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-[#8a8a8f] shrink-0">
                          <span>{s.questionCount} Qs</span>
                          <span>{s.submissionCount} subs</span>
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                            style={{ color: s.avgConfidence >= 70 ? '#4ade80' : s.avgConfidence >= 45 ? '#fb923c' : '#f87171',
                                     backgroundColor: s.avgConfidence >= 70 ? 'rgba(74,222,128,0.1)' : s.avgConfidence >= 45 ? 'rgba(251,146,60,0.1)' : 'rgba(248,113,113,0.1)' }}>
                            {s.avgConfidence}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Good understanding banner */}
            {data!.students.filter(s => s.avgConfidence >= 80).length > 0 && (
              <div className="mt-6 flex items-center gap-3 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                <CheckCircle className="size-5 text-emerald-400 shrink-0" />
                <p className="text-emerald-300 text-sm">
                  <span className="font-bold">{data!.students.filter(s => s.avgConfidence >= 80).length} student{data!.students.filter(s => s.avgConfidence >= 80).length !== 1 ? 's' : ''}</span> show strong understanding (confidence ≥ 80%)
                </p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
