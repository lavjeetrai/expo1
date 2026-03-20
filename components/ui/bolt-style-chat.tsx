'use client'

import React, { useState, useRef, useEffect } from 'react'
import { 
  Plus, Paperclip, Image,
  SendHorizontal, Calendar as CalendarIcon,
  ChevronRight, Book, Clock, X,
  LayoutDashboard, MessageSquare, LogOut,
  Sparkles
} from 'lucide-react'
import { ASMRStaticBackground } from './asmr-background'
import { Calendar } from "@/components/ui/calendar"
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/firebase'
import { signOut, onAuthStateChanged, User } from 'firebase/auth'
import { AnimatedProfileCard, ProfileCardContent } from '@/components/ui/animated-profile-card'

export type ScheduleMap = { date: Date; subject?: string; time: string };

interface DbUser {
  name?: string;
  email?: string;
  role?: string;
  registrationNumber?: string;
  course?: string;
  section?: string;
}

export type ChatQuery = {
  id: string;
  message: string;
  timestamp: Date;
  memoryTrail: ScheduleMap | null;
};

// GLASSMORPHISM SIDEBAR
function ChatSidebar({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (t: string) => void }) {
  const router = useRouter();
  const [showProfile, setShowProfile] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [dbUser, setDbUser] = useState<DbUser | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      const localEmail = typeof window !== 'undefined' ? localStorage.getItem("userEmail") : null;
      const emailToFetch = u?.email || localEmail;
      
      if (emailToFetch) {
        try {
          const res = await fetch(`/api/user?email=${emailToFetch}`);
          if (res.ok) {
            const data = await res.json();
            setDbUser(data);
          }
        } catch (error) {
          console.error("Failed to fetch user:", error);
        }
      } else {
        setDbUser(null);
      }
    });
    return unsub;
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const navItems = [
    { icon: <LayoutDashboard className="size-[1.15rem]" />, label: 'ASK' },
    { icon: <MessageSquare className="size-[1.15rem]" />, label: 'HISTORY' },
  ];

  const bottomItems = [
    { icon: <LogOut className="size-[1.15rem]" />, label: 'SIGN OUT' },
  ];

  const roleDisplay = dbUser?.role === 'professor' ? 'Professor' : 'Student';
  const nameDisplay = dbUser?.name || user?.displayName || 'Guest User';
  const emailDisplay = dbUser?.email || user?.email || 'guest@example.com';
  
  let bioDisplay = `Email: ${emailDisplay}`;
  if (dbUser?.registrationNumber) bioDisplay += `\nReg No: ${dbUser.registrationNumber}`;
  if (dbUser?.course) bioDisplay += `\nCourse: ${dbUser.course}`;
  if (dbUser?.section) bioDisplay += `\nSection: ${dbUser.section}`;

  const planDisplay = roleDisplay === 'Professor' ? 'Staff' : 'Student Plan';

  const cardData = {
    avatarSrc: user?.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${nameDisplay}&backgroundColor=1488fc`,
    avatarFallback: nameDisplay.substring(0,2).toUpperCase(),
    name: nameDisplay,
    location: roleDisplay,
    bio: bioDisplay,
    socials: []
  };

  return (
    <div className="fixed left-0 top-0 bottom-0 w-64 border-r border-white/5 bg-[#0a0a0a]/40 backdrop-blur-2xl z-40 flex flex-col pointer-events-auto transition-transform duration-300">
      
      {/* Logo/Brand */}
      <div className="h-16 shrink-0 flex items-center px-6 border-b border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <div className="size-6 rounded-md bg-gradient-to-tr from-blue-500 to-indigo-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] flex items-center justify-center p-1">
            <Sparkles className="size-3.5 text-white" />
          </div>
          <span className="text-white font-bold tracking-tight text-lg">Learn X</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex flex-col gap-1 px-3 py-6 flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <style dangerouslySetInnerHTML={{ __html: `::-webkit-scrollbar { display: none; }` }} />
        <div className="text-[10px] font-bold text-[#8a8a8f] uppercase tracking-widest px-3 mb-2">Menu</div>
        {navItems.map(item => {
          const isActive = activeTab === item.label;
          return (
            <button
              key={item.label}
              onClick={() => setActiveTab(item.label)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive 
                  ? 'bg-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.02)]' 
                  : 'text-[#8a8a8f] hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className={`transition-colors ${isActive ? 'text-blue-400' : 'group-hover:text-white'}`}>
                {item.icon}
              </div>
              {item.label}
            </button>
          )
        })}
      </div>

      {/* Bottom Actions */}
      <div className="px-3 pb-6 flex flex-col gap-1 shrink-0">
        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent my-2" />
        
        {bottomItems.map(item => (
          <button
            key={item.label}
            onClick={item.label === 'SIGN OUT' ? handleSignOut : undefined}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#8a8a8f] hover:bg-white/5 hover:text-white transition-all duration-200 group"
          >
            <div className="group-hover:text-white transition-colors">
              {item.icon}
            </div>
            {item.label}
          </button>
        ))}

        {/* Profile Card Sidebar Button & Popup */}
        <div className="relative mt-4">
          <div 
            onClick={() => setShowProfile(!showProfile)}
            className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-colors cursor-pointer flex items-center gap-3 group shadow-[0_4px_24px_rgba(0,0,0,0.5)]"
          >
            <div className="relative size-10 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-[2px] shadow-lg shadow-blue-500/20">
              <div className="absolute inset-[2px] rounded-full bg-black" />
              <img 
                src={cardData.avatarSrc} 
                alt="Avatar" 
                className="relative rounded-full w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col flex-1 overflow-hidden">
              <span className="text-sm font-semibold text-white truncate group-hover:text-blue-200 transition-colors duration-200">{cardData.name}</span>
              <span className="text-xs font-medium text-[#8a8a8f] truncate group-hover:text-[#a0a0a5] transition-colors duration-200">{planDisplay}</span>
            </div>
          </div>

          {/* Expanded Profile Card Popup */}
          {showProfile && (
            <div className="absolute bottom-0 left-[calc(100%+16px)] z-50 animate-in fade-in zoom-in-95 duration-200 shadow-[0_0_80px_rgba(0,0,0,0.8)] rounded-3xl">
              <AnimatedProfileCard
                accentColor="#1488fc"
                onAccentForegroundColor="#ffffff"
                onAccentMutedForegroundColor="rgba(255, 255, 255, 0.7)"
                baseCard={
                  <ProfileCardContent 
                    {...cardData} 
                    variant="default" 
                    showAvatar={false} 
                    className="bg-[#111116] border border-white/10" 
                    titleStyle={{ color: "white" }} 
                    descriptionClassName="text-white/60" 
                    bioClassName="text-white/80" 
                  />
                }
                overlayCard={
                  <ProfileCardContent
                    {...cardData}
                    variant="on-accent"
                    showAvatar={true}
                    cardStyle={{ backgroundColor: 'var(--accent-color)' }}
                  />
                }
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function CalendarPopover({ onScheduleSelect }: { onScheduleSelect: (data: ScheduleMap) => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  
  return (
    <div className="flex flex-col items-start w-full">
      <div className="mb-3 pl-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-[#8a8a8f] hover:bg-white/10 hover:text-white transition-colors"
        >
          <CalendarIcon className="size-3.5" />
          <span>Set Date</span>
        </button>
      </div>
      
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="relative z-[9999] shadow-xl overflow-visible rounded-xl border border-white/10 bg-[#1a1a1e] mb-6 p-4 w-[320px] animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="flex flex-col gap-4">
              <div className="bg-[#0a0a0a] rounded-lg border border-white/5 overflow-hidden p-1">
                <Calendar 
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className="bg-transparent"
                  classNames={{
                    day_button: "text-white/90 hover:bg-white/10 w-8 h-8 flex items-center justify-center",
                    month_caption: "text-white font-bold text-base mb-2",
                    weekday: "text-white/40 font-bold uppercase text-[10px]",
                    outside: "text-white/10",
                    today: "text-[#1488fc] font-bold border border-[#1488fc]/30",
                    selected: "bg-[#1488fc] text-white rounded-md",
                    button_next: "text-white/60 hover:text-white",
                    button_previous: "text-white/60 hover:text-white",
                    nav: "gap-1 flex items-center"
                  }}
                />
              </div>

              <button
                onClick={() => {
                  // Default to current time since time selection is removed
                  const now = new Date();
                  const timeStr = format(now, "hh:mm a");
                  onScheduleSelect({ date: selectedDate, time: timeStr });
                  setIsOpen(false);
                }}
                className="w-full py-2 bg-[#1488fc] text-white rounded-lg text-xs font-bold hover:bg-[#1a94ff] transition-all shadow-lg shadow-[#1488fc]/20"
              >
                Confirm Date
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// CHAT INPUT
function ChatInput({ onSend, placeholder = "ASK YOUR QUESTION" }: {
  onSend?: (message: string, memoryTrail?: ScheduleMap | null) => void
  placeholder?: string
}) {
  const [message, setMessage] = useState('')
  const [showAttachMenu, setShowAttachMenu] = useState(false)
  const [memoryTrail, setMemoryTrail] = useState<ScheduleMap | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
    }
  }, [message])

  const handleSubmit = () => {
    if (message.trim() || memoryTrail) {
      onSend?.(message, memoryTrail)
      setMessage('')
      setMemoryTrail(null)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="relative w-full max-w-[680px] mx-auto flex flex-col items-start gap-1">
      <CalendarPopover onScheduleSelect={(data) => {
        setMemoryTrail(data);
        setTimeout(() => textareaRef.current?.focus(), 50);
      }} />
      <div className="relative w-full">
        <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-b from-white/[0.08] to-transparent pointer-events-none" />
        <div className="relative rounded-2xl bg-[#1e1e22] ring-1 ring-white/[0.08] shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_2px_20px_rgba(0,0,0,0.4)] flex flex-col">
          
          {/* MEMORY TRAIL */}
          {memoryTrail && (
            <div className="flex items-center flex-wrap gap-2 px-4 pt-4 pb-0 text-[11px] font-medium text-[#a0a0a5] select-none animate-in fade-in slide-in-from-top-1">
              <span className="text-[#c0c0c5]/70 uppercase tracking-widest text-[10px]">Active Schedule</span>
              <div className="flex items-center gap-1.5 bg-[#2a2a30] rounded border border-white/5 px-2 py-1 shadow-inner">
                <CalendarIcon className="size-3 text-[#1488fc]" />
                {format(memoryTrail.date, "MMM do, y")}
              </div>
              {memoryTrail.subject && (
                <>
                  <ChevronRight className="size-3 text-[#5a5a5f]" />
                  <div className="flex items-center gap-1.5 bg-[#2a2a30] rounded border border-white/5 px-2 py-1 shadow-inner">
                    <Book className="size-3 text-[#1488fc]" />
                    <span className="truncate max-w-[120px]">{memoryTrail.subject.split('(')[0].trim()}</span>
                  </div>
                </>
              )}
              <ChevronRight className="size-3 text-[#5a5a5f]" />
              <div className="flex items-center gap-1.5 bg-[#2a2a30] rounded border border-white/5 px-2 py-1 shadow-inner">
                <Clock className="size-3 text-[#1488fc]" />
                {memoryTrail.time}
              </div>
              <button 
                onClick={() => setMemoryTrail(null)} 
                className="ml-auto hover:text-white transition-colors p-1 rounded-full hover:bg-white/10 active:scale-90"
              >
                <X className="size-3.5"/>
              </button>
            </div>
          )}

          <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full resize-none bg-transparent text-[15px] text-white px-5 pt-5 pb-3 focus:outline-none min-h-[80px] max-h-[200px] placeholder-[#5a5a5f]"
            style={{ height: '80px' }}
          />
        </div>

        <div className="flex items-center justify-between px-3 pb-3 pt-1">
          <div className="flex items-center gap-1">
            <div className="relative">
              <button
                onClick={() => setShowAttachMenu(!showAttachMenu)}
                className="flex items-center justify-center size-8 rounded-full bg-white/[0.08] hover:bg-white/[0.12] text-[#8a8a8f] hover:text-white transition-all duration-200 active:scale-95"
              >
                <Plus className={`size-4 transition-transform duration-200 ${showAttachMenu ? 'rotate-45' : ''}`} />
              </button>

              {showAttachMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowAttachMenu(false)} />
                  <div className="absolute bottom-full left-0 mb-2 z-50 bg-[#1a1a1e]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl shadow-black/50 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <div className="p-1.5 min-w-[180px]">
                      {/* Hidden File Inputs */}
                      <input id="file-upload" type="file" className="hidden" multiple onChange={(e) => {
                        console.log("Files selected:", e.target.files);
                        setShowAttachMenu(false);
                      }} />
                      <input id="image-upload" type="file" accept="image/*" className="hidden" multiple onChange={(e) => {
                        console.log("Images selected:", e.target.files);
                        setShowAttachMenu(false);
                      }} />

                      <button 
                        onClick={() => document.getElementById('file-upload')?.click()}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[#a0a0a5] hover:bg-white/5 hover:text-white transition-all duration-150"
                      >
                        <Paperclip className="size-4" />
                        <span className="text-sm">Upload file</span>
                      </button>
                      <button 
                        onClick={() => document.getElementById('image-upload')?.click()}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[#a0a0a5] hover:bg-white/5 hover:text-white transition-all duration-150"
                      >
                        <Image className="size-4" />
                        <span className="text-sm">Add image</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            <button
              onClick={handleSubmit}
              disabled={!message.trim()}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-[#1488fc] hover:bg-[#1a94ff] text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 shadow-[0_0_20px_rgba(20,136,252,0.3)]"
            >
              <span className="hidden sm:inline">SEND</span>
              <SendHorizontal className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
    </div>
  )
}

// MAIN BOLT CHAT COMPONENT
interface BoltChatProps {
  placeholder?: string
  onSend?: (message: string) => void
  classroomId?: string
  studentEmail?: string
  studentName?: string
}

export function BoltStyleChat({
  placeholder = "ASK YOUR QUESTION",
  onSend,
  classroomId,
  studentEmail,
  studentName,
}: BoltChatProps) {
  const [activeTab, setActiveTab] = useState('ASK');
  const [history, setHistory] = useState<ChatQuery[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Load persisted history from DB on mount
  useEffect(() => {
    if (!classroomId || !studentEmail) return;
    let cancelled = false;
    const load = async () => {
      setHistoryLoading(true);
      try {
        const res = await fetch(`/api/history?classroomId=${encodeURIComponent(classroomId)}&studentEmail=${encodeURIComponent(studentEmail)}`);
        const records = await res.json() as Array<{ _id: string; content: string; createdAt: string }>;
        if (!cancelled && Array.isArray(records)) {
          setHistory(records.map(r => ({
            id: r._id,
            message: r.content,
            timestamp: new Date(r.createdAt),
            memoryTrail: null,
          })));
        }
      } catch { /* graceful fallback */ }
      finally { if (!cancelled) setHistoryLoading(false); }
    };
    load();
    return () => { cancelled = true; };
  }, [classroomId, studentEmail]);

  const handleSend = (message: string, trail?: ScheduleMap | null) => {
    setHistory(prev => [{
      id: Date.now().toString(),
      message,
      timestamp: new Date(),
      memoryTrail: trail || null
    }, ...prev]);
    setActiveTab('HISTORY');

    // Fire AI analysis in background — non-blocking
    if (classroomId && studentEmail && message.trim()) {
      void fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classroomId,
          studentEmail,
          studentName: studentName || '',
          content: message.trim(),
          type: 'question',
        }),
      }).catch(() => { /* silent fail */ });
    }

    if (onSend) {
      let finalMessage = message;
      const finalTrail = trail || { 
        date: new Date(), 
        time: format(new Date(), "hh:mm a"),
        subject: "Real-time" 
      };
      
      const dateStr = format(finalTrail.date, "MMM do, yyyy");
      const subjectStr = finalTrail.subject ? finalTrail.subject.split('(')[0] : "General";
      
      finalMessage = `Context: ${dateStr} | ${subjectStr} | ${finalTrail.time}\n` + finalMessage;
      onSend(finalMessage);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full bg-black overflow-hidden">
      {/* Interactive ASMR Canvas Background */}
      <div className="absolute inset-0 z-0">
        <ASMRStaticBackground />
      </div>

      {/* Sidebar */}
      <ChatSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Content container - Main chat area */}
      {/* Shift right by the sidebar width (w-64 = 16rem = 256px) on md+ screens */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-1 h-screen px-4 md:ml-64 pointer-events-none w-full">

        {activeTab === 'ASK' ? (
          <div className="w-full max-w-[750px] mb-6 sm:mb-8 mt-4 pointer-events-auto flex flex-col items-center justify-center shadow-[0_0_120px_rgba(0,0,0,0.5)] rounded-3xl">
            <ChatInput placeholder={placeholder} onSend={handleSend} />
          </div>
        ) : (
          <div className="w-full max-w-[800px] h-full py-16 pointer-events-auto flex flex-col items-start justify-start overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
             <style dangerouslySetInnerHTML={{ __html: `::-webkit-scrollbar { display: none; }` }} />
             <h2 className="text-3xl font-bold text-white mb-8 px-4">Your History</h2>
             {historyLoading ? (
               <div className="flex items-center gap-3 px-4 text-[#8a8a8f] text-sm">
                 <span className="size-4 border-2 border-[#1488fc]/30 border-t-[#1488fc] rounded-full animate-spin" />
                 Loading your history...
               </div>
             ) : history.length === 0 ? (
               <div className="text-[#8a8a8f] px-4 font-medium italic">No questions asked yet. Head over to the ASK tab to get started!</div>
             ) : (
               <div className="flex flex-col gap-6 w-full px-4 pb-20">
                 {history.map((item) => (
                   <div key={item.id} className="bg-[#1e1e22]/50 backdrop-blur-md border border-white/5 rounded-3xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.3)] flex flex-col gap-4">
                      {item.memoryTrail && (
                        <div className="flex items-center flex-wrap gap-2 text-[11px] font-medium text-[#c0c0c5] select-none bg-black/40 rounded-xl p-2 w-fit">
                          <span className="text-white/60 uppercase tracking-widest text-[10px] pr-2 border-r border-white/10">Attached Context</span>
                          <div className="flex items-center gap-1.5 bg-[#2a2a30] rounded-lg border border-white/5 px-2.5 py-1.5 shadow-inner">
                            <CalendarIcon className="size-3 text-[#1488fc]" />
                            {format(item.memoryTrail.date, "MMM do, y")}
                          </div>
                          <ChevronRight className="size-3 text-[#5a5a5f]" />
                          <div className="flex items-center gap-1.5 bg-[#2a2a30] rounded-lg border border-white/5 px-2.5 py-1.5 shadow-inner">
                            <Book className="size-3 text-[#1488fc]" />
                            <span className="truncate max-w-[150px]">
                              {item.memoryTrail.subject ? item.memoryTrail.subject.split('(')[0].trim() : "General"}
                            </span>
                          </div>
                          <ChevronRight className="size-3 text-[#5a5a5f]" />
                          <div className="flex items-center gap-1.5 bg-[#2a2a30] rounded-lg border border-white/5 px-2.5 py-1.5 shadow-inner">
                            <Clock className="size-3 text-[#1488fc]" />
                            {item.memoryTrail.time}
                          </div>
                        </div>
                      )}
                      
                      {item.message && (
                        <p className="text-white text-[16px] leading-relaxed break-words pl-1">{item.message}</p>
                      )}
                      
                      <div className="text-[10px] text-[#5a5a5f] uppercase tracking-widest mt-1 pl-1 font-bold">
                        {format(item.timestamp, "MMM d • h:mm a")}
                      </div>
                   </div>
                 ))}
               </div>
             )}
          </div>
        )}

      </div>
    </div>
  )
}
