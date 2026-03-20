'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { BoltStyleChat } from '@/components/ui/bolt-style-chat';
import ClassroomBannerHero from '@/components/ui/refer-and-win-banner';
import { cn } from '@/lib/utils';
import {
  Hash, Loader2, BookOpen, Users,
  Sparkles, X, Calendar, Paperclip,
  Upload, Download, ClipboardList, ChevronLeft,
  Check, MessageSquare
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Classroom {
  _id: string;
  name: string;
  subject: string;
  code: string;
  professorName: string;
  students: string[];
}

interface Attachment {
  fileName: string;
  filePath: string;
}

interface AssignmentData {
  _id: string;
  title: string;
  description: string;
  dueDate?: string;
  attachments: Attachment[];
  createdAt: string;
}

const STORAGE_KEY = 'activeClassroom';

// Badge colors
const badgeColors = [
  'from-amber-300 to-yellow-400',
  'from-pink-300 to-pink-400',
  'from-blue-400 to-blue-500',
  'from-sky-300 to-sky-400',
  'from-orange-400 to-orange-500',
  'from-emerald-400 to-teal-400',
  'from-purple-400 to-indigo-400',
  'from-rose-400 to-red-400',
];
const badgeRotations = [-3, 2, -2, 0, 3, -1, 1, -2];

// ──────────────────────────────────────────────────────────────────────────────
// Upload helper
// ──────────────────────────────────────────────────────────────────────────────
async function uploadFile(file: File): Promise<Attachment> {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch('/api/upload', { method: 'POST', body: fd });
  if (!res.ok) throw new Error('Upload failed');
  return await res.json();
}

// ──────────────────────────────────────────────────────────────────────────────
// Home Screen (join + classroom list)
// ──────────────────────────────────────────────────────────────────────────────
function ClassroomHome({
  classrooms, studentEmail, onEnter, onJoined,
}: {
  classrooms: Classroom[]; studentEmail: string;
  onEnter: (c: Classroom) => void; onJoined: (c: Classroom) => void;
}) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/classroom/join', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim().toUpperCase(), studentEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to join');
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      onJoined(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to join');
    } finally { setLoading(false); }
  };

  return (
    <div className="relative min-h-screen bg-[#0a0a0a] flex flex-col items-center px-4 py-16 overflow-hidden">
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[600px] bg-blue-600/8 rounded-full blur-[130px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-3xl flex flex-col items-center">
        <ClassroomBannerHero
          title="Welcome back!"
          subtitle={classrooms.length === 0
            ? 'Join a classroom with a code from your professor.'
            : `${classrooms.length} classroom${classrooms.length > 1 ? 's' : ''} · Select one or join a new class below.`
          }
          badge="Student Portal"
          badgeColor="from-blue-500 to-indigo-600"
        />

        {/* Join form */}
        <form onSubmit={handleJoin} className="flex items-center gap-3 mb-8 w-full max-w-md">
          <div className="relative flex-1">
            <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#5a5a5f]" />
            <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
              placeholder="ENTER CODE" maxLength={6} autoFocus
              className="w-full bg-[#1a1a1e] border border-white/8 rounded-full pl-10 pr-4 py-3 text-white placeholder-[#5a5a5f] font-mono font-bold text-sm tracking-[0.25em] text-center focus:outline-none focus:ring-2 focus:ring-amber-400/40 transition-all uppercase"
              disabled={loading} />
          </div>
          <button type="submit" disabled={loading || !code.trim()}
            className="cursor-pointer select-none rounded-full font-semibold transition-all duration-500 ease-out bg-gradient-to-b shadow-lg hover:shadow-2xl from-amber-300 to-yellow-400 px-7 py-3 text-base disabled:opacity-50"
            style={{ transform: 'rotate(-2deg)' }}>
            <span className="relative flex items-center gap-2 text-slate-800 drop-shadow-[0_1px_1px_rgba(255,255,255,0.3)]">
              {loading ? 'Joining...' : 'Join Class'}
            </span>
          </button>
        </form>

        {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5 text-center mb-8 max-w-md w-full">{error}</p>}

        {/* Classroom badges */}
        {classrooms.length > 0 && (
          <>
            <div className="flex items-center gap-3 mb-8 w-full max-w-lg">
              <div className="h-px flex-1 bg-white/[0.06]" />
              <span className="text-[#5a5a5f] text-xs font-medium tracking-wider uppercase">Your Classrooms</span>
              <div className="h-px flex-1 bg-white/[0.06]" />
            </div>
            <div className="relative flex flex-wrap justify-center gap-4 w-full">
              {classrooms.map((c, i) => {
                const colorIdx = i % badgeColors.length;
                const rotation = badgeRotations[i % badgeRotations.length];
                const isHovered = hoveredId === c._id;
                const isOtherHovered = hoveredId !== null && hoveredId !== c._id;
                return (
                  <button key={c._id} onClick={() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(c)); onEnter(c); }}
                    onMouseEnter={() => setHoveredId(c._id)} onMouseLeave={() => setHoveredId(null)}
                    className={cn('relative cursor-pointer select-none rounded-full font-semibold transition-all duration-500 ease-out bg-gradient-to-b shadow-lg hover:shadow-2xl', badgeColors[colorIdx], 'px-7 py-3')}
                    style={{
                      transform: `rotate(${isHovered ? 0 : rotation}deg) scale(${isHovered ? 1.1 : isOtherHovered ? 0.95 : 1}) translateY(${isHovered ? -8 : 0}px)`,
                      zIndex: isHovered ? 100 : 10 - i,
                      boxShadow: isHovered ? '0 25px 50px -12px rgba(0,0,0,0.25), inset 0 2px 4px rgba(255,255,255,0.3)' : '0 10px 25px -5px rgba(0,0,0,0.15), inset 0 1px 2px rgba(255,255,255,0.2)',
                    }}>
                    <span className="relative flex items-center gap-2 text-slate-800 drop-shadow-[0_1px_1px_rgba(255,255,255,0.3)]"
                      style={{ transform: isHovered ? 'translateY(-1px)' : 'translateY(0)', transition: 'transform 0.3s' }}>
                      <BookOpen className="size-4" />
                      <span className="text-base font-semibold">{c.name}</span>
                      <span className="text-xs opacity-70">· {c.subject}</span>
                    </span>
                    <div className="pointer-events-none absolute inset-0 rounded-full opacity-50"
                      style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 50%)' }} />
                    <div className="absolute -top-2 -right-2 bg-slate-800 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg">
                      <Users className="size-3" />{c.students.length}
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}
        {classrooms.length === 0 && (
          <p className="text-center text-[#5a5a5f] text-xs mt-2">No classrooms yet — ask your professor for the join code.</p>
        )}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Assignments View (Student Side)
// ──────────────────────────────────────────────────────────────────────────────
function AssignmentsView({
  classroom, studentEmail, studentName, onBack,
}: {
  classroom: Classroom; studentEmail: string; studentName: string; onBack: () => void;
}) {
  const [assignments, setAssignments] = useState<AssignmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [submitFiles, setSubmitFiles] = useState<File[]>([]);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    fetch(`/api/assignment/list?classroomId=${classroom._id}`)
      .then(r => r.ok ? r.json() : []).then(setAssignments)
      .finally(() => setLoading(false));
  }, [classroom._id]);

  const handleSubmit = async (assignmentId: string) => {
    if (submitFiles.length === 0) { setSubmitError('Please select at least one file'); return; }
    setSubmitLoading(true); setSubmitError('');
    try {
      const attachments: Attachment[] = [];
      for (const file of submitFiles) {
        const att = await uploadFile(file);
        attachments.push(att);
      }
      const res = await fetch('/api/assignment/submit', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignmentId, studentEmail, studentName, attachments }),
      });
      if (!res.ok) throw new Error('Submission failed');
      setSubmitSuccess(assignmentId);
      setSubmittingId(null); setSubmitFiles([]);
      setTimeout(() => setSubmitSuccess(null), 3000);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Failed');
    } finally { setSubmitLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />

      {/* Top bar */}
      <header className="relative z-10 h-14 border-b border-white/[0.06] bg-[#0a0a0a]/80 backdrop-blur-xl flex items-center px-6 gap-3">
        <button onClick={onBack} className="p-1.5 rounded-lg text-[#8a8a8f] hover:text-white hover:bg-white/5 transition-all">
          <ChevronLeft className="size-4" />
        </button>
        <ClipboardList className="size-4 text-indigo-400" />
        <span className="text-white font-semibold text-sm">{classroom.name}</span>
        <span className="text-[#8a8a8f] text-xs">· Assignments</span>
      </header>

      <main className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold text-white mb-2">Assignments</h1>
        <p className="text-[#8a8a8f] text-sm mb-8">{classroom.subject} · {assignments.length} assignment{assignments.length !== 1 ? 's' : ''}</p>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="size-6 text-indigo-400 animate-spin" /></div>
        ) : assignments.length === 0 ? (
          <div className="flex flex-col items-center py-20 gap-3">
            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
              <ClipboardList className="size-8 text-[#5a5a5f]" />
            </div>
            <p className="text-[#5a5a5f] font-medium">No assignments yet</p>
            <p className="text-[#3a3a3f] text-sm text-center max-w-xs">Your professor hasn&apos;t posted any assignments for this classroom.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {assignments.map((a) => {
              const isPastDue = a.dueDate && new Date(a.dueDate) < new Date();
              const isSubmitting = submittingId === a._id;
              const justSubmitted = submitSuccess === a._id;

              return (
                <div key={a._id} className="bg-[#111115] border border-white/[0.06] rounded-2xl overflow-hidden transition-all hover:border-white/[0.1]">
                  {/* Assignment header */}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="text-white font-semibold text-base">{a.title}</h3>
                      {justSubmitted && (
                        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium animate-in fade-in">
                          <Check className="size-3" /> Submitted!
                        </span>
                      )}
                    </div>
                    {a.description && <p className="text-[#8a8a8f] text-sm mb-3 whitespace-pre-wrap">{a.description}</p>}

                    {/* Meta row */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#8a8a8f] mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="size-3" />
                        Posted {new Date(a.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      {a.dueDate && (
                        <span className={cn('flex items-center gap-1 font-medium', isPastDue ? 'text-red-400' : 'text-amber-400')}>
                          <Calendar className="size-3" />
                          Due: {new Date(a.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          {isPastDue && ' (Past due)'}
                        </span>
                      )}
                    </div>

                    {/* Professor attachments */}
                    {a.attachments.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {a.attachments.map((att, i) => (
                          <a key={i} href={att.filePath} target="_blank" rel="noopener noreferrer" download
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/15 text-blue-300 text-xs font-medium hover:bg-blue-500/20 transition-all">
                            <Download className="size-3" />
                            <span className="truncate max-w-[180px]">{att.fileName}</span>
                          </a>
                        ))}
                      </div>
                    )}

                    {/* Submit toggle */}
                    {!isSubmitting && !justSubmitted && (
                      <button onClick={() => { setSubmittingId(a._id); setSubmitFiles([]); setSubmitError(''); }}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium hover:bg-indigo-500/20 transition-all">
                        <Upload className="size-3.5" /> Submit Your Work
                      </button>
                    )}
                  </div>

                  {/* Submit form (expanded) */}
                  {isSubmitting && (
                    <div className="px-5 pb-5 pt-0 border-t border-white/[0.04]">
                      <div className="bg-[#16161a] rounded-xl p-4 mt-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-white font-semibold text-sm">Your Submission</h4>
                          <button onClick={() => { setSubmittingId(null); setSubmitError(''); }} className="text-[#8a8a8f] hover:text-white">
                            <X className="size-4" />
                          </button>
                        </div>

                        <label className="flex items-center justify-center gap-2 w-full py-4 rounded-xl border-2 border-dashed border-white/10 text-[#8a8a8f] text-sm cursor-pointer hover:text-white hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all mb-3">
                          <Upload className="size-4" />
                          {submitFiles.length > 0 ? `${submitFiles.length} file${submitFiles.length > 1 ? 's' : ''} selected` : 'Click to choose files'}
                          <input type="file" multiple className="hidden" onChange={(e) => setSubmitFiles(Array.from(e.target.files || []))} />
                        </label>

                        {submitFiles.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {submitFiles.map((f, i) => (
                              <span key={i} className="flex items-center gap-1 px-2 py-1 bg-indigo-500/10 border border-indigo-500/15 rounded-lg text-indigo-300 text-xs">
                                <Paperclip className="size-3" />{f.name}
                              </span>
                            ))}
                          </div>
                        )}

                        {submitError && <p className="text-red-400 text-xs bg-red-500/10 rounded-lg px-3 py-2 mb-3">{submitError}</p>}

                        <button onClick={() => handleSubmit(a._id)} disabled={submitLoading || submitFiles.length === 0}
                          className="w-full flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2.5 rounded-xl transition-all disabled:opacity-50 text-sm">
                          {submitLoading ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
                          {submitLoading ? 'Uploading...' : 'Submit Assignment'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Classroom Banner (with Assignments button)
// ──────────────────────────────────────────────────────────────────────────────
function ClassroomBanner({
  classroom, onLeave, onShowAssignments,
}: {
  classroom: Classroom; onLeave: () => void; onShowAssignments: () => void;
}) {
  return (
    <div className="fixed top-0 left-64 right-0 z-30 flex items-center gap-3 px-6 py-2.5 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/[0.06]">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <BookOpen className="size-4 text-blue-400 shrink-0" />
        <span className="text-white font-semibold text-sm truncate">{classroom.name}</span>
        <span className="text-[#8a8a8f] text-xs truncate hidden sm:inline">· {classroom.subject}</span>
      </div>

      {/* Assignments button */}
      <button onClick={onShowAssignments}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium hover:bg-indigo-500/20 transition-all">
        <ClipboardList className="size-3" /> Assignments
      </button>

      <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#1e2235] border border-blue-500/20">
        <Hash className="size-3 text-blue-400" />
        <span className="text-blue-300 font-mono font-bold text-xs">{classroom.code}</span>
      </div>
      <button onClick={onLeave} title="Back to classrooms"
        className="p-1.5 rounded-lg text-[#5a5a5f] hover:text-red-400 hover:bg-red-500/10 transition-all">
        <X className="size-3.5" />
      </button>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Main Page
// ──────────────────────────────────────────────────────────────────────────────
export default function ClassroomPage() {
  const router = useRouter();
  const [authLoading, setAuthLoading] = useState(true);
  const [studentEmail, setStudentEmail] = useState('');
  const [studentName, setStudentName] = useState('');
  const [activeClassroom, setActiveClassroom] = useState<Classroom | null>(null);
  const [allClassrooms, setAllClassrooms] = useState<Classroom[]>([]);
  const [view, setView] = useState<'loading' | 'home' | 'chat' | 'assignments'>('loading');

  const fetchStudentClassrooms = useCallback(async (email: string): Promise<Classroom[]> => {
    try {
      const res = await fetch(`/api/classroom/list?role=student&email=${encodeURIComponent(email)}`);
      if (res.ok) return await res.json();
    } catch { /* ignore */ }
    return [];
  }, []);

  useEffect(() => {
    const initPage = async () => {
      const localEmail = localStorage.getItem('userEmail') || '';
      const localRole = localStorage.getItem('userRole') || '';
      if (!localEmail) { router.push('/login'); return; }
      if (localRole === 'professor') { router.push('/dashboard'); return; }

      setStudentEmail(localEmail);

      // Fetch student name from DB
      try {
        const res = await fetch(`/api/user?email=${localEmail}`);
        if (res.ok) {
          const data = await res.json();
          setStudentName(data.name || '');
        }
      } catch { /* ignore */ }

      const classrooms = await fetchStudentClassrooms(localEmail);
      setAllClassrooms(classrooms);
      setView('home');
      setAuthLoading(false);
    };
    initPage();
  }, [router, fetchStudentClassrooms]);

  const handleEnterClassroom = (c: Classroom) => { setActiveClassroom(c); setView('chat'); };
  const handleJoinedNew = (c: Classroom) => {
    setAllClassrooms(prev => prev.some(x => x._id === c._id) ? prev : [c, ...prev]);
    setActiveClassroom(c); setView('chat');
  };
  const handleLeaveClassroom = () => {
    localStorage.removeItem(STORAGE_KEY); setActiveClassroom(null);
    fetchStudentClassrooms(studentEmail).then(setAllClassrooms);
    setView('home');
  };

  if (authLoading || view === 'loading') {
    return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center"><Loader2 className="size-8 text-blue-400 animate-spin" /></div>;
  }

  if (view === 'home') {
    return <ClassroomHome classrooms={allClassrooms} studentEmail={studentEmail} onEnter={handleEnterClassroom} onJoined={handleJoinedNew} />;
  }

  if (view === 'assignments' && activeClassroom) {
    return (
      <AssignmentsView
        classroom={activeClassroom}
        studentEmail={studentEmail}
        studentName={studentName}
        onBack={() => setView('chat')}
      />
    );
  }

  // Chat view
  return (
    <div className="relative">
      {activeClassroom && (
        <ClassroomBanner
          classroom={activeClassroom}
          onLeave={handleLeaveClassroom}
          onShowAssignments={() => setView('assignments')}
        />
      )}
      <div className="pt-10">
        <BoltStyleChat
          placeholder="ASK YOUR QUESTION"
          classroomId={activeClassroom?._id}
          studentEmail={studentEmail}
          studentName={studentName}
        />
      </div>
    </div>
  );
}
