
import React, { useState, useEffect } from 'react';
import { FocusState } from '../types';

interface FocusModalProps {
  focusState: FocusState;
  onStart: (minutes: number) => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onClose: () => void;
}

const FocusModal: React.FC<FocusModalProps> = ({ focusState, onStart, onPause, onResume, onStop, onClose }) => {
  const [customDuration, setCustomDuration] = useState(25);
  const [rotation, setRotation] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Animation frame loop for smooth galaxy rotation
  useEffect(() => {
    let animationFrameId: number;
    const animate = () => {
      setRotation(prev => (prev + 0.2) % 360);
      animationFrameId = requestAnimationFrame(animate);
    };
    if (focusState.status === 'focus' && !focusState.isPaused) {
      animate();
    }
    return () => cancelAnimationFrame(animationFrameId);
  }, [focusState.status, focusState.isPaused]);

  // Clear error message after 3 seconds
  useEffect(() => {
    if (errorMessage) {
        const timer = setTimeout(() => setErrorMessage(null), 3000);
        return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const handleIncreaseDuration = () => {
      if (customDuration >= 60) {
          setErrorMessage("Woah ! Take a break Brotha");
      } else {
          setCustomDuration(prev => Math.min(60, prev + 5));
      }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const GalaxyAnimation = () => (
    <div className="relative size-64 flex items-center justify-center my-8">
      {/* Core Glow */}
      <div className="absolute size-20 bg-white rounded-full blur-[40px] z-10 opacity-80 animate-pulse"></div>
      <div className="absolute size-10 bg-cyan-300 rounded-full blur-[20px] z-20"></div>
      
      {/* Spiral Arms */}
      <div 
        className="absolute inset-0 rounded-full transition-transform duration-100 will-change-transform"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
         {/* Arm 1 - Blue/Cyan */}
         <div className="absolute top-0 left-0 w-full h-full rounded-full border-t-4 border-l-4 border-cyan-500/60 blur-[2px] skew-x-12 scale-90"></div>
         <div className="absolute top-0 left-0 w-full h-full rounded-full border-t-2 border-l-2 border-cyan-300/40 blur-[1px] skew-x-12 scale-110 rotate-12"></div>
         
         {/* Arm 2 - Pink/Purple */}
         <div className="absolute top-0 left-0 w-full h-full rounded-full border-b-4 border-r-4 border-pink-500/60 blur-[2px] skew-y-12 scale-90 rotate-45"></div>
         <div className="absolute top-0 left-0 w-full h-full rounded-full border-b-2 border-r-2 border-purple-400/40 blur-[1px] skew-y-12 scale-110 rotate-90"></div>

         {/* Particles */}
         <div className="absolute top-4 left-1/2 size-2 bg-white rounded-full blur-[1px] shadow-[0_0_10px_white]"></div>
         <div className="absolute bottom-8 right-1/4 size-1.5 bg-blue-300 rounded-full blur-[1px]"></div>
         <div className="absolute top-1/2 left-4 size-1 bg-pink-300 rounded-full blur-[1px]"></div>
      </div>
      
      {/* Counter Rotation for stability effect */}
      <div 
        className="absolute inset-4 rounded-full border-2 border-white/5 blur-[1px]"
        style={{ transform: `rotate(-${rotation * 0.5}deg)` }}
      ></div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[2000] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center animate-zoom-in overflow-hidden">
      
      {/* Close Button */}
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 size-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all z-50"
      >
        <span className="material-symbols-outlined text-white">close_fullscreen</span>
      </button>

      {errorMessage && (
          <div className="absolute top-20 px-6 py-3 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-500 font-bold text-sm animate-pulse z-[60]">
              {errorMessage}
          </div>
      )}

      <div className="w-full max-w-md px-6 flex flex-col items-center relative z-10">
        
        {/* Status Text */}
        <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-pink-400 tracking-tight mb-2 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] text-center">
          {focusState.status === 'idle' ? 'Enter Focus Mode' : 
           focusState.status === 'break' ? 'Cosmic Break' : 
           focusState.status === 'completed' ? 'Session Complete' :
           focusState.isPaused ? 'Session Paused' : 'Focus Active'}
        </h2>
        
        <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-4">
          {focusState.status === 'idle' ? 'Set your trajectory' : 
           focusState.status === 'break' ? 'Recharge your energy' : 
           focusState.status === 'completed' ? 'Great work, Traveler' :
           'Maintain velocity'}
        </p>

        {/* Dynamic Visual */}
        {focusState.status === 'idle' ? (
           <div className="size-48 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(79,70,229,0.2)] animate-pulse">
              <span className="material-symbols-outlined text-6xl text-indigo-400">self_improvement</span>
           </div>
        ) : focusState.status === 'completed' ? (
           <div className="size-48 rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-white/10 flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(16,185,129,0.2)]">
               <span className="material-symbols-outlined text-6xl text-emerald-400 animate-bounce">celebration</span>
           </div>
        ) : (
           <GalaxyAnimation />
        )}

        {/* Timer Display */}
        {focusState.status !== 'idle' && focusState.status !== 'completed' && (
            <div className="text-7xl font-black text-white font-mono tracking-tighter mb-8 drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                {formatTime(focusState.timeLeft)}
            </div>
        )}

        {/* Controls */}
        {focusState.status === 'idle' && (
            <div className="w-full space-y-6">
                <div className="bg-[#1e2a36] p-2 rounded-2xl border border-white/10 flex items-center">
                    <button onClick={() => setCustomDuration(Math.max(5, customDuration - 5))} className="size-12 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 text-white">
                        <span className="material-symbols-outlined">remove</span>
                    </button>
                    <div className="flex-1 text-center">
                        <span className="text-2xl font-black text-white">{customDuration}</span>
                        <span className="text-xs font-bold text-slate-500 uppercase ml-1">min</span>
                    </div>
                    <button onClick={handleIncreaseDuration} className="size-12 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 text-white">
                        <span className="material-symbols-outlined">add</span>
                    </button>
                </div>
                <button 
                    onClick={() => onStart(customDuration)}
                    className="w-full py-5 rounded-2xl bg-white text-black text-lg font-black uppercase tracking-widest shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                    <span className="material-symbols-outlined">rocket_launch</span>
                    Ignite Focus
                </button>
            </div>
        )}

        {focusState.status === 'focus' && (
            <div className="flex gap-4 w-full">
                {!focusState.isPaused ? (
                    <button onClick={onPause} className="flex-1 py-4 rounded-2xl bg-white/10 border border-white/10 text-white font-bold hover:bg-white/20 transition-all">
                        Pause
                    </button>
                ) : (
                    <button onClick={onResume} className="flex-1 py-4 rounded-2xl bg-white text-black font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined">play_arrow</span>
                        Resume
                    </button>
                )}
                <button onClick={onStop} className="size-14 rounded-2xl bg-red-500/20 border border-red-500/30 text-red-500 flex items-center justify-center hover:bg-red-500/30 transition-all">
                    <span className="material-symbols-outlined">stop</span>
                </button>
            </div>
        )}

        {focusState.status === 'break' && (
            <div className="w-full space-y-4">
                <button 
                    onClick={() => onStart(focusState.duration)}
                    className="w-full py-5 rounded-2xl bg-emerald-500 text-white font-black uppercase tracking-widest shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                    <span className="material-symbols-outlined">fast_forward</span>
                    Fast Resume ({focusState.duration}m)
                </button>
                <button onClick={onStop} className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-slate-400 font-bold hover:text-white transition-all">
                    End Session
                </button>
            </div>
        )}

        {focusState.status === 'completed' && (
            <div className="w-full space-y-4">
                <div className="text-center mb-6">
                    <p className="text-xl font-bold text-white mb-2">Congratulations!</p>
                    <p className="text-sm text-slate-400">You've earned 100 XP and successfully completed your focus session.</p>
                </div>
                <button 
                    onClick={onStop} // Resets to idle to create new session
                    className="w-full py-5 rounded-2xl bg-cyan-500 text-white font-black uppercase tracking-widest shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                    <span className="material-symbols-outlined">refresh</span>
                    Create New Focus Session
                </button>
                <button onClick={onClose} className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-slate-300 font-bold hover:text-white hover:bg-white/10 transition-all">
                    Quit
                </button>
            </div>
        )}

      </div>
      
      {/* Background Particles */}
      <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 size-64 bg-purple-600/10 rounded-full blur-[80px] animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 size-64 bg-blue-600/10 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>
    </div>
  );
};

export default FocusModal;
