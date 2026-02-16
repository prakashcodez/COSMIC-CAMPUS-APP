
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ClassSession, ExamSchedule, ExamSubject, UserProfile } from '../types';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const SESSION_STYLES = {
  'LECTURE': { border: 'border-l-indigo-500', bg: 'bg-indigo-500/10', dot: 'bg-indigo-500', text: 'text-indigo-400', badge: 'bg-indigo-500/20 text-indigo-300' },
  'LAB': { border: 'border-l-emerald-500', bg: 'bg-emerald-500/10', dot: 'bg-emerald-500', text: 'text-emerald-400', badge: 'bg-emerald-500/20 text-emerald-300' },
  'WORKSHOP': { border: 'border-l-amber-500', bg: 'bg-amber-500/10', dot: 'bg-amber-500', text: 'text-amber-400', badge: 'bg-amber-500/20 text-amber-300' },
  'SEMINAR': { border: 'border-l-pink-500', bg: 'bg-pink-500/10', dot: 'bg-pink-500', text: 'text-pink-400', badge: 'bg-pink-500/20 text-pink-300' },
  'BREAK': { border: 'border-l-slate-500', bg: 'bg-slate-500/10', dot: 'bg-slate-500', text: 'text-slate-400', badge: 'bg-slate-500/20 text-slate-300' },
  'THEORY CUM LAB': { border: 'border-l-purple-500', bg: 'bg-purple-500/10', dot: 'bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.8)]', text: 'text-purple-400', badge: 'bg-purple-500/20 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.4)]' }
};

export const SESSION_ICONS = {
  'LECTURE': 'school', 'LAB': 'science', 'WORKSHOP': 'construction', 'SEMINAR': 'groups', 'BREAK': 'coffee', 'THEORY CUM LAB': 'biotech',
};

// Expanded vibrant color palette for subjects
const SUBJECT_COLORS = [
    'bg-gradient-to-br from-indigo-900/60 to-indigo-800/40 border-indigo-500/50 shadow-[0_0_20px_rgba(79,70,229,0.15)]',
    'bg-gradient-to-br from-emerald-900/60 to-emerald-800/40 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.15)]',
    'bg-gradient-to-br from-rose-900/60 to-rose-800/40 border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.15)]',
    'bg-gradient-to-br from-amber-900/60 to-amber-800/40 border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.15)]',
    'bg-gradient-to-br from-cyan-900/60 to-cyan-800/40 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.15)]',
    'bg-gradient-to-br from-purple-900/60 to-purple-800/40 border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.15)]',
    'bg-gradient-to-br from-blue-900/60 to-blue-800/40 border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.15)]',
    'bg-gradient-to-br from-fuchsia-900/60 to-fuchsia-800/40 border-fuchsia-500/50 shadow-[0_0_20px_rgba(217,70,239,0.15)]',
    'bg-gradient-to-br from-lime-900/60 to-lime-800/40 border-lime-500/50 shadow-[0_0_20px_rgba(132,204,22,0.15)]',
    'bg-gradient-to-br from-orange-900/60 to-orange-800/40 border-orange-500/50 shadow-[0_0_20px_rgba(249,115,22,0.15)]'
];

interface TimetableScreenProps {
  classes: ClassSession[];
  examSchedules: ExamSchedule[];
  userProfile: UserProfile | null;
  onOpenAddClass: () => void;
  onOpenAddExamGroup: () => void;
  onOpenAddSubject: (groupId: string) => void;
  onUpdateNotes: (id: string, notes: string, format: 'paragraph' | 'bullets') => void;
  onEditClass: (session: ClassSession) => void;
  onEditSubject: (groupId: string, subject: ExamSubject) => void;
  onDeleteSubject: (groupId: string, subjectId: string) => void;
  onDeleteExamGroup: (id: string) => void;
  onToggleConfirmGroup: (id: string) => void;
  onEditExamGroup: (group: ExamSchedule) => void;
}

const TimetableScreen: React.FC<TimetableScreenProps> = ({ 
    classes, examSchedules, userProfile,
    onOpenAddClass, onOpenAddExamGroup, onOpenAddSubject, 
    onEditClass, onEditSubject, onDeleteSubject, onDeleteExamGroup, onToggleConfirmGroup, onEditExamGroup 
}) => {
  const [viewMode, setViewMode] = useState<'classes' | 'exams'>('classes');
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [viewingClass, setViewingClass] = useState<ClassSession | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'group' | 'subject', id: string, parentId?: string } | null>(null);
  const [menuOpenGroupId, setMenuOpenGroupId] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000); 
    return () => clearInterval(timer);
  }, []);

  const dayClasses = useMemo(() => {
    return classes
      .filter(c => c.day === selectedDay)
      .sort((a, b) => {
         const tA = a.startTime.split(':').map(Number);
         const tB = b.startTime.split(':').map(Number);
         return (tA[0] * 60 + tA[1]) - (tB[0] * 60 + tB[1]);
      });
  }, [classes, selectedDay]);

  const timerRef = useRef<number | null>(null);
  
  const handleCardPressStart = (session: ClassSession) => {
    timerRef.current = window.setTimeout(() => setViewingClass(session), 500);
  };
  const handleCardPressEnd = () => { if (timerRef.current) clearTimeout(timerRef.current); };

  const isOngoing = (session: ClassSession) => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    if (today !== session.day) return false;
    const [sh, sm] = session.startTime.split(':').map(Number);
    const [eh, em] = session.endTime.split(':').map(Number);
    const now = currentTime.getHours() * 60 + currentTime.getMinutes();
    return now >= (sh * 60 + sm) && now < (eh * 60 + em);
  };

  const isCompleted = (session: ClassSession) => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    if (today !== session.day) return false;
    const [eh, em] = session.endTime.split(':').map(Number);
    const now = currentTime.getHours() * 60 + currentTime.getMinutes();
    return now > (eh * 60 + em);
  };

  const formatTime = (time: string) => {
    if (!time) return '';
    const [h, m] = time.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}:${m.toString().padStart(2, '0')} ${period}`;
  };

  const getDayStyle = (day: string, isSelected: boolean) => {
    const base = "px-4 py-2 rounded-xl font-bold text-[11px] transition-all border shrink-0 uppercase tracking-widest relative overflow-visible active:scale-95 whitespace-nowrap";
    const inactive = "bg-white/5 border-white/10 text-slate-500 hover:bg-white/10";
    if (!isSelected) return `${base} ${inactive}`;
    switch (day) {
        case 'Monday': return `${base} bg-indigo-600 border-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.5)] z-10`;
        case 'Tuesday': return `${base} bg-emerald-600 border-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.5)] z-10`;
        case 'Wednesday': return `${base} bg-amber-600 border-amber-500 text-white shadow-[0_0_20px_rgba(245,158,11,0.5)] z-10`;
        case 'Thursday': return `${base} bg-cyan-600 border-cyan-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.5)] z-10`;
        case 'Friday': return `${base} bg-pink-600 border-pink-500 text-white shadow-[0_0_20px_rgba(236,72,153,0.5)] z-10`;
        case 'Saturday': return `${base} bg-purple-600 border-purple-500 text-white shadow-[0_0_20px_rgba(147,51,234,0.5)] z-10`;
        case 'Sunday': return `${base} bg-rose-600 border-rose-500 text-white shadow-[0_0_20px_rgba(225,29,72,0.5)] z-10`;
        default: return `${base} bg-primary border-primary text-white shadow-lg`;
    }
  };

  // Helper to hash string to index for colors
  const getColorIndex = (str: string) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
      return Math.abs(hash) % SUBJECT_COLORS.length;
  };

  const getStartCountdown = (subjects: ExamSubject[]) => {
      if (subjects.length === 0) return null;
      const now = new Date();
      const upcoming = subjects
        .map(s => new Date(`${s.date}T${s.startTime}`))
        .filter(d => d > now)
        .sort((a,b) => a.getTime() - b.getTime());
      
      if (upcoming.length === 0) return "Finished";
      
      const next = upcoming[0];
      const diff = next.getTime() - now.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      
      if (days > 0) return `Starts in ${days} days`;
      if (hours > 0) return `Starts in ${hours} hours`;
      return "Starting soon";
  };

  return (
    <div className="p-4 space-y-4 h-full flex flex-col relative" onClick={() => setMenuOpenGroupId(null)}>
      <div className="flex items-center justify-between px-2 pt-2">
        <div className="flex-1">
          <h1 className="text-2xl font-black tracking-tight text-white drop-shadow-[0_0_15px_rgba(13,127,242,0.4)]">Planner</h1>
          
          <div className="flex gap-3 mt-4 overflow-x-auto hide-scrollbar">
              <button 
                onClick={() => setViewMode('classes')}
                className={`relative px-4 py-2 rounded-xl border transition-all duration-300 overflow-hidden group shrink-0 ${
                    viewMode === 'classes' 
                    ? 'bg-primary/20 border-primary/50 shadow-[0_0_25px_rgba(13,127,242,0.3)]' 
                    : 'bg-white/5 border-white/5 opacity-60 hover:opacity-100'
                }`}
              >
                  {viewMode === 'classes' && <div className="absolute inset-0 bg-primary/10 animate-pulse"></div>}
                  <span className={`relative z-10 text-[10px] font-black uppercase tracking-widest ${viewMode === 'classes' ? 'text-white' : 'text-slate-400'}`}>Classes</span>
              </button>
              
              <button 
                onClick={() => setViewMode('exams')}
                className={`relative px-4 py-2 rounded-xl border transition-all duration-300 overflow-hidden group shrink-0 ${
                    viewMode === 'exams' 
                    ? 'bg-rose-500/20 border-rose-500/50 shadow-[0_0_25px_rgba(244,63,94,0.3)]' 
                    : 'bg-white/5 border-white/5 opacity-60 hover:opacity-100'
                }`}
              >
                  {viewMode === 'exams' && <div className="absolute inset-0 bg-rose-500/10 animate-pulse"></div>}
                  <span className={`relative z-10 text-[10px] font-black uppercase tracking-widest ${viewMode === 'exams' ? 'text-white' : 'text-slate-400'}`}>Exams</span>
              </button>

              {userProfile?.timetableImageUrl && (
                <button 
                  onClick={() => setShowImageModal(true)}
                  className="relative px-4 py-2 rounded-xl border border-teal-500/30 bg-teal-500/10 hover:bg-teal-500/20 transition-all shrink-0 flex items-center gap-2"
                >
                    <span className="material-symbols-outlined text-sm text-teal-400">image</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-teal-400">Official</span>
                </button>
              )}
          </div>
        </div>
        
        {/* FAB */}
        <button 
          onClick={viewMode === 'classes' ? onOpenAddClass : onOpenAddExamGroup}
          className={`size-12 rounded-full flex items-center justify-center shadow-[0_8px_30px_rgba(0,0,0,0.5)] active:scale-90 transition-all hover:scale-105 border-2 border-[#101922] ${
              viewMode === 'classes' ? 'bg-primary text-white shadow-primary/30' : 'bg-rose-500 text-white shadow-rose-500/30'
          }`}
        >
          <span className="material-symbols-outlined text-2xl font-bold">add</span>
        </button>
      </div>

      {viewMode === 'classes' ? (
        <>
            <div className="flex gap-2 overflow-x-auto pt-4 pb-6 hide-scrollbar items-center -mx-4 px-6 relative z-20">
                {DAYS.map(day => (
                <button key={day} onClick={() => setSelectedDay(day)} className={getDayStyle(day, selectedDay === day)}>
                    {day}
                </button>
                ))}
            </div>

            <div id="scroll-planner" className="flex-1 relative overflow-y-auto hide-scrollbar pl-2 pb-32 -mt-4 pt-4">
                {dayClasses.length > 0 ? (
                <div className="relative min-h-full pb-32">
                    <div className="absolute left-[7px] top-4 bottom-4 w-[2px] bg-[#1e2a36] rounded-full"></div>
                    <div className="space-y-6">
                    {dayClasses.map((session) => {
                        const styles = SESSION_STYLES[session.type] || SESSION_STYLES['LECTURE'];
                        const active = isOngoing(session);
                        const completed = isCompleted(session);
                        return (
                        <div key={session.id} className="relative pl-8">
                            <div className={`absolute left-[2px] top-[18px] size-3 rounded-full border-2 border-[#101922] z-10 ${
                                active ? 'bg-primary animate-pulse shadow-[0_0_10px_rgba(13,127,242,0.8)]' : 
                                completed ? 'bg-slate-700 border-slate-600' : styles.dot
                            }`}></div>
                            <div 
                            onMouseDown={() => handleCardPressStart(session)} onMouseUp={handleCardPressEnd} onMouseLeave={handleCardPressEnd}
                            onTouchStart={() => handleCardPressStart(session)} onTouchEnd={handleCardPressEnd}
                            onDoubleClick={() => setViewingClass(session)}
                            className={`relative rounded-2xl overflow-hidden shadow-md transition-all duration-300 active:scale-[0.98] group bg-[#161f29] border border-white/5 ${styles.border} border-l-4 ${completed ? 'opacity-60 grayscale-[0.5]' : ''}`}
                            >
                            <div className="p-3.5 pl-4">
                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="text-sm font-bold text-white leading-tight truncate pr-2">{session.name}</h3>
                                    <div className="flex items-center gap-2 shrink-0">
                                        {active && <span className="text-[8px] font-black text-primary uppercase animate-pulse">In Progress</span>}
                                        <span className={`px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-wider ${styles.badge}`}>{session.type}</span>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-2.5">
                                        <span className="material-symbols-outlined text-[14px] text-slate-500">schedule</span>
                                        <span className="text-[11px] font-bold text-slate-300 tracking-wide">{formatTime(session.startTime)} - {formatTime(session.endTime)}</span>
                                    </div>
                                    {session.type !== 'BREAK' && (
                                        <>
                                            <div className="flex items-center gap-2.5">
                                                <span className="material-symbols-outlined text-[14px] text-slate-500">door_open</span>
                                                <span className="text-[11px] font-medium text-slate-400">{session.room}</span>
                                            </div>
                                            <div className="flex items-center gap-2.5">
                                                <span className="material-symbols-outlined text-[14px] text-slate-500">person</span>
                                                <span className="text-[11px] font-medium text-slate-400">{session.instructor}</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                            </div>
                        </div>
                        );
                    })}
                    </div>
                </div>
                ) : (
                <div className="py-24 text-center flex flex-col items-center gap-4 bg-white/[0.02] border border-dashed border-white/5 rounded-[30px] mx-4">
                    <span className="material-symbols-outlined text-3xl text-slate-600">event_busy</span>
                    <div><p className="text-base font-bold text-slate-300">Quiet day!</p><p className="text-[10px] text-slate-500 mt-1">No scheduled classes.</p></div>
                </div>
                )}
            </div>
        </>
      ) : (
        // EXAM VIEW
        <div id="scroll-planner" className="flex-1 relative overflow-y-auto hide-scrollbar pb-32 pt-2 px-1 space-y-8">
            {examSchedules.length > 0 ? examSchedules.map((group) => {
                const countdown = getStartCountdown(group.subjects);
                // Calculate progress
                const completedSubjects = group.subjects.filter(s => new Date(`${s.date}T${s.endTime}`) < new Date()).length;
                const totalSubjects = group.subjects.length;
                const progress = totalSubjects > 0 ? (completedSubjects / totalSubjects) * 100 : 0;
                
                return (
                <div key={group.id} className="relative rounded-[32px] p-6 bg-[#131b24] border border-white/10 shadow-2xl group">
                    {/* Decorative Blur - Moved to separate container to avoid overflow issues with dropdown */}
                    <div className="absolute inset-0 overflow-hidden rounded-[32px] pointer-events-none">
                       <div className="absolute -right-20 -top-20 size-64 bg-white/5 rounded-full blur-[60px]"></div>
                    </div>

                    {/* Header */}
                    <div className="flex items-start justify-between mb-6 relative z-10">
                        <div className="flex-1 pr-4">
                            <h3 className="text-2xl font-black text-white tracking-tight leading-none break-words">{group.title}</h3>
                            <div className="flex items-center gap-3 mt-2">
                                {countdown && (
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white/5 px-2 py-1 rounded">
                                        {countdown}
                                    </p>
                                )}
                                {totalSubjects > 0 && (
                                    <div className="flex items-center gap-2">
                                        <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                            <div className="h-full bg-rose-500 rounded-full" style={{ width: `${progress}%` }}></div>
                                        </div>
                                        <span className="text-[9px] font-black text-slate-500">{completedSubjects}/{totalSubjects}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="relative">
                            <button 
                                onClick={(e) => { e.stopPropagation(); setMenuOpenGroupId(menuOpenGroupId === group.id ? null : group.id); }}
                                className="size-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-white/10 transition-all z-20 relative"
                            >
                                <span className="material-symbols-outlined text-xl">more_vert</span>
                            </button>
                            {menuOpenGroupId === group.id && (
                                <div className="absolute right-0 top-10 w-44 bg-[#1a2530] border border-white/10 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[100] overflow-hidden animate-zoom-in">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); onToggleConfirmGroup(group.id); setMenuOpenGroupId(null); }}
                                        className="w-full px-4 py-3 text-left text-xs font-bold text-slate-300 hover:bg-white/5 flex items-center gap-2 border-b border-white/5"
                                    >
                                        <span className="material-symbols-outlined text-sm">{group.isConfirmed ? 'lock_open' : 'check_circle'}</span>
                                        {group.isConfirmed ? 'Unlock Schedule' : 'Confirm Schedule'}
                                    </button>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); onEditExamGroup(group); setMenuOpenGroupId(null); }}
                                        className="w-full px-4 py-3 text-left text-xs font-bold text-slate-300 hover:bg-white/5 flex items-center gap-2 border-b border-white/5"
                                    >
                                        <span className="material-symbols-outlined text-sm">edit</span>
                                        Edit Name
                                    </button>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ type: 'group', id: group.id }); setMenuOpenGroupId(null); }}
                                        className="w-full px-4 py-3 text-left text-xs font-bold text-red-400 hover:bg-white/5 flex items-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-sm">delete</span>
                                        Delete Exam
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Subjects Grid */}
                    <div className="space-y-4 relative z-10">
                        {group.subjects.length > 0 ? group.subjects.map((subject) => {
                            const colorClass = SUBJECT_COLORS[getColorIndex(subject.subject)];
                            const examStart = new Date(`${subject.date}T${subject.startTime}`);
                            const examEnd = new Date(`${subject.date}T${subject.endTime}`);
                            const now = new Date();
                            const isFinished = examEnd < now;
                            const isOngoingExam = now >= examStart && now <= examEnd;
                            
                            return (
                                <div 
                                    key={subject.id}
                                    onClick={() => !group.isConfirmed && onEditSubject(group.id, subject)}
                                    className={`relative p-5 rounded-2xl border transition-all active:scale-[0.99] overflow-hidden ${
                                        isFinished 
                                        ? 'bg-[#0f151b]/80 border-white/5 grayscale' 
                                        : `${colorClass} shadow-lg hover:brightness-110`
                                    }`}
                                >
                                    {isFinished && (
                                        <div className="absolute inset-0 bg-black/40 z-20 flex items-center justify-center pointer-events-none">
                                            <div className="bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10">
                                                <span className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-sm">check</span> Completed
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {isOngoingExam && (
                                        <div className="absolute top-0 right-0 p-2 z-20">
                                            <span className="bg-red-500 text-white text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg animate-pulse shadow-lg shadow-red-500/40">
                                                Ongoing
                                            </span>
                                        </div>
                                    )}

                                    <div className="flex justify-between items-start mb-2 relative z-10">
                                        <div className="flex-1 pr-8">
                                            <h4 className="text-lg font-black text-white leading-tight drop-shadow-md">{subject.subject}</h4>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="text-[9px] font-bold bg-black/30 backdrop-blur-md px-2 py-0.5 rounded text-white/90 uppercase tracking-wider border border-white/10">{subject.type}</span>
                                                <span className="text-[9px] font-bold bg-black/30 backdrop-blur-md px-2 py-0.5 rounded text-white/90 uppercase tracking-wider border border-white/10">{subject.session}</span>
                                            </div>
                                        </div>
                                        {!group.isConfirmed && !isFinished && (
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ type: 'subject', id: subject.id, parentId: group.id }); }}
                                                className="size-8 rounded-xl bg-black/20 flex items-center justify-center text-white/70 hover:bg-red-500/20 hover:text-red-300 transition-colors backdrop-blur-sm border border-white/5"
                                            >
                                                <span className="material-symbols-outlined text-sm">close</span>
                                            </button>
                                        )}
                                    </div>
                                    
                                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10 relative z-10">
                                        <div className="flex items-center gap-2 text-white/90 bg-black/20 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                                            <span className="material-symbols-outlined text-[12px]">calendar_month</span>
                                            <span className="text-[10px] font-bold uppercase tracking-wider">
                                                {new Date(subject.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-white/90 bg-black/20 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                                            <span className="material-symbols-outlined text-[12px]">schedule</span>
                                            <span className="text-[10px] font-bold uppercase tracking-wider">
                                                {formatTime(subject.startTime)} - {formatTime(subject.endTime)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="p-8 rounded-2xl border-2 border-dashed border-white/5 bg-white/[0.01] text-center">
                                <p className="text-xs font-bold text-slate-500">No subjects yet.</p>
                            </div>
                        )}

                        {/* Add Subject Button */}
                        {!group.isConfirmed && (
                            <button 
                                onClick={() => onOpenAddSubject(group.id)}
                                className="w-full py-4 rounded-2xl border border-dashed border-white/10 flex items-center justify-center gap-2 text-slate-500 hover:text-white hover:border-white/20 hover:bg-white/5 transition-all group mt-2 shadow-inner"
                            >
                                <div className="size-6 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-sm">add</span>
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest">Add Subject</span>
                            </button>
                        )}
                    </div>
                </div>
            )}) : (
                <div className="py-24 text-center flex flex-col items-center gap-4 bg-white/[0.02] border border-dashed border-white/5 rounded-[30px] mx-4">
                    <div className="size-16 rounded-full bg-white/5 flex items-center justify-center text-slate-600">
                    <span className="material-symbols-outlined text-3xl">assignment</span>
                    </div>
                    <div>
                    <p className="text-base font-bold text-slate-300">No Exam Schedules</p>
                    <p className="text-[10px] text-slate-500 mt-1">Tap the main + button to create a new exam group (e.g. CAT 1).</p>
                    </div>
                </div>
            )}
        </div>
      )}

      {/* Detail View Modal (Classes) */}
      {viewingClass && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-sm px-6" onClick={() => setViewingClass(null)}>
            <div className="w-full max-w-sm bg-[#111c26] rounded-[32px] border border-white/10 shadow-2xl overflow-hidden animate-zoom-in" onClick={e => e.stopPropagation()}>
                <div className={`h-24 ${SESSION_STYLES[viewingClass.type]?.bg?.replace('/10', '') || 'bg-slate-700'} relative`}>
                    <button onClick={() => setViewingClass(null)} className="absolute top-4 right-4 size-8 rounded-full bg-black/20 text-white flex items-center justify-center hover:bg-black/30"><span className="material-symbols-outlined text-lg">close</span></button>
                    <div className="absolute -bottom-8 left-6 size-16 rounded-2xl bg-[#111c26] p-1.5 shadow-xl">
                        <div className={`w-full h-full rounded-xl flex items-center justify-center ${SESSION_STYLES[viewingClass.type]?.bg}`}><span className={`material-symbols-outlined text-3xl ${SESSION_STYLES[viewingClass.type]?.text}`}>{SESSION_ICONS[viewingClass.type]}</span></div>
                    </div>
                </div>
                <div className="pt-10 p-6">
                    <div className="mb-6"><span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${SESSION_STYLES[viewingClass.type]?.badge}`}>{viewingClass.type}</span><h2 className="text-xl font-black text-white mt-2 leading-tight">{viewingClass.name}</h2></div>
                    <div className="grid grid-cols-1 mt-6"><button onClick={() => { onEditClass(viewingClass); setViewingClass(null); }} className="py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2"><span className="material-symbols-outlined text-base">edit</span>Edit Class</button></div>
                </div>
            </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md px-6" onClick={() => setDeleteConfirm(null)}>
              <div className="w-full max-w-xs bg-[#111c26] rounded-[32px] p-8 border border-red-500/30 shadow-2xl animate-zoom-in text-center" onClick={e => e.stopPropagation()}>
                  <div className="size-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6"><span className="material-symbols-outlined text-3xl text-red-500">warning</span></div>
                  <h3 className="text-xl font-black text-white mb-2">Delete {deleteConfirm.type === 'group' ? 'Exam Schedule?' : 'Subject?'}</h3>
                  <p className="text-slate-400 text-sm font-medium mb-8 leading-relaxed">Are you sure you want to delete that? This cannot be undone.</p>
                  <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => setDeleteConfirm(null)} className="py-4 rounded-2xl bg-white/5 text-slate-400 font-bold text-xs hover:bg-white/10 transition-all">Cancel</button>
                      <button onClick={() => { 
                          if (deleteConfirm.type === 'group') onDeleteExamGroup(deleteConfirm.id);
                          else if (deleteConfirm.parentId) onDeleteSubject(deleteConfirm.parentId, deleteConfirm.id);
                          setDeleteConfirm(null); 
                      }} className="py-4 rounded-2xl bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-500/20 hover:brightness-110 transition-all">Delete</button>
                  </div>
              </div>
          </div>
      )}

      {/* Official Timetable Image Modal */}
      {showImageModal && userProfile?.timetableImageUrl && (
          <div className="fixed inset-0 z-[300] bg-black/95 flex flex-col animate-zoom-in" onClick={() => setShowImageModal(false)}>
              <div className="p-4 flex justify-between items-center absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent">
                  <h3 className="text-white font-bold text-lg">Official Schedule</h3>
                  <button onClick={() => setShowImageModal(false)} className="size-10 rounded-full bg-white/10 flex items-center justify-center text-white">
                      <span className="material-symbols-outlined">close</span>
                  </button>
              </div>
              <div className="flex-1 flex items-center justify-center p-2 overflow-auto">
                  <img 
                      src={userProfile.timetableImageUrl} 
                      alt="Official Timetable" 
                      className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" 
                      onClick={e => e.stopPropagation()}
                  />
              </div>
          </div>
      )}

      <style>{`
        @keyframes zoomIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-zoom-in { animation: zoomIn 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </div>
  );
};

export default TimetableScreen;