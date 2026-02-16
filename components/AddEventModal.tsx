
import React, { useState, useMemo, useEffect } from 'react';
import { UpcomingEvent, ClassSession } from '../types';

interface AddEventModalProps {
  initialEvent?: UpcomingEvent;
  onClose: () => void;
  onAdd: (title: string, date: string, startTime: string, endTime: string, location: string, description: string, icon: string) => void;
  existingEvents: UpcomingEvent[];
  existingClasses: ClassSession[];
}

const AddEventModal: React.FC<AddEventModalProps> = ({ initialEvent, onClose, onAdd, existingEvents, existingClasses }) => {
  const [title, setTitle] = useState(initialEvent?.title || '');
  const [date, setDate] = useState(initialEvent?.date || new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState(initialEvent?.startTime || '14:30');
  const [endTime, setEndTime] = useState(initialEvent?.endTime || '15:30');
  const [location, setLocation] = useState(initialEvent?.location || '');
  const [description, setDescription] = useState(initialEvent?.description || '');
  const [icon, setIcon] = useState(initialEvent?.icon || 'event');

  useEffect(() => {
    if (initialEvent) {
      setTitle(initialEvent.title);
      setDate(initialEvent.date);
      setStartTime(initialEvent.startTime);
      setEndTime(initialEvent.endTime);
      setLocation(initialEvent.location);
      setDescription(initialEvent.description);
      setIcon(initialEvent.icon);
    }
  }, [initialEvent]);

  const icons = [
    { name: 'event', color: 'bg-blue-500', glow: 'shadow-blue-500/20' },
    { name: 'groups', color: 'bg-indigo-500', glow: 'shadow-indigo-500/20' },
    { name: 'coffee', color: 'bg-amber-600', glow: 'shadow-amber-600/20' },
    { name: 'school', color: 'bg-violet-500', glow: 'shadow-violet-500/20' },
    { name: 'local_library', color: 'bg-emerald-600', glow: 'shadow-emerald-600/20' },
    { name: 'celebration', color: 'bg-rose-500', glow: 'shadow-rose-500/20' },
    { name: 'restaurant', color: 'bg-orange-500', glow: 'shadow-orange-500/20' },
    { name: 'fitness_center', color: 'bg-cyan-600', glow: 'shadow-cyan-600/20' },
    { name: 'laptop_mac', color: 'bg-slate-600', glow: 'shadow-slate-600/20' },
    { name: 'sports_esports', color: 'bg-purple-600', glow: 'shadow-purple-600/20' },
    { name: 'science', color: 'bg-lime-600', glow: 'shadow-lime-600/20' },
    { name: 'work', color: 'bg-sky-600', glow: 'shadow-sky-600/20' },
    { name: 'shopping_cart', color: 'bg-pink-500', glow: 'shadow-pink-500/20' },
    { name: 'movie', color: 'bg-red-600', glow: 'shadow-red-600/20' },
    { name: 'travel_explore', color: 'bg-teal-600', glow: 'shadow-teal-600/20' }
  ];

  // Logic to check conditions
  const validationState = useMemo(() => {
    if (!date || !startTime || !endTime) return null;

    const parseTime = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };

    const newStart = parseTime(startTime);
    const newEnd = parseTime(endTime);
    
    // Check for past time
    const eventDateTime = new Date(date);
    const [startH, startM] = startTime.split(':').map(Number);
    eventDateTime.setHours(startH, startM, 0, 0);
    const now = new Date();

    if (eventDateTime < now) {
        return { type: 'error', message: "Cannot schedule events in the past." };
    }

    if (newEnd <= newStart) return { type: 'error', message: "End time must be after start time." };

    // Check against existing events (excluding the one being edited)
    for (const e of existingEvents) {
      if (initialEvent && e.id === initialEvent.id) continue;
      if (e.date === date) {
        const eStart = parseTime(e.startTime);
        const eEnd = parseTime(e.endTime);
        if (newStart < eEnd && newEnd > eStart) {
          return { type: 'warning', message: `Conflicts with event: ${e.title}` };
        }
      }
    }

    // Check against classes
    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
    for (const c of existingClasses) {
      if (c.day === dayOfWeek) {
        const cStart = parseTime(c.startTime);
        const cEnd = parseTime(c.endTime);
        if (newStart < cEnd && newEnd > cStart) {
          return { type: 'warning', message: `Conflicts with class: ${c.name}` };
        }
      }
    }

    return null;
  }, [date, startTime, endTime, existingEvents, existingClasses, initialEvent]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !startTime || !endTime) return;
    if (validationState?.type === 'error') return;
    onAdd(title, date, startTime, endTime, location, description, icon);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/75 backdrop-blur-sm px-0 pb-0" onClick={onClose}>
      <div 
        className="w-full max-w-lg bg-[#111c26] rounded-t-[40px] shadow-[0_-20px_50px_rgba(0,0,0,0.6)] border-t border-white/5 flex flex-col overflow-hidden"
        style={{ animation: 'slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)', maxHeight: '92vh', height: '92vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        <style>{`
          @keyframes slideUp {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
          }
          @keyframes pulse-red {
            0% { opacity: 0.8; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.01); }
            100% { opacity: 0.8; transform: scale(1); }
          }
          .animate-pulse-red {
            animation: pulse-red 2s infinite ease-in-out;
          }
          /* Fix for date/time input icons */
          input[type="date"]::-webkit-calendar-picker-indicator,
          input[type="time"]::-webkit-calendar-picker-indicator {
            opacity: 1;
            cursor: pointer;
            transform: scale(1.2);
            margin-left: 8px;
          }
        `}</style>
        
        {/* Header */}
        <div className="flex items-center justify-between p-8 pb-4 shrink-0">
          <h2 className="text-2xl font-black tracking-tight text-white">{initialEvent ? 'Edit Event' : 'Add New Event'}</h2>
          <button onClick={onClose} className="size-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 active:scale-90 transition-all">
            <span className="material-symbols-outlined text-slate-400">close</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto hide-scrollbar px-8">
            {/* Warning/Error Banner */}
            {validationState && (
            <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 animate-pulse-red ${
                validationState.type === 'error' ? 'bg-red-500/10 border border-red-500/30' : 'bg-soft-pink/10 border border-soft-pink/30'
            }`}>
                <span className={`material-symbols-outlined text-xl ${validationState.type === 'error' ? 'text-red-500' : 'text-soft-pink'}`}>warning</span>
                <p className={`text-xs font-bold leading-relaxed tracking-wide ${validationState.type === 'error' ? 'text-red-500' : 'text-soft-pink'}`}>
                    {validationState.message}
                </p>
            </div>
            )}

            <form id="eventForm" onSubmit={handleSubmit} className="space-y-5 pb-6">
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.1em] ml-1">Event Name</label>
                    <span className={`text-[10px] font-bold ${title.length === 50 ? 'text-red-500' : 'text-slate-600'}`}>{title.length}/50</span>
                </div>
                <input
                type="text"
                required
                maxLength={50}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Study Group Session"
                className="w-full bg-[#1e2a36] border border-white/5 rounded-2xl p-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-primary transition-all"
                />
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.1em] ml-1">Date</label>
                <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={{ colorScheme: 'dark' }}
                className="w-full bg-[#1e2a36] border border-white/5 rounded-2xl p-4 text-white focus:outline-none focus:border-primary transition-all"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.1em] ml-1">Start Time</label>
                <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    style={{ colorScheme: 'dark' }}
                    className="w-full bg-[#1e2a36] border border-white/5 rounded-2xl p-4 text-white focus:outline-none focus:border-primary transition-all"
                />
                </div>
                <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.1em] ml-1">End Time</label>
                <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    style={{ colorScheme: 'dark' }}
                    className="w-full bg-[#1e2a36] border border-white/5 rounded-2xl p-4 text-white focus:outline-none focus:border-primary transition-all"
                />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.1em] ml-1">Location</label>
                <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Main Library"
                className="w-full bg-[#1e2a36] border border-white/5 rounded-2xl p-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-primary transition-all"
                />
            </div>

            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.1em] ml-1">Description</label>
                    <span className={`text-[10px] font-bold ${description.length === 300 ? 'text-red-500' : 'text-slate-600'}`}>{description.length}/300</span>
                </div>
                <textarea
                value={description}
                maxLength={300}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief details about the event..."
                className="w-full bg-[#1e2a36] border border-white/5 rounded-2xl p-4 text-white placeholder:text-slate-600 h-24 focus:outline-none focus:border-primary transition-all resize-none"
                />
            </div>

            <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.1em] ml-1">Pick Icon</label>
                <div className="grid grid-cols-5 gap-3 p-1">
                {icons.map(i => (
                    <button
                    key={i.name}
                    type="button"
                    onClick={() => setIcon(i.name)}
                    className={`aspect-square rounded-2xl flex items-center justify-center transition-all duration-200 relative ${
                        icon === i.name 
                        ? `${i.color} text-white shadow-lg ${i.glow} scale-105 z-10` 
                        : 'bg-[#1e2a36] text-slate-500 hover:bg-white/5'
                    }`}
                    >
                    <span className="material-symbols-outlined text-2xl">{i.name}</span>
                    </button>
                ))}
                </div>
            </div>
            </form>
        </div>

        {/* Footer with Button */}
        <div className="p-8 pt-4 bg-[#111c26] border-t border-white/5 shrink-0 z-20">
            <button
              type="submit"
              form="eventForm"
              disabled={!title || !date || !startTime || !endTime || validationState?.type === 'error'}
              className={`w-full py-5 rounded-2xl text-lg font-bold transition-all flex items-center justify-center gap-2 ${
                title && date && startTime && endTime && validationState?.type !== 'error'
                  ? 'bg-primary text-white shadow-xl shadow-primary/25 active:scale-95' 
                  : 'bg-white/5 text-slate-600 cursor-not-allowed'
              }`}
            >
              {initialEvent ? 'Update Event' : 'Create Event'}
              <span className="material-symbols-outlined text-xl">arrow_right_alt</span>
            </button>
        </div>
      </div>
    </div>
  );
};

export default AddEventModal;
