
import React, { useState } from 'react';

interface AddExamGroupModalProps {
  initialTitle?: string;
  onClose: () => void;
  onAdd: (title: string) => void;
  isEditing?: boolean;
}

const AddExamGroupModal: React.FC<AddExamGroupModalProps> = ({ initialTitle = '', onClose, onAdd, isEditing = false }) => {
  const [title, setTitle] = useState(initialTitle);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd(title.trim());
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md px-4" onClick={onClose}>
      <div 
        className="w-full max-w-sm bg-[#111c26] rounded-[40px] p-8 shadow-2xl border border-white/10 animate-zoom-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-white">{isEditing ? 'Edit Name' : 'Add Exam Schedule'}</h2>
          <button onClick={onClose} className="size-9 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-all border border-white/5">
            <span className="material-symbols-outlined text-slate-500 text-lg font-bold">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Exam Name</label>
            <input
              autoFocus
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. CAT 1, Semester I"
              className="w-full bg-[#1e2a36] border border-white/10 rounded-2xl p-4 text-lg font-bold text-white placeholder:text-slate-600 focus:outline-none focus:border-rose-500 transition-all shadow-inner"
            />
          </div>

          <button
            type="submit"
            disabled={!title.trim()}
            className="w-full py-4 rounded-2xl bg-rose-500 text-white text-base font-black shadow-xl shadow-rose-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isEditing ? 'Save Changes' : 'Create Exam'}
            <span className="material-symbols-outlined text-xl">{isEditing ? 'save' : 'post_add'}</span>
          </button>
        </form>
      </div>
      <style>{`
        @keyframes zoomIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-zoom-in { animation: zoomIn 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </div>
  );
};

export default AddExamGroupModal;
