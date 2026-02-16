
import React, { useState, useEffect } from 'react';
import { ExamSubject } from '../types';

interface ExamModalProps {
  initialExam?: ExamSubject;
  onClose: () => void;
  onAdd: (exam: Omit<ExamSubject, 'id'>) => void;
  existingExams: ExamSubject[]; 
}

const ExamModal: React.FC<ExamModalProps> = ({ initialExam, onClose, onAdd, existingExams }) => {
  const [subject, setSubject] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [examType, setExamType] = useState<'Theory' | 'Practical' | 'Laboratory' | 'Viva' | 'Project'>('Theory');
  const [session, setSession] = useState<'FN' | 'AN' | 'Evening'>('FN');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialExam) {
      setSubject(initialExam.subject);
      setDate(initialExam.date);
      setStartTime(initialExam.startTime);
      setEndTime(initialExam.endTime || '');
      setLocation(initialExam.location || '');
      setNotes(initialExam.notes || '');
      setExamType(initialExam.type || 'Theory');
      setSession(initialExam.session || 'FN');
    } else {
        const tmr = new Date();
        tmr.setDate(tmr.getDate() + 1);
        setDate(tmr.toISOString().split('T')[0]);
        setStartTime('10:00');
        setEndTime('13:00');
    }
  }, [initialExam]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!subject || !date || !startTime || !endTime) return;

    if (endTime <= startTime) {
        setError("End time must be after start time");
        return;
    }

    // Simple conflict check
    const proposedStart = new Date(`${date}T${startTime}`);
    const proposedEnd = new Date(`${date}T${endTime}`);

    const hasConflict = existingExams.some(ex => {
        if (initialExam && ex.id === initialExam.id) return false;
        const exStart = new Date(`${ex.date}T${ex.startTime}`);
        const exEnd = new Date(`${ex.date}T${ex.endTime}`);
        
        return (proposedStart < exEnd && proposedEnd > exStart);
    });

    if (hasConflict) {
        setError("Warning: Time conflict with another scheduled exam.");
        return;
    }

    onAdd({
      subject,
      date,
      startTime,
      endTime,
      location,
      notes,
      type: examType,
      session
    });
    onClose();
  };

  const EXAM_TYPES = ['Theory', 'Practical', 'Laboratory', 'Viva', 'Project'];
  const SESSIONS = ['FN', 'AN', 'Evening'];

  return (
    <div className="fixed inset-0 z-[250] flex items-end justify-center bg-black/80 backdrop-blur-md px-0 pb-0" onClick={onClose}>
      <div 
        className="w-full max-w-lg bg-[#111c26] rounded-t-[40px] p-8 pb-12 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] animate-slide-up border-t border-white/10 overflow-y-auto max-h-[90vh]"
        style={{ animation: 'slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)' }}
        onClick={e => e.stopPropagation()}
      >
        <style>{`
          @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
          input[type="time"]::-webkit-calendar-picker-indicator,
          input[type="date"]::-webkit-calendar-picker-indicator { opacity: 1; transform: scale(1.2); cursor: pointer; margin-left: 8px; }
        `}</style>
        
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black tracking-tight text-white">{initialExam ? 'Edit Subject' : 'Add Subject'}</h2>
          <button onClick={onClose} className="size-10 flex items-center justify-center rounded-full bg-white/5 active:bg-white/10 transition-colors">
            <span className="material-symbols-outlined text-slate-400">close</span>
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center gap-3 animate-pulse">
            <span className="material-symbols-outlined text-red-500">warning</span>
            <p className="text-xs font-bold text-red-500">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Subject Name</label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Calculus, Physics"
              className="w-full bg-[#1e2a36] border border-white/5 rounded-2xl p-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-rose-500/50 transition-all shadow-inner font-bold"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1 space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Date</label>
                <div className="relative">
                    <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    style={{ colorScheme: 'dark' }}
                    className="w-full bg-[#1e2a36] border border-white/5 rounded-2xl p-4 text-white focus:outline-none focus:border-rose-500/50 transition-all font-bold"
                    />
                </div>
            </div>
            <div className="flex-1 space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Location</label>
                <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Hall 3"
                className="w-full bg-[#1e2a36] border border-white/5 rounded-2xl p-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-rose-500/50 transition-all"
                />
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1 space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Start Time</label>
                <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                style={{ colorScheme: 'dark' }}
                className="w-full bg-[#1e2a36] border border-white/5 rounded-2xl p-4 text-white focus:outline-none focus:border-rose-500/50 transition-all font-bold"
                />
            </div>
            <div className="flex-1 space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">End Time</label>
                <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                style={{ colorScheme: 'dark' }}
                className="w-full bg-[#1e2a36] border border-white/5 rounded-2xl p-4 text-white focus:outline-none focus:border-rose-500/50 transition-all font-bold"
                />
            </div>
          </div>

          <div className="flex gap-4">
             <div className="flex-1 space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Type</label>
                <div className="relative">
                    <select 
                        value={examType}
                        onChange={(e) => setExamType(e.target.value as any)}
                        className="w-full bg-[#1e2a36] border border-white/5 rounded-2xl p-4 text-white focus:outline-none focus:border-rose-500/50 appearance-none font-bold bg-transparent z-10 relative"
                    >
                        {EXAM_TYPES.map(t => <option key={t} value={t} className="bg-[#1e2a36] text-white">{t}</option>)}
                    </select>
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none z-0">expand_more</span>
                </div>
             </div>
             <div className="flex-1 space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Session</label>
                <div className="relative">
                    <select 
                        value={session}
                        onChange={(e) => setSession(e.target.value as any)}
                        className="w-full bg-[#1e2a36] border border-white/5 rounded-2xl p-4 text-white focus:outline-none focus:border-rose-500/50 appearance-none font-bold bg-transparent z-10 relative"
                    >
                        {SESSIONS.map(s => <option key={s} value={s} className="bg-[#1e2a36] text-white">{s}</option>)}
                    </select>
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none z-0">expand_more</span>
                </div>
             </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Syllabus coverage..."
              className="w-full bg-[#1e2a36] border border-white/5 rounded-2xl p-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-rose-500/50 transition-all resize-none h-20"
            />
          </div>

          <button
            type="submit"
            className="w-full py-5 mt-4 rounded-2xl bg-rose-500 text-white text-lg font-bold shadow-2xl shadow-rose-500/20 active:scale-[0.98] transition-all hover:brightness-110 flex items-center justify-center gap-2"
          >
            {initialExam ? 'Update Subject' : 'Add Subject'}
            <span className="material-symbols-outlined">check_circle</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ExamModal;
