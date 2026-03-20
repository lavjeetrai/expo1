'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { cn } from '@/lib/utils';
import {
  Plus, Copy, Check, BookOpen, Users, X,
  GraduationCap, Loader2, Hash, LogOut, Sparkles,
  Mail, FileText, BookMarked, LayoutList,
  Calendar, Paperclip, Upload, Download, ChevronLeft,
  ClipboardList, Eye, BarChart2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import ClassroomBannerHero from '@/components/ui/refer-and-win-banner';

interface Classroom {
  _id: string;
  name: string;
  subject: string;
  code: string;
  professorEmail: string;
  professorName: string;
  students: string[];
  createdAt: string;
}

interface StudentDetail {
  _id: string;
  email: string;
  name?: string;
  registrationNumber?: string;
  course?: string;
  section?: string;
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

interface SubmissionData {
  _id: string;
  studentEmail: string;
  studentName: string;
  attachments: Attachment[];
  submittedAt: string;
  grade?: string;
}

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
// Create Classroom Modal
// ──────────────────────────────────────────────────────────────────────────────
function CreateClassroomModal({
  onClose, onCreated, professorEmail, professorName,
}: {
  onClose: () => void; onCreated: (c: Classroom) => void;
  professorEmail: string; professorName: string;
}) {
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !subject.trim()) return;
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/classroom/create', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, subject, professorEmail, professorName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      onCreated(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Create failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-[#111115] border border-white/10 rounded-3xl shadow-[0_8px_80px_rgba(0,0,0,0.8)] p-8 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/30 to-indigo-500/10 border border-blue-500/20">
              <Plus className="size-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-white font-bold text-xl">Create Classroom</h2>
              <p className="text-[#8a8a8f] text-xs mt-0.5">A join code will be auto-generated</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-[#8a8a8f] hover:text-white hover:bg-white/5 transition-colors">
            <X className="size-4" />
          </button>
        </div>
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#8a8a8f] uppercase tracking-widest">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. CSE 102 — Section A"
              className="bg-[#1a1a1e] border border-white/8 rounded-xl px-4 py-3 text-white placeholder-[#5a5a5f] text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50"
              disabled={loading} maxLength={80} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#8a8a8f] uppercase tracking-widest">Subject</label>
            <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Data Structures"
              className="bg-[#1a1a1e] border border-white/8 rounded-xl px-4 py-3 text-white placeholder-[#5a5a5f] text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50"
              disabled={loading} maxLength={80} />
          </div>
          {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">{error}</p>}
          <button type="submit" disabled={loading || !name.trim() || !subject.trim()}
            className="mt-2 flex items-center justify-center gap-2.5 bg-[#1488fc] hover:bg-[#1a94ff] text-white font-semibold py-3 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95">
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
            {loading ? 'Creating...' : 'Create Classroom'}
          </button>
        </form>
      </div>
    </div>
  );
}

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
// Classroom Detail Modal (Students + Assignments tabs)
// ──────────────────────────────────────────────────────────────────────────────
function ClassroomDetailModal({
  classroom, onClose,
}: {
  classroom: Classroom; onClose: () => void;
}) {
  const [tab, setTab] = useState<'students' | 'assignments'>('assignments');
  const [students, setStudents] = useState<StudentDetail[]>([]);
  const [assignments, setAssignments] = useState<AssignmentData[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [loadingAssignments, setLoadingAssignments] = useState(true);

  // Create assignment state
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDue, setNewDue] = useState('');
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  // Submission view state
  const [viewingAssignment, setViewingAssignment] = useState<AssignmentData | null>(null);
  const [submissions, setSubmissions] = useState<SubmissionData[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  useEffect(() => {
    fetch(`/api/classroom/students?classroomId=${classroom._id}`)
      .then(r => r.ok ? r.json() : []).then(setStudents)
      .finally(() => setLoadingStudents(false));
    fetch(`/api/assignment/list?classroomId=${classroom._id}`)
      .then(r => r.ok ? r.json() : []).then(setAssignments)
      .finally(() => setLoadingAssignments(false));
  }, [classroom._id]);

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setCreating(true); setCreateError('');
    try {
      // Upload files first
      const attachments: Attachment[] = [];
      for (const file of newFiles) {
        const att = await uploadFile(file);
        attachments.push(att);
      }
      const res = await fetch('/api/assignment/create', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classroomId: classroom._id,
          title: newTitle.trim(),
          description: newDesc.trim(),
          dueDate: newDue || undefined,
          attachments,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setAssignments(prev => [data, ...prev]);
      setShowCreate(false);
      setNewTitle(''); setNewDesc(''); setNewDue(''); setNewFiles([]);
    } catch (err: unknown) {
      setCreateError(err instanceof Error ? err.message : 'Failed');
    } finally { setCreating(false); }
  };

  const handleViewSubmissions = async (assignment: AssignmentData) => {
    setViewingAssignment(assignment);
    setLoadingSubmissions(true);
    try {
      const res = await fetch(`/api/assignment/submissions?assignmentId=${assignment._id}`);
      if (res.ok) setSubmissions(await res.json());
    } catch { /* ignore */ }
    setLoadingSubmissions(false);
  };

  // ── Submissions sub-view ──
  if (viewingAssignment) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
        <div className="relative z-10 w-full max-w-2xl bg-[#111115] border border-white/10 rounded-3xl shadow-[0_8px_80px_rgba(0,0,0,0.8)] max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-200">
          <div className="flex items-center gap-3 p-6 pb-4 border-b border-white/[0.06]">
            <button onClick={() => setViewingAssignment(null)} className="p-1.5 rounded-lg text-[#8a8a8f] hover:text-white hover:bg-white/5 transition-colors">
              <ChevronLeft className="size-4" />
            </button>
            <div className="min-w-0 flex-1">
              <h2 className="text-white font-bold text-lg truncate">{viewingAssignment.title}</h2>
              <p className="text-[#8a8a8f] text-xs">{submissions.length} submission{submissions.length !== 1 ? 's' : ''}</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl text-[#8a8a8f] hover:text-white hover:bg-white/5 transition-colors">
              <X className="size-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            {loadingSubmissions && (
              <div className="flex justify-center py-12"><Loader2 className="size-6 text-indigo-400 animate-spin" /></div>
            )}
            {!loadingSubmissions && submissions.length === 0 && (
              <div className="flex flex-col items-center py-12 gap-3">
                <ClipboardList className="size-8 text-[#5a5a5f]" />
                <p className="text-[#5a5a5f] font-medium">No submissions yet</p>
              </div>
            )}
            {!loadingSubmissions && submissions.map((sub) => (
              <div key={sub._id} className="bg-[#16161a] border border-white/[0.06] rounded-2xl p-4 mb-3 hover:border-white/[0.1] transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="size-8 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center font-bold text-xs text-white">
                    {(sub.studentName || sub.studentEmail).charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-white font-semibold text-sm truncate">{sub.studentName || 'Unnamed'}</p>
                    <p className="text-[#8a8a8f] text-xs truncate">{sub.studentEmail}</p>
                  </div>
                  <span className="text-[#5a5a5f] text-xs">
                    {new Date(sub.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                {sub.attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {sub.attachments.map((att, i) => (
                      <a key={i} href={att.filePath} target="_blank" rel="noopener noreferrer" download
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/15 text-blue-300 text-xs font-medium hover:bg-blue-500/20 transition-all">
                        <Download className="size-3" />
                        <span className="truncate max-w-[150px]">{att.fileName}</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Main modal with tabs ──
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl bg-[#111115] border border-white/10 rounded-3xl shadow-[0_8px_80px_rgba(0,0,0,0.8)] max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 pb-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500/30 to-purple-500/10 border border-indigo-500/20 shrink-0">
                <BookOpen className="size-5 text-indigo-400" />
              </div>
              <div className="min-w-0">
                <h2 className="text-white font-bold text-lg truncate">{classroom.name}</h2>
                <p className="text-[#8a8a8f] text-xs">{classroom.subject} · Code: <span className="font-mono font-bold text-indigo-400">{classroom.code}</span></p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl text-[#8a8a8f] hover:text-white hover:bg-white/5 transition-colors shrink-0">
              <X className="size-4" />
            </button>
          </div>
          {/* Tabs */}
          <div className="flex gap-1 bg-[#1a1a1e] rounded-xl p-1">
            <button onClick={() => setTab('assignments')}
              className={cn('flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all',
                tab === 'assignments' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/20' : 'text-[#8a8a8f] hover:text-white')}>
              <ClipboardList className="size-3.5" /> Assignments
            </button>
            <button onClick={() => setTab('students')}
              className={cn('flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all',
                tab === 'students' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/20' : 'text-[#8a8a8f] hover:text-white')}>
              <Users className="size-3.5" /> Students ({classroom.students.length})
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* ── ASSIGNMENTS TAB ── */}
          {tab === 'assignments' && (
            <>
              {/* Create button or form */}
              {!showCreate ? (
                <button onClick={() => setShowCreate(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-white/10 text-[#8a8a8f] hover:text-white hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all text-sm font-medium mb-4">
                  <Plus className="size-4" /> Create New Assignment
                </button>
              ) : (
                <form onSubmit={handleCreateAssignment} className="bg-[#16161a] border border-white/[0.06] rounded-2xl p-5 mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-semibold text-sm">New Assignment</h3>
                    <button type="button" onClick={() => { setShowCreate(false); setCreateError(''); }}
                      className="text-[#8a8a8f] hover:text-white"><X className="size-4" /></button>
                  </div>
                  <div className="flex flex-col gap-3">
                    <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Assignment title"
                      className="bg-[#1a1a1e] border border-white/8 rounded-xl px-4 py-2.5 text-white placeholder-[#5a5a5f] text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/50" />
                    <textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Description (optional)" rows={3}
                      className="bg-[#1a1a1e] border border-white/8 rounded-xl px-4 py-2.5 text-white placeholder-[#5a5a5f] text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/50 resize-none" />
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <label className="text-xs text-[#8a8a8f] mb-1 block">Due Date (optional)</label>
                        <input type="datetime-local" value={newDue} onChange={(e) => setNewDue(e.target.value)}
                          className="w-full bg-[#1a1a1e] border border-white/8 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/50 [color-scheme:dark]" />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs text-[#8a8a8f] mb-1 block">Attachments</label>
                        <label className="flex items-center gap-2 px-4 py-2.5 bg-[#1a1a1e] border border-white/8 rounded-xl text-[#8a8a8f] text-sm cursor-pointer hover:text-white hover:border-indigo-500/30 transition-all">
                          <Upload className="size-3.5" />
                          {newFiles.length > 0 ? `${newFiles.length} file${newFiles.length > 1 ? 's' : ''}` : 'Choose files'}
                          <input type="file" multiple className="hidden" onChange={(e) => setNewFiles(Array.from(e.target.files || []))} />
                        </label>
                      </div>
                    </div>
                    {newFiles.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {newFiles.map((f, i) => (
                          <span key={i} className="flex items-center gap-1 px-2 py-1 bg-indigo-500/10 border border-indigo-500/15 rounded-lg text-indigo-300 text-xs">
                            <Paperclip className="size-3" />{f.name}
                          </span>
                        ))}
                      </div>
                    )}
                    {createError && <p className="text-red-400 text-xs bg-red-500/10 rounded-lg px-3 py-2">{createError}</p>}
                    <button type="submit" disabled={creating || !newTitle.trim()}
                      className="flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2.5 rounded-xl transition-all disabled:opacity-50 text-sm">
                      {creating ? <Loader2 className="size-3.5 animate-spin" /> : <Plus className="size-3.5" />}
                      {creating ? 'Creating...' : 'Create Assignment'}
                    </button>
                  </div>
                </form>
              )}

              {/* Assignment list */}
              {loadingAssignments ? (
                <div className="flex justify-center py-12"><Loader2 className="size-6 text-indigo-400 animate-spin" /></div>
              ) : assignments.length === 0 ? (
                <div className="flex flex-col items-center py-12 gap-3">
                  <ClipboardList className="size-8 text-[#5a5a5f]" />
                  <p className="text-[#5a5a5f] font-medium">No assignments yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {assignments.map((a) => {
                    const isPastDue = a.dueDate && new Date(a.dueDate) < new Date();
                    return (
                      <div key={a._id} className="bg-[#16161a] border border-white/[0.06] rounded-2xl p-4 hover:border-white/[0.1] transition-all">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="min-w-0">
                            <h4 className="text-white font-semibold text-sm">{a.title}</h4>
                            {a.description && <p className="text-[#8a8a8f] text-xs mt-1 line-clamp-2">{a.description}</p>}
                          </div>
                          <button onClick={() => handleViewSubmissions(a)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/15 text-indigo-300 text-xs font-medium hover:bg-indigo-500/20 transition-all shrink-0">
                            <Eye className="size-3" /> Submissions
                          </button>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-[#8a8a8f]">
                          <span className="flex items-center gap-1">
                            <Calendar className="size-3" />
                            {new Date(a.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </span>
                          {a.dueDate && (
                            <span className={cn('flex items-center gap-1', isPastDue ? 'text-red-400' : 'text-amber-400')}>
                              <Calendar className="size-3" />
                              Due: {new Date(a.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                          {a.attachments.length > 0 && (
                            <span className="flex items-center gap-1 text-blue-400">
                              <Paperclip className="size-3" /> {a.attachments.length} file{a.attachments.length > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                        {a.attachments.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {a.attachments.map((att, i) => (
                              <a key={i} href={att.filePath} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-1 px-2 py-1 bg-blue-500/10 border border-blue-500/15 rounded-lg text-blue-300 text-xs hover:bg-blue-500/20 transition-all">
                                <Download className="size-3" /><span className="truncate max-w-[120px]">{att.fileName}</span>
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* ── STUDENTS TAB ── */}
          {tab === 'students' && (
            <>
              {loadingStudents ? (
                <div className="flex justify-center py-12"><Loader2 className="size-6 text-indigo-400 animate-spin" /></div>
              ) : students.length === 0 ? (
                <div className="flex flex-col items-center py-12 gap-3">
                  <Users className="size-8 text-[#5a5a5f]" />
                  <p className="text-[#5a5a5f] font-medium">No students have joined yet</p>
                  <p className="text-[#3a3a3f] text-sm text-center max-w-xs">
                    Share code <span className="font-mono font-bold text-indigo-400">{classroom.code}</span> with students.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {students.map((s, idx) => (
                    <div key={s._id} className="bg-[#16161a] border border-white/[0.06] rounded-2xl p-4 hover:border-white/[0.1] transition-all">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="size-9 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center font-bold text-sm text-white shadow-lg shrink-0">
                          {(s.name || s.email).charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-white font-semibold text-sm truncate">{s.name || 'Unnamed'}</p>
                          <div className="flex items-center gap-1 text-[#8a8a8f] text-xs">
                            <Mail className="size-3" /><span className="truncate">{s.email}</span>
                          </div>
                        </div>
                        <span className="text-[#5a5a5f] text-xs bg-white/[0.03] px-2 py-1 rounded-lg">#{idx + 1}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {s.registrationNumber && (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/15">
                            <FileText className="size-3 text-indigo-400" />
                            <span className="text-indigo-300 text-xs font-medium">{s.registrationNumber}</span>
                          </div>
                        )}
                        {s.course && (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/15">
                            <BookMarked className="size-3 text-emerald-400" />
                            <span className="text-emerald-300 text-xs font-medium">{s.course}</span>
                          </div>
                        )}
                        {s.section && (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/15">
                            <LayoutList className="size-3 text-amber-400" />
                            <span className="text-amber-300 text-xs font-medium">Section {s.section}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Code Badge
// ──────────────────────────────────────────────────────────────────────────────
function CodeBadge({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation(); navigator.clipboard.writeText(code);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy}
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-white hover:bg-slate-700 transition-all active:scale-95 group"
      title="Click to copy code">
      <Hash className="size-3 text-white/60" />
      <span className="font-mono font-bold text-xs tracking-widest">{code}</span>
      {copied ? <Check className="size-3 text-green-400" /> : <Copy className="size-3 text-white/40 group-hover:text-white/80 transition-colors" />}
    </button>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Professor Dashboard
// ──────────────────────────────────────────────────────────────────────────────
export function ProfessorDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [dbUser, setDbUser] = useState<{ name?: string; email?: string } | null>(null);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null);

  const fetchClassrooms = useCallback(async (email: string) => {
    try {
      const res = await fetch(`/api/classroom/list?role=professor&email=${encodeURIComponent(email)}`);
      if (res.ok) setClassrooms(await res.json());
    } catch (err) { console.error('Failed to fetch classrooms:', err); }
  }, []);

  useEffect(() => {
    const localEmail = typeof window !== 'undefined' ? localStorage.getItem('userEmail') : null;
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      const emailToFetch = u?.email || localEmail;
      if (emailToFetch) {
        try {
          const res = await fetch(`/api/user?email=${emailToFetch}`);
          if (res.ok) { const data = await res.json(); setDbUser(data); await fetchClassrooms(emailToFetch); }
        } catch (err) { console.error('Failed to fetch user:', err); }
      }
      setLoading(false);
    });
    return unsub;
  }, [fetchClassrooms]);

  const handleSignOut = async () => {
    try { await signOut(auth); } catch { /* ignore */ }
    localStorage.removeItem('userEmail'); localStorage.removeItem('userRole');
    router.push('/login');
  };

  const handleCreated = (c: Classroom) => { setClassrooms(prev => [c, ...prev]); setShowModal(false); };
  const email = dbUser?.email || user?.email || '';
  const name = dbUser?.name || user?.displayName || 'Professor';

  if (loading) return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center"><Loader2 className="size-8 text-blue-400 animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />

      <header className="relative z-10 h-16 border-b border-white/[0.06] bg-[#0a0a0a]/80 backdrop-blur-xl flex items-center px-6 gap-4">
        <div className="flex items-center gap-2">
          <div className="size-6 rounded-md bg-gradient-to-tr from-blue-500 to-indigo-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] flex items-center justify-center">
            <Sparkles className="size-3.5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">Learn X</span>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-white leading-tight">{name}</p>
            <p className="text-xs text-[#8a8a8f]">Professor</p>
          </div>
          <div className="size-9 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center font-bold text-sm shadow-lg">
            {name.charAt(0).toUpperCase()}
          </div>
          <button onClick={handleSignOut} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[#8a8a8f] hover:text-white hover:bg-white/5 transition-all text-sm">
            <LogOut className="size-3.5" /><span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </header>

      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-8">
          <div className="flex-1">
            <ClassroomBannerHero
              title="Your Classrooms"
              subtitle={classrooms.length === 0
                ? 'No classrooms yet — create one to get started.'
                : `${classrooms.length} classroom${classrooms.length > 1 ? 's' : ''} · Hover a card to manage assignments & view analytics`
              }
              badge="Professor Dashboard"
              badgeColor="from-violet-500 to-purple-600"
            />
          </div>
          <button onClick={() => setShowModal(true)}
            className={cn('cursor-pointer select-none rounded-full font-semibold transition-all duration-500 ease-out',
              'bg-gradient-to-b shadow-lg hover:shadow-2xl from-emerald-400 to-teal-400 px-7 py-3 text-base')}
            style={{ transform: 'rotate(-2deg)', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15), 0 4px 10px -2px rgba(0,0,0,0.1), inset 0 1px 2px rgba(255,255,255,0.2)' }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'rotate(0deg) scale(1.08) translateY(-6px)'; e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(0,0,0,0.25), 0 12px 24px -8px rgba(0,0,0,0.15), inset 0 2px 4px rgba(255,255,255,0.3)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'rotate(-2deg) scale(1)'; e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0,0,0,0.15), 0 4px 10px -2px rgba(0,0,0,0.1), inset 0 1px 2px rgba(255,255,255,0.2)'; }}>
            <span className="relative flex items-center gap-2 text-slate-800 drop-shadow-[0_1px_1px_rgba(255,255,255,0.3)]">
              <Plus className="size-4" /> Create New Classroom
            </span>
            <div className="pointer-events-none absolute inset-0 rounded-full opacity-50"
              style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 50%)' }} />
          </button>
        </div>

        {classrooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/[0.06]"><GraduationCap className="size-10 text-[#5a5a5f]" /></div>
            <p className="text-[#5a5a5f] font-medium text-lg">No classrooms yet</p>
            <p className="text-[#3a3a3f] text-sm text-center max-w-xs">Click &ldquo;Create New Classroom&rdquo; to get started.</p>
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-5 py-8">
            {classrooms.map((c, i) => {
              const colorIdx = i % badgeColors.length;
              const rotation = badgeRotations[i % badgeRotations.length];
              const isHovered = hoveredId === c._id;
              const isOtherHovered = hoveredId !== null && hoveredId !== c._id;
              return (
                <div key={c._id} onClick={() => setSelectedClassroom(c)} onMouseEnter={() => setHoveredId(c._id)} onMouseLeave={() => setHoveredId(null)}
                  className={cn('relative cursor-pointer select-none rounded-3xl font-semibold transition-all duration-500 ease-out bg-gradient-to-b shadow-lg hover:shadow-2xl',
                    badgeColors[colorIdx], 'px-6 py-4 min-w-[220px] max-w-[300px]')}
                  style={{
                    transform: `rotate(${isHovered ? 0 : rotation}deg) scale(${isHovered ? 1.06 : isOtherHovered ? 0.96 : 1}) translateY(${isHovered ? -8 : 0}px)`,
                    zIndex: isHovered ? 100 : 10 - i,
                    boxShadow: isHovered ? '0 25px 50px -12px rgba(0,0,0,0.25), 0 12px 24px -8px rgba(0,0,0,0.15), inset 0 2px 4px rgba(255,255,255,0.3)'
                      : '0 10px 25px -5px rgba(0,0,0,0.15), 0 4px 10px -2px rgba(0,0,0,0.1), inset 0 1px 2px rgba(255,255,255,0.2)',
                  }}>
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="size-4 text-slate-700" />
                    <h3 className="text-slate-800 font-bold text-base leading-tight truncate drop-shadow-[0_1px_1px_rgba(255,255,255,0.3)]">{c.name}</h3>
                  </div>
                  <p className="text-slate-700/70 text-xs mb-3 truncate">{c.subject}</p>
                  <div className="flex items-center justify-between gap-2">
                    <CodeBadge code={c.code} />
                    <div className="flex items-center gap-1.5 text-xs text-slate-700/60"><Users className="size-3" /><span>{c.students.length}</span></div>
                  </div>
                  <div className={cn('mt-2 flex items-center justify-between gap-2 transition-opacity duration-300', isHovered ? 'opacity-100' : 'opacity-0')}>
                    <span className="flex items-center gap-1 text-slate-700/60 text-xs">
                      <Eye className="size-3" />Click to manage
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); router.push(`/analytics/${c._id}`); }}
                      className="flex items-center gap-1 px-2 py-1 rounded-full bg-slate-800/60 border border-slate-700/50 text-xs text-slate-300 hover:text-white hover:bg-slate-700 transition-all pointer-events-auto"
                    >
                      <BarChart2 className="size-3" /> Analytics
                    </button>
                  </div>
                  <div className="pointer-events-none absolute inset-0 rounded-3xl opacity-50"
                    style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 50%)' }} />
                </div>
              );
            })}
          </div>
        )}
      </main>

      {showModal && <CreateClassroomModal onClose={() => setShowModal(false)} onCreated={handleCreated} professorEmail={email} professorName={name} />}
      {selectedClassroom && <ClassroomDetailModal classroom={selectedClassroom} onClose={() => setSelectedClassroom(null)} />}
    </div>
  );
}
