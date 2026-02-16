
import React, { useState } from 'react';
import { Task, Category } from '../types';

interface EditTaskModalProps {
  task: Task;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Task>) => void;
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({ task, onClose, onUpdate }) => {
  const [title, setTitle] = useState(task.title);
  const [category, setCategory] = useState<Category>(task.category);
  const [priority, setPriority] = useState<'low' | 'med' | 'high'>(task.priority);
  const [date, setDate] = useState(task.date || new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(() => {
    if (task.time.includes('AM') || task.time.includes('PM')) return '10:00';
    return task.time.match(/^\d{2}:\d{2}$/) ? task.time : '10:00';
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    onUpdate(task.id, { title, category, priority, date, time });
  };

  const vibes = [
    { label: Category.WORK, icon: 'rocket_launch', color: 'bg-primary', dropGlow: 'drop-shadow-[0_0_6px_rgba(13,127,242,0.5)]' },
    { label: Category.PERSONAL, icon: 'emoji_food_beverage', color: 'bg-streak-orange', dropGlow: 'drop-shadow-[0_0_6px_rgba(255,107,0,0.5)]' },
    { label: Category.HEALTH, icon: 'fitness_center', color: 'bg-emerald-500', dropGlow: 'drop-shadow-[0_0_6px_rgba(16,185,129,0.5)]' },
    { label: Category.STUDY, icon: 'menu_book', color: 'bg-purple-500', dropGlow: 'drop-shadow-[0_0_6px_rgba(168,85,247,0.5)]' },
    { label: Category.CLASS, icon: 'school', color: 'bg-cyan-500', dropGlow: 'drop-shadow-[0_0_6px_rgba(6,182,212,0.5)]' },
    { label: Category.URGENT, icon: 'priority_high', color: 'bg-soft-pink', dropGlow: 'drop-shadow-[0_0_6px_rgba(255,105,180,0.5)]' },
  ];

  const priorities = [
    { id: 'low' as const, label: 'LOW', activeClass: 'bg-emerald-500 border-emerald-500 text-white shadow-emerald-500/20', inactiveClass: 'bg-white/5 border-white/10 text-emerald-500/50' },
    { id: 'med' as const, label: 'MED', activeClass: 'bg-amber-500 border-amber-500 text-white shadow-amber-500/20', inactiveClass: 'bg-white/5 border-white/10 text-amber-500/50' },
    { id: 'high' as const, label: 'HIGH', activeClass: 'bg-rose-500 border-rose-500 text-white shadow-rose-500/20', inactiveClass: 'bg-white/5 border-white/10 text-rose-500/50' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md px-4" onClick={onClose}>
      <div 
        className="w-full max-w-sm bg-[#101922] rounded-[40px] p-7 shadow-2xl border border-white/10 animate-zoom-in"
        onClick={(e) => e.stopPropagation()}
      >
        <style>{`
          @keyframes zoomIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
          
          input[type="time"]::-webkit-calendar-picker-indicator,
          input[type="date"]::-webkit-calendar-picker-indicator {
            opacity: 1;
            transform: scale(1.2);
            cursor: pointer;
            margin-right: 4px;
          }
          
          .animate-zoom-in { animation: zoomIn 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
        `}</style>
        
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-white">Edit Task</h2>
          <button onClick={onClose} className="size-9 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-all border border-white/5">
            <span className="material-symbols-outlined text-slate-500 text-lg font-bold">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 focus-within:border-primary/40 transition-all">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task name"
              className="w-full bg-transparent border-none focus:ring-0 text-lg font-bold text-white placeholder:text-slate-700"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
               <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Date</label>
               <div className="relative h-[58px]">
                 <input
                   type="date"
                   value={date}
                   onChange={(e) => setDate(e.target.value)}
                   style={{ colorScheme: 'dark' }}
                   className="w-full h-full bg-white/[0.03] border border-white/10 rounded-xl px-4 text-sm font-bold text-white focus:outline-none focus:border-primary/40 transition-all uppercase tracking-widest"
                 />
               </div>
             </div>
             
             <div className="flex-1 space-y-2">
               <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Time</label>
               <div className="relative h-[58px]">
                 <input
                   type="time"
                   value={time}
                   onChange={(e) => setTime(e.target.value)}
                   style={{ colorScheme: 'dark' }}
                   className="w-full h-full bg-white/[0.03] border border-white/10 rounded-xl px-4 text-sm font-bold text-white focus:outline-none focus:border-primary/40 transition-all uppercase tracking-widest"
                 />
               </div>
             </div>
          </div>
          
          <div className="space-y-2">
               <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Priority</label>
               <div className="flex gap-1.5 h-[58px]">
                 {priorities.map(p => (
                    <button
                      type="button"
                      key={p.id}
                      onClick={() => setPriority(p.id)}
                      className={`flex-1 rounded-xl font-black text-[9px] border transition-all duration-300 ${
                        priority === p.id 
                          ? `${p.activeClass} shadow-lg scale-105` 
                          : p.inactiveClass
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
               </div>
             </div>

          <div>
            <h3 className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-4 ml-1">Category</h3>
            <div className="flex gap-7 overflow-x-auto hide-scrollbar -mx-2 px-2 py-4 overflow-visible">
              {vibes.map(vibe => {
                const isActive = category === vibe.label;
                return (
                  <button
                    type="button"
                    key={vibe.label}
                    onClick={() => setCategory(vibe.label)}
                    className="flex flex-col items-center gap-3 shrink-0 overflow-visible"
                  >
                    <div className={`size-14 rounded-full flex items-center justify-center transition-all duration-500 ${
                      isActive 
                        ? `${vibe.color} ${vibe.dropGlow} scale-110 z-10` 
                        : 'bg-white/[0.03] text-slate-500 border border-white/5'
                    }`}>
                      <span className={`material-symbols-outlined text-2xl ${isActive ? 'text-white' : 'text-slate-600'}`}>
                        {vibe.icon}
                      </span>
                    </div>
                    <span className={`text-[9px] font-black uppercase tracking-widest transition-all ${
                      isActive ? 'text-white' : 'text-slate-700'
                    }`}>
                      {vibe.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 rounded-2xl bg-primary text-white text-base font-black shadow-xl shadow-primary/20 active:scale-[0.97] transition-all"
          >
            Update Task
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditTaskModal;
