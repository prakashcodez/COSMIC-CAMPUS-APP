
import React, { useState } from 'react';
import { ClassSession } from '../types';

interface AddClassModalProps {
  onClose: () => void;
  onAdd: (name: string, room: string, startTime: string, endTime: string, day: string, instructor: string, type: 'LECTURE' | 'LAB' | 'WORKSHOP' | 'SEMINAR' | 'BREAK' | 'THEORY CUM LAB') => void;
  existingClasses: ClassSession[];
}

const AddClassModal: React.FC<AddClassModalProps> = ({ onClose, onAdd, existingClasses }) => {
  const [subject, setSubject] = useState('');
  const [room, setRoom] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [day, setDay] = useState('Monday');
  const [instructor, setInstructor] = useState('');
  const [type, setType] = useState<'LECTURE' | 'LAB' | 'WORKSHOP' | 'SEMINAR' | 'BREAK' | 'THEORY CUM LAB'>('LECTURE');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || (type !== 'BREAK' && !room)) return;

    // Conflict detection
    const parseTime = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };
    const newStart = parseTime(startTime);
    const newEnd = parseTime(endTime);

    if (newEnd <= newStart) {
      setError("End time must be after start time.");
      return;
    }

    const hasConflict = existingClasses.some(c => {
      if (c.day !== day) return false;
      const cStart = parseTime(c.startTime);
      const cEnd = parseTime(c.endTime);
      return newStart < cEnd && newEnd > cStart;
    });

    if (hasConflict) {
      setError("This time slot conflicts with an existing class.");
      return;
    }

    onAdd(subject, room, startTime, endTime, day, instructor, type);
  };

  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const TYPES = ['LECTURE', 'LAB', 'WORKSHOP', 'SEMINAR', 'THEORY CUM LAB', 'BREAK'] as const;

  const TYPE_STYLES = {
    'LECTURE': {
        active: 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20',
        inactive: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20'
    },
    'LAB': {
        active: 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-500/20',
        inactive: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
    },
    'WORKSHOP': {
        active: 'bg-amber-600 border-amber-500 text-white shadow-lg shadow-amber-500/20',
        inactive: 'bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20'
    },
    'SEMINAR': {
        active: 'bg-pink-600 border-pink-500 text-white shadow-lg shadow-pink-500/20',
        inactive: 'bg-pink-500/10 border-pink-500/20 text-pink-400 hover:bg-pink-500/20'
    },
    'THEORY CUM LAB': {
        active: 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/20',
        inactive: 'bg-purple-500/10 border-purple-500/20 text-purple-400 hover:bg-purple-500/20'
    },
    'BREAK': {
        active: 'bg-slate-600 border-slate-500 text-white shadow-lg shadow-slate-500/20',
        inactive: 'bg-slate-500/10 border-slate-500/20 text-slate-400 hover:bg-slate-500/20'
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 backdrop-blur-md px-0 pb-0">
      <div 
        className="w-full max-w-lg bg-[#111c26] rounded-t-[40px] p-8 pb-12 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] animate-slide-up border-t border-white/10"
        style={{ animation: 'slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        <style>{`
          @keyframes slideUp {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
          }
          input[type="time"]::-webkit-calendar-picker-indicator {
            opacity: 1;
            transform: scale(1.2);
            cursor: pointer;
            margin-left: 8px;
          }
        `}</style>
        
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black tracking-tight text-white">Schedule Class</h2>
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
          {/* Subject */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Class Subject</label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => { setSubject(e.target.value); setError(null); }}
              placeholder="e.g. Advanced Mathematics"
              className="w-full bg-[#1e2a36] border border-white/5 rounded-2xl p-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-primary transition-all shadow-inner"
            />
          </div>

          {/* Type Selector */}
          <div className="space-y-1.5">
             <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Session Type</label>
             <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
                {TYPES.map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => { setType(t); setError(null); }}
                    className={`px-4 py-2.5 rounded-xl text-[10px] font-black border transition-all shrink-0 ${
                      type === t ? TYPE_STYLES[t].active : TYPE_STYLES[t].inactive
                    }`}
                  >
                    {t}
                  </button>
                ))}
             </div>
          </div>

          {type !== 'BREAK' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Location / Room</label>
                <input
                  type="text"
                  required
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  placeholder="Hall 4B"
                  className="w-full bg-[#1e2a36] border border-white/5 rounded-2xl p-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-primary transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Instructor</label>
                <input
                  type="text"
                  value={instructor}
                  onChange={(e) => setInstructor(e.target.value)}
                  placeholder="Dr. Smith"
                  className="w-full bg-[#1e2a36] border border-white/5 rounded-2xl p-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-primary transition-all"
                />
              </div>
            </div>
          )}

          {/* Time Row */}
          <div className="flex gap-4">
            <div className="flex-1 space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Start Time</label>
              <div className="relative">
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => { setStartTime(e.target.value); setError(null); }}
                  style={{ colorScheme: 'dark' }}
                  className="w-full bg-[#1e2a36] border border-white/5 rounded-2xl p-4 text-white focus:outline-none focus:border-primary transition-all"
                />
              </div>
            </div>
            <div className="flex-1 space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">End Time</label>
              <div className="relative">
                <input
                  type="time"
                  required
                  value={endTime}
                  onChange={(e) => { setEndTime(e.target.value); setError(null); }}
                  style={{ colorScheme: 'dark' }}
                  className="w-full bg-[#1e2a36] border border-white/5 rounded-2xl p-4 text-white focus:outline-none focus:border-primary transition-all"
                />
              </div>
            </div>
          </div>

          {/* Day Select */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Weekly Day</label>
            <div className="relative">
              <select
                value={day}
                onChange={(e) => { setDay(e.target.value); setError(null); }}
                className="w-full bg-[#1e2a36] border border-white/5 rounded-2xl p-4 text-white focus:outline-none focus:border-primary appearance-none transition-all"
              >
                {DAYS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none">expand_more</span>
            </div>
          </div>

          {/* Action */}
          <button
            type="submit"
            className="w-full py-5 mt-4 rounded-2xl bg-primary text-white text-lg font-bold shadow-2xl shadow-primary/20 active:scale-[0.98] transition-all hover:brightness-110"
          >
            Add to Timetable
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddClassModal;
