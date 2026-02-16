
import React, { useState } from 'react';

interface AddResourceModalProps {
  onClose: () => void;
  onAdd: (title: string, url: string, subject: string) => void;
}

const AddResourceModal: React.FC<AddResourceModalProps> = ({ onClose, onAdd }) => {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [subject, setSubject] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !url || !subject) return;
    onAdd(title, url, subject);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md px-4" onClick={onClose}>
      <div 
        className="w-full max-w-sm bg-[#101922] rounded-[40px] p-7 shadow-2xl border border-white/10 animate-zoom-in"
        onClick={(e) => e.stopPropagation()}
      >
        <style>{`
          @keyframes zoomIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
          .animate-zoom-in { animation: zoomIn 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
        `}</style>
        
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-white">Add Link</h2>
          <button onClick={onClose} className="size-9 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-all border border-white/5">
            <span className="material-symbols-outlined text-slate-500 text-lg font-bold">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title Input */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
                <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Title</label>
                <span className={`text-[9px] font-bold ${title.length === 50 ? 'text-red-500' : 'text-slate-600'}`}>
                    {title.length}/50
                </span>
            </div>
            <div className="relative">
                <input
                autoFocus
                type="text"
                maxLength={50}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Calculus Notes"
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 pl-12 text-base font-bold text-white placeholder:text-slate-700 focus:outline-none focus:border-primary/40 transition-all"
                />
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">title</span>
            </div>
          </div>

          {/* URL Input */}
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">URL / Link</label>
            <div className="relative">
                <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="drive.google.com/..."
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 pl-12 text-base font-bold text-white placeholder:text-slate-700 focus:outline-none focus:border-primary/40 transition-all"
                />
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">link</span>
            </div>
          </div>

          {/* Subject/Category Input */}
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Category / Subject</label>
            <div className="relative">
                <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Math, Physics, Project"
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 pl-12 text-base font-bold text-white placeholder:text-slate-700 focus:outline-none focus:border-primary/40 transition-all"
                />
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">category</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={!title || !url || !subject}
            className={`w-full py-4 rounded-2xl text-base font-black transition-all flex items-center justify-center gap-2 ${
              title && url && subject
                ? 'bg-primary text-white shadow-xl shadow-primary/20 active:scale-95' 
                : 'bg-white/5 text-slate-700 cursor-not-allowed'
            }`}
          >
            Save Link
            <span className="material-symbols-outlined text-sm font-black">save</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddResourceModal;
