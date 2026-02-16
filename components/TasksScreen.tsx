
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Task, Category, UpcomingEvent, UserProfile, CampusChecklistItem, DailyRoutineItem, ClassSession, ResourceLink, BudgetState, BudgetPeriod, FocusState } from '../types';
import { ASTRONAUT_IMG } from '../constants';
import { QUOTES } from '../quotes';

interface TasksScreenProps {
  userProfile: UserProfile | null;
  tasks: Task[];
  events: UpcomingEvent[];
  classes: ClassSession[];
  onToggle: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteEvent: (id: string) => void;
  onEditEvent: (event: UpcomingEvent) => void;
  onOpenAddEvent: () => void;
  // Checklist Props
  checklist: CampusChecklistItem[];
  onAddChecklistItem: (text: string) => void;
  onToggleChecklistItem: (id: string) => void;
  onEditChecklistItem: (id: string, text: string) => void;
  onDeleteChecklistItem: (id: string) => void;
  onClearChecklist: () => void; // Function to empty list
  // Routine Props
  routine: DailyRoutineItem[];
  onToggleRoutineItem: (id: string) => void;
  onUpdateRoutineItem: (id: string, updates: Partial<DailyRoutineItem>) => void;
  onAddCustomHabit: (title: string, frequency: 'daily' | 'weekly' | 'monthly') => void;
  onDeleteRoutineItem: (id: string) => void;
  onClearRoutine: () => void;
  onGetInspiration: () => void;
  // Resources Props
  resources: ResourceLink[];
  onOpenAddResource: () => void;
  onDeleteResource: (id: string) => void;
  onReorderResources: (newResources: ResourceLink[]) => void;
  // Budget Props
  budget: BudgetState;
  onAddTransaction: (amount: number, description: string) => void;
  onResetBudget: () => void;
  onChangeBudgetPeriod: (period: BudgetPeriod) => void;
  // Focus Props
  focusState: FocusState;
  onOpenFocus: () => void;
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'event' | 'task' | 'system' | 'class';
}

const THEMES = [
  { glow: 'bg-violet-600/20', text: 'text-violet-400', border: 'border-violet-500/30', shadow: 'shadow-[0_20px_60px_-10px_rgba(124,58,237,0.3)]' },
  { glow: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30', shadow: 'shadow-[0_20px_60px_-10px_rgba(59,130,246,0.3)]' },
  { glow: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30', shadow: 'shadow-[0_20px_60px_-10px_rgba(16,185,129,0.3)]' },
  { glow: 'bg-pink-500/20', text: 'text-pink-400', border: 'border-pink-500/30', shadow: 'shadow-[0_20px_60px_-10px_rgba(236,72,153,0.3)]' },
  { glow: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30', shadow: 'shadow-[0_20px_60px_-10px_rgba(249,115,22,0.3)]' },
  { glow: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/30', shadow: 'shadow-[0_20px_60px_-10px_rgba(6,182,212,0.3)]' },
  { glow: 'bg-rose-500/20', text: 'text-rose-400', border: 'border-rose-500/30', shadow: 'shadow-[0_20px_60px_-10px_rgba(244,63,94,0.3)]' },
  { glow: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30', shadow: 'shadow-[0_20px_60px_-10px_rgba(234,179,8,0.3)]' },
];

const GLOW_COLORS = [
  { border: 'border-indigo-500', shadow: 'shadow-[0_0_15px_rgba(99,102,241,0.3)]', bg: 'bg-indigo-500/10' },
  { border: 'border-emerald-500', shadow: 'shadow-[0_0_15px_rgba(16,185,129,0.3)]', bg: 'bg-emerald-500/10' },
  { border: 'border-amber-500', shadow: 'shadow-[0_0_15px_rgba(245,158,11,0.3)]', bg: 'bg-amber-500/10' },
  { border: 'border-pink-500', shadow: 'shadow-[0_0_15px_rgba(236,72,153,0.3)]', bg: 'bg-pink-500/10' },
  { border: 'border-cyan-500', shadow: 'shadow-[0_0_15px_rgba(6,182,212,0.3)]', bg: 'bg-cyan-500/10' },
  { border: 'border-purple-500', shadow: 'shadow-[0_0_15px_rgba(168,85,247,0.3)]', bg: 'bg-purple-500/10' },
  { border: 'border-rose-500', shadow: 'shadow-[0_0_15px_rgba(244,63,94,0.3)]', bg: 'bg-rose-500/10' },
  { border: 'border-blue-500', shadow: 'shadow-[0_0_15px_rgba(59,130,246,0.3)]', bg: 'bg-blue-500/10' },
];

// Expanded Resource Tile Themes with even more colors
const RESOURCE_THEMES = [
  { 
    name: 'violet',
    bg: 'bg-gradient-to-br from-[#1a1b2e] to-violet-900/30',
    border: 'border-violet-500/30 hover:border-violet-400',
    shadow: 'shadow-[0_8px_30px_-6px_rgba(139,92,246,0.15)] hover:shadow-[0_12px_40px_-6px_rgba(139,92,246,0.3)]',
    blob1: 'bg-violet-500/30',
    blob2: 'bg-fuchsia-500/30',
    text: 'text-violet-200',
    badgeBg: 'bg-violet-500/20',
    badgeBorder: 'border-violet-500/30',
    iconBg: 'group-hover:bg-violet-500',
    iconText: 'text-violet-400 group-hover:text-white',
    titleColor: 'text-white group-hover:text-violet-100',
    deleteHover: 'hover:bg-violet-500'
  },
  { 
    name: 'cyan',
    bg: 'bg-gradient-to-br from-[#152329] to-cyan-900/30',
    border: 'border-cyan-500/30 hover:border-cyan-400',
    shadow: 'shadow-[0_8px_30px_-6px_rgba(6,182,212,0.15)] hover:shadow-[0_12px_40px_-6px_rgba(6,182,212,0.3)]',
    blob1: 'bg-cyan-500/30',
    blob2: 'bg-blue-500/30',
    text: 'text-cyan-200',
    badgeBg: 'bg-cyan-500/20',
    badgeBorder: 'border-cyan-500/30',
    iconBg: 'group-hover:bg-cyan-500',
    iconText: 'text-cyan-400 group-hover:text-white',
    titleColor: 'text-white group-hover:text-cyan-100',
    deleteHover: 'hover:bg-cyan-500'
  },
  { 
    name: 'emerald',
    bg: 'bg-gradient-to-br from-[#142922] to-emerald-900/30',
    border: 'border-emerald-500/30 hover:border-emerald-400',
    shadow: 'shadow-[0_8px_30px_-6px_rgba(16,185,129,0.15)] hover:shadow-[0_12px_40px_-6px_rgba(16,185,129,0.3)]',
    blob1: 'bg-emerald-500/30',
    blob2: 'bg-teal-500/30',
    text: 'text-emerald-200',
    badgeBg: 'bg-emerald-500/20',
    badgeBorder: 'border-emerald-500/30',
    iconBg: 'group-hover:bg-emerald-500',
    iconText: 'text-emerald-400 group-hover:text-white',
    titleColor: 'text-white group-hover:text-emerald-100',
    deleteHover: 'hover:bg-emerald-500'
  },
  { 
    name: 'rose',
    bg: 'bg-gradient-to-br from-[#29151a] to-rose-900/30',
    border: 'border-rose-500/30 hover:border-rose-400',
    shadow: 'shadow-[0_8px_30px_-6px_rgba(244,63,94,0.15)] hover:shadow-[0_12px_40px_-6px_rgba(244,63,94,0.3)]',
    blob1: 'bg-rose-500/30',
    blob2: 'bg-orange-500/30',
    text: 'text-rose-200',
    badgeBg: 'bg-rose-500/20',
    badgeBorder: 'border-rose-500/30',
    iconBg: 'group-hover:bg-rose-500',
    iconText: 'text-rose-400 group-hover:text-white',
    titleColor: 'text-white group-hover:text-rose-100',
    deleteHover: 'hover:bg-rose-500'
  },
  { 
    name: 'amber',
    bg: 'bg-gradient-to-br from-[#292015] to-amber-900/30',
    border: 'border-amber-500/30 hover:border-amber-400',
    shadow: 'shadow-[0_8px_30px_-6px_rgba(245,158,11,0.15)] hover:shadow-[0_12px_40px_-6px_rgba(245,158,11,0.3)]',
    blob1: 'bg-amber-500/30',
    blob2: 'bg-yellow-500/30',
    text: 'text-amber-200',
    badgeBg: 'bg-amber-500/20',
    badgeBorder: 'border-amber-500/30',
    iconBg: 'group-hover:bg-amber-500',
    iconText: 'text-amber-400 group-hover:text-white',
    titleColor: 'text-white group-hover:text-amber-100',
    deleteHover: 'hover:bg-amber-500'
  },
  { 
    name: 'blue',
    bg: 'bg-gradient-to-br from-[#151e2e] to-blue-900/30',
    border: 'border-blue-500/30 hover:border-blue-400',
    shadow: 'shadow-[0_8px_30px_-6px_rgba(59,130,246,0.15)] hover:shadow-[0_12px_40px_-6px_rgba(59,130,246,0.3)]',
    blob1: 'bg-blue-500/30',
    blob2: 'bg-sky-500/30',
    text: 'text-blue-200',
    badgeBg: 'bg-blue-500/20',
    badgeBorder: 'border-blue-500/30',
    iconBg: 'group-hover:bg-blue-500',
    iconText: 'text-blue-400 group-hover:text-white',
    titleColor: 'text-white group-hover:text-blue-100',
    deleteHover: 'hover:bg-blue-500'
  },
  { 
    name: 'pink',
    bg: 'bg-gradient-to-br from-[#2e152e] to-pink-900/30',
    border: 'border-pink-500/30 hover:border-pink-400',
    shadow: 'shadow-[0_8px_30px_-6px_rgba(236,72,153,0.15)] hover:shadow-[0_12px_40px_-6px_rgba(236,72,153,0.3)]',
    blob1: 'bg-pink-500/30',
    blob2: 'bg-rose-500/30',
    text: 'text-pink-200',
    badgeBg: 'bg-pink-500/20',
    badgeBorder: 'border-pink-500/30',
    iconBg: 'group-hover:bg-pink-500',
    iconText: 'text-pink-400 group-hover:text-white',
    titleColor: 'text-white group-hover:text-pink-100',
    deleteHover: 'hover:bg-pink-500'
  },
  { 
    name: 'indigo',
    bg: 'bg-gradient-to-br from-[#1e1b38] to-indigo-900/30',
    border: 'border-indigo-500/30 hover:border-indigo-400',
    shadow: 'shadow-[0_8px_30px_-6px_rgba(99,102,241,0.15)] hover:shadow-[0_12px_40px_-6px_rgba(99,102,241,0.3)]',
    blob1: 'bg-indigo-500/30',
    blob2: 'bg-violet-500/30',
    text: 'text-indigo-200',
    badgeBg: 'bg-indigo-500/20',
    badgeBorder: 'border-indigo-500/30',
    iconBg: 'group-hover:bg-indigo-500',
    iconText: 'text-indigo-400 group-hover:text-white',
    titleColor: 'text-white group-hover:text-indigo-100',
    deleteHover: 'hover:bg-indigo-500'
  },
  { 
    name: 'teal',
    bg: 'bg-gradient-to-br from-[#132e2e] to-teal-900/30',
    border: 'border-teal-500/30 hover:border-teal-400',
    shadow: 'shadow-[0_8px_30px_-6px_rgba(20,184,166,0.15)] hover:shadow-[0_12px_40px_-6px_rgba(20,184,166,0.3)]',
    blob1: 'bg-teal-500/30',
    blob2: 'bg-emerald-500/30',
    text: 'text-teal-200',
    badgeBg: 'bg-teal-500/20',
    badgeBorder: 'border-teal-500/30',
    iconBg: 'group-hover:bg-teal-500',
    iconText: 'text-teal-400 group-hover:text-white',
    titleColor: 'text-white group-hover:text-teal-100',
    deleteHover: 'hover:bg-teal-500'
  },
  { 
    name: 'orange',
    bg: 'bg-gradient-to-br from-[#2e1d15] to-orange-900/30',
    border: 'border-orange-500/30 hover:border-orange-400',
    shadow: 'shadow-[0_8px_30px_-6px_rgba(249,115,22,0.15)] hover:shadow-[0_12px_40px_-6px_rgba(249,115,22,0.3)]',
    blob1: 'bg-orange-500/30',
    blob2: 'bg-red-500/30',
    text: 'text-orange-200',
    badgeBg: 'bg-orange-500/20',
    badgeBorder: 'border-orange-500/30',
    iconBg: 'group-hover:bg-orange-500',
    iconText: 'text-orange-400 group-hover:text-white',
    titleColor: 'text-white group-hover:text-orange-100',
    deleteHover: 'hover:bg-orange-500'
  },
  { 
    name: 'red',
    bg: 'bg-gradient-to-br from-[#2e1515] to-red-900/30',
    border: 'border-red-500/30 hover:border-red-400',
    shadow: 'shadow-[0_8px_30px_-6px_rgba(239,68,68,0.15)] hover:shadow-[0_12px_40px_-6px_rgba(239,68,68,0.3)]',
    blob1: 'bg-red-500/30',
    blob2: 'bg-orange-500/30',
    text: 'text-red-200',
    badgeBg: 'bg-red-500/20',
    badgeBorder: 'border-red-500/30',
    iconBg: 'group-hover:bg-red-500',
    iconText: 'text-red-400 group-hover:text-white',
    titleColor: 'text-white group-hover:text-red-100',
    deleteHover: 'hover:bg-red-500'
  },
  { 
    name: 'lime',
    bg: 'bg-gradient-to-br from-[#1a2e15] to-lime-900/30',
    border: 'border-lime-500/30 hover:border-lime-400',
    shadow: 'shadow-[0_8px_30px_-6px_rgba(132,204,22,0.15)] hover:shadow-[0_12px_40px_-6px_rgba(132,204,22,0.3)]',
    blob1: 'bg-lime-500/30',
    blob2: 'bg-green-500/30',
    text: 'text-lime-200',
    badgeBg: 'bg-lime-500/20',
    badgeBorder: 'border-lime-500/30',
    iconBg: 'group-hover:bg-lime-500',
    iconText: 'text-lime-400 group-hover:text-white',
    titleColor: 'text-white group-hover:text-lime-100',
    deleteHover: 'hover:bg-lime-500'
  },
  { 
    name: 'fuchsia',
    bg: 'bg-gradient-to-br from-[#2e152e] to-fuchsia-900/30',
    border: 'border-fuchsia-500/30 hover:border-fuchsia-400',
    shadow: 'shadow-[0_8px_30px_-6px_rgba(217,70,239,0.15)] hover:shadow-[0_12px_40px_-6px_rgba(217,70,239,0.3)]',
    blob1: 'bg-fuchsia-500/30',
    blob2: 'bg-purple-500/30',
    text: 'text-fuchsia-200',
    badgeBg: 'bg-fuchsia-500/20',
    badgeBorder: 'border-fuchsia-500/30',
    iconBg: 'group-hover:bg-fuchsia-500',
    iconText: 'text-fuchsia-400 group-hover:text-white',
    titleColor: 'text-white group-hover:text-fuchsia-100',
    deleteHover: 'hover:bg-fuchsia-500'
  },
  { 
    name: 'sky',
    bg: 'bg-gradient-to-br from-[#15292e] to-sky-900/30',
    border: 'border-sky-500/30 hover:border-sky-400',
    shadow: 'shadow-[0_8px_30px_-6px_rgba(14,165,233,0.15)] hover:shadow-[0_12px_40px_-6px_rgba(14,165,233,0.3)]',
    blob1: 'bg-sky-500/30',
    blob2: 'bg-blue-500/30',
    text: 'text-sky-200',
    badgeBg: 'bg-sky-500/20',
    badgeBorder: 'border-sky-500/30',
    iconBg: 'group-hover:bg-sky-500',
    iconText: 'text-sky-400 group-hover:text-white',
    titleColor: 'text-white group-hover:text-sky-100',
    deleteHover: 'hover:bg-sky-500'
  },
  { 
    name: 'gold',
    bg: 'bg-gradient-to-br from-[#2e2615] to-yellow-900/30',
    border: 'border-yellow-500/30 hover:border-yellow-400',
    shadow: 'shadow-[0_8px_30px_-6px_rgba(234,179,8,0.15)] hover:shadow-[0_12px_40px_-6px_rgba(234,179,8,0.3)]',
    blob1: 'bg-yellow-500/30',
    blob2: 'bg-amber-500/30',
    text: 'text-yellow-200',
    badgeBg: 'bg-yellow-500/20',
    badgeBorder: 'border-yellow-500/30',
    iconBg: 'group-hover:bg-yellow-500',
    iconText: 'text-yellow-400 group-hover:text-white',
    titleColor: 'text-white group-hover:text-yellow-100',
    deleteHover: 'hover:bg-yellow-500'
  },
  { 
    name: 'slate',
    bg: 'bg-gradient-to-br from-[#1e293b] to-slate-800/50',
    border: 'border-slate-500/30 hover:border-slate-400',
    shadow: 'shadow-[0_8px_30px_-6px_rgba(148,163,184,0.15)] hover:shadow-[0_12px_40px_-6px_rgba(148,163,184,0.3)]',
    blob1: 'bg-slate-500/30',
    blob2: 'bg-gray-500/30',
    text: 'text-slate-200',
    badgeBg: 'bg-slate-500/20',
    badgeBorder: 'border-slate-500/30',
    iconBg: 'group-hover:bg-slate-500',
    iconText: 'text-slate-400 group-hover:text-white',
    titleColor: 'text-white group-hover:text-slate-100',
    deleteHover: 'hover:bg-slate-500'
  }
];

// Updated with subtle glow shadows matching the color
const EVENT_STYLES: Record<string, { bg: string, border: string, text: string, iconBg: string, glow: string }> = {
    orange: { bg: 'from-orange-500 to-orange-600', border: 'border-orange-400/50', text: 'text-white', iconBg: 'bg-white/20', glow: 'shadow-[0_8px_20px_-6px_rgba(249,115,22,0.5)]' },
    pink: { bg: 'from-pink-500 to-pink-600', border: 'border-pink-400/50', text: 'text-white', iconBg: 'bg-white/20', glow: 'shadow-[0_8px_20px_-6px_rgba(236,72,153,0.5)]' },
    blue: { bg: 'from-blue-500 to-blue-600', border: 'border-blue-400/50', text: 'text-white', iconBg: 'bg-white/20', glow: 'shadow-[0_8px_20px_-6px_rgba(59,130,246,0.5)]' },
    green: { bg: 'from-emerald-500 to-emerald-600', border: 'border-emerald-400/50', text: 'text-white', iconBg: 'bg-white/20', glow: 'shadow-[0_8px_20px_-6px_rgba(16,185,129,0.5)]' },
    purple: { bg: 'from-purple-500 to-purple-600', border: 'border-purple-400/50', text: 'text-white', iconBg: 'bg-white/20', glow: 'shadow-[0_8px_20px_-6px_rgba(168,85,247,0.5)]' },
    cyan: { bg: 'from-cyan-500 to-cyan-600', border: 'border-cyan-400/50', text: 'text-white', iconBg: 'bg-white/20', glow: 'shadow-[0_8px_20px_-6px_rgba(6,182,212,0.5)]' },
    red: { bg: 'from-red-500 to-red-600', border: 'border-red-400/50', text: 'text-white', iconBg: 'bg-white/20', glow: 'shadow-[0_8px_20px_-6px_rgba(239,68,68,0.5)]' },
    slate: { bg: 'from-slate-500 to-slate-600', border: 'border-slate-400/50', text: 'text-white', iconBg: 'bg-white/20', glow: 'shadow-[0_8px_20px_-6px_rgba(100,116,139,0.5)]' },
};

const BUTTON_TEXTS = [
  "Got it",
  "Challenge Accepted",
  "Let's Do This",
  "I'm Ready",
  "Stay Focused",
  "On It",
  "Let's Go",
  "Bring It On",
  "Level Up",
  "Message Received"
];

const TasksScreen: React.FC<TasksScreenProps> = ({ 
  userProfile, tasks, events, classes, onToggle, onDeleteTask, onEditTask, 
  onDeleteEvent, onEditEvent, onOpenAddEvent,
  checklist, onAddChecklistItem, onToggleChecklistItem, onEditChecklistItem, onDeleteChecklistItem, onClearChecklist,
  routine, onToggleRoutineItem, onUpdateRoutineItem, onAddCustomHabit, onDeleteRoutineItem, onClearRoutine,
  onGetInspiration,
  resources, onOpenAddResource, onDeleteResource, onReorderResources,
  budget, onAddTransaction, onResetBudget, onChangeBudgetPeriod,
  focusState, onOpenFocus
}) => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [showNotifications, setShowNotifications] = useState(false);
  const [menuOpenTaskId, setMenuOpenTaskId] = useState<string | null>(null);
  const [viewingEvent, setViewingEvent] = useState<UpcomingEvent | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Navigation Menu State
  const [showNavMenu, setShowNavMenu] = useState(false);
  const sectionRefs = {
      progress: useRef<HTMLDivElement>(null),
      budget: useRef<HTMLDivElement>(null),
      events: useRef<HTMLDivElement>(null),
      categories: useRef<HTMLDivElement>(null),
      tasks: useRef<HTMLDivElement>(null),
      inspiration: useRef<HTMLDivElement>(null),
      checklist: useRef<HTMLDivElement>(null),
      habits: useRef<HTMLDivElement>(null),
      resources: useRef<HTMLDivElement>(null),
  };

  const handleScrollTo = (section: keyof typeof sectionRefs) => {
      sectionRefs[section].current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setShowNavMenu(false);
  };

  // Quote State
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [currentQuote, setCurrentQuote] = useState('');
  const [currentTheme, setCurrentTheme] = useState(THEMES[0]);
  const [currentButtonText, setCurrentButtonText] = useState(BUTTON_TEXTS[0]);

  // Budget State
  const [showBudgetDetails, setShowBudgetDetails] = useState(false);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [transactionAmount, setTransactionAmount] = useState('');
  const [transactionDesc, setTransactionDesc] = useState('');
  const budgetLongPressTimer = useRef<number | null>(null);

  // Checklist Tile State
  const [checklistInput, setChecklistInput] = useState('');
  
  // Routine inputs
  const [habitInput, setHabitInput] = useState('');
  const [habitFrequency, setHabitFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  
  const [editingItem, setEditingItem] = useState<CampusChecklistItem | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showRoutineClearConfirm, setShowRoutineClearConfirm] = useState(false);
  const checklistLongPressTimer = useRef<number | null>(null);

  // Resource Reorder Logic
  const [reorderMode, setReorderMode] = useState(false);
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(null);
  const resourceLongPressTimer = useRef<number | null>(null);

  const handleShowQuote = () => {
    const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    const randomTheme = THEMES[Math.floor(Math.random() * THEMES.length)];
    const randomBtnText = BUTTON_TEXTS[Math.floor(Math.random() * BUTTON_TEXTS.length)];
    
    setCurrentQuote(randomQuote);
    setCurrentTheme(randomTheme);
    setCurrentButtonText(randomBtnText);
    
    // Trigger XP reward
    onGetInspiration();
    
    setShowQuoteModal(true);
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);
  
  const formatDisplayTime = (timeString: string) => {
    if (!timeString) return '';
    const [h, m] = timeString.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12; // 0 becomes 12
    return `${hour}:${m.toString().padStart(2, '0')} ${period}`;
  };

  const formatDisplayDate = (dateString?: string) => {
      if (!dateString) return 'Today';
      const date = new Date(dateString);
      const today = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(today.getDate() + 1);

      if (date.toDateString() === today.toDateString()) return 'Today';
      if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // --- DYNAMIC NOTIFICATIONS LOGIC ---
  const notifications = useMemo(() => {
    const list: NotificationItem[] = [];
    const now = new Date();

    const sortedEvents = [...events].filter(e => {
        const eDate = new Date(e.date);
        const [h, m] = e.startTime.split(':').map(Number);
        eDate.setHours(h, m);
        const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
        return eDate > twoHoursAgo;
    }).sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.startTime}`);
        const dateB = new Date(`${b.date}T${b.startTime}`);
        return dateA.getTime() - dateB.getTime();
    });

    sortedEvents.slice(0, 3).forEach(event => {
        const eventDate = new Date(event.date);
        const isToday = eventDate.toDateString() === now.toDateString();
        
        list.push({
            id: `evt-${event.id}`,
            title: event.title,
            message: `${isToday ? 'Happening today' : formatDisplayDate(event.date)} at ${formatDisplayTime(event.startTime)}${event.location ? ` in ${event.location}` : ''}.`,
            time: isToday ? 'Upcoming' : formatDisplayDate(event.date),
            type: 'event'
        });
    });

    const activeTasks = tasks.filter(t => !t.completed);
    
    if (tasks.length === 0) {
        list.push({
            id: 'no-tasks',
            title: 'No Tasks Yet',
            message: 'Your task list is empty. Add a task to start your day!',
            time: 'Now',
            type: 'task'
        });
    } else if (activeTasks.length > 0) {
        const highPriorityCount = activeTasks.filter(t => t.priority === 'high').length;
        list.push({
            id: 'tasks-status',
            title: 'Active Tasks',
            message: `You have ${activeTasks.length} pending task${activeTasks.length === 1 ? '' : 's'}${highPriorityCount > 0 ? `, including ${highPriorityCount} high priority.` : '.'}`,
            time: 'Reminder',
            type: 'task'
        });
    } else {
        list.push({
            id: 'all-complete',
            title: 'All Caught Up!',
            message: 'Fantastic work! You have completed all your tasks.',
            time: 'Just now',
            type: 'system' 
        });
    }

    const completedWithDates = tasks
        .filter(t => t.completed && t.completedAt)
        .map(t => new Date(t.completedAt!).setHours(0,0,0,0))
        .sort((a, b) => b - a);
    
    if (completedWithDates.length > 0) {
        const uniqueDates = Array.from(new Set(completedWithDates));
        const today = new Date().setHours(0,0,0,0);
        const yesterday = today - 86400000;
        let streak = 0;
        let checkDate = uniqueDates[0] === today ? today : yesterday;
        
        if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
             for (const date of uniqueDates) {
                if (date === checkDate) {
                    streak++;
                    checkDate -= 86400000;
                } else break;
            }
        }

        if (streak >= 3) {
            list.push({
                id: 'streak-alert',
                title: 'Streak on Fire!',
                message: `You're on a ${streak}-day streak! Keep completing tasks to maintain it.`,
                time: 'Streak',
                type: 'system'
            });
        }
    }

    const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    const todaysClasses = classes.filter(c => c.day === dayName);
    const upcomingClass = todaysClasses.filter(c => {
        const [h, m] = c.startTime.split(':').map(Number);
        return (h * 60 + m) > currentMinutes;
    }).sort((a, b) => a.startTime.localeCompare(b.startTime))[0];

    if (upcomingClass) {
        list.push({
            id: `cls-${upcomingClass.id}`,
            title: `Next Class: ${upcomingClass.name}`,
            message: `Starts at ${formatDisplayTime(upcomingClass.startTime)} in ${upcomingClass.room}.`,
            time: 'Soon',
            type: 'class'
        });
    }

    return list;
  }, [events, tasks, classes]);

  const [hasUnread, setHasUnread] = useState(true);

  const handleMarkAsRead = () => setHasUnread(false);

  const completedCount = tasks.filter(t => t.completed).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const getMotivationalMessage = (percent: number) => {
    if (tasks.length === 0) return "Ready to start your day?";
    if (percent === 0) return "Try working.";
    if (percent <= 25) return "Just the beginning!";
    if (percent <= 50) return "Making progress!";
    if (percent <= 75) return "Over the hump!";
    if (percent < 100) return "Almost finished!";
    return "All tasks completed! Great work!";
  };

  const getTasksLeft = (cat: string) => {
    if (cat === 'All') return tasks.filter(t => !t.completed).length;
    return tasks.filter(t => t.category === cat && !t.completed).length;
  };

  const longPressTimerRef = useRef<number | null>(null);
  const handleEventPressStart = (event: UpcomingEvent) => {
    longPressTimerRef.current = window.setTimeout(() => {
      setViewingEvent(event);
    }, 600);
  };
  const handleEventPressEnd = () => {
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
  };

  const getTimeRemaining = (event: UpcomingEvent) => {
    const now = new Date();
    const eventDate = new Date(event.date);
    const [h, m] = event.startTime.split(':').map(Number);
    eventDate.setHours(h, m, 0, 0);
    
    const diff = eventDate.getTime() - now.getTime();
    
    if (diff <= 0) return null;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return { days, hours, minutes };
  };

  const filteredTasks = activeCategory === 'All' 
    ? tasks 
    : tasks.filter(t => t.category === activeCategory);

  const categories = [
    { name: 'All', icon: 'apps', gradient: 'from-blue-600 to-blue-400', shadow: 'shadow-blue-500/60' },
    { name: 'Work', icon: 'work', gradient: 'from-primary to-blue-700', shadow: 'shadow-primary/60' },
    { name: 'Personal', icon: 'person', gradient: 'from-purple-600 to-pink-500', shadow: 'shadow-pink-500/60' },
    { name: 'Health', icon: 'favorite', gradient: 'from-emerald-600 to-teal-500', shadow: 'shadow-emerald-500/60' },
    { name: 'Study', icon: 'menu_book', gradient: 'from-violet-600 to-indigo-500', shadow: 'shadow-violet-500/60' },
    { name: 'Class', icon: 'school', gradient: 'from-cyan-600 to-blue-500', shadow: 'shadow-cyan-500/60' },
  ];

  const getCategoryBadgeStyle = (category: Category) => {
    switch (category) {
      case Category.WORK: return 'bg-primary/20 border-primary/40 text-primary';
      case Category.PERSONAL: return 'bg-soft-pink/20 border-soft-pink/40 text-soft-pink';
      case Category.HEALTH: return 'bg-emerald-500/20 border-emerald-500/40 text-emerald-500';
      case Category.STUDY: return 'bg-violet-600/20 border-violet-600/40 text-violet-400';
      case Category.CLASS: return 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400';
      case Category.URGENT: return 'bg-streak-orange/20 border-streak-orange/40 text-streak-orange';
      default: return 'bg-white/10 border-white/20 text-slate-400';
    }
  };

  const getEventStyle = (icon: string) => {
    if (['restaurant', 'coffee', 'movie'].includes(icon)) return EVENT_STYLES.orange;
    if (['celebration', 'shopping_cart'].includes(icon)) return EVENT_STYLES.pink;
    if (['work', 'groups', 'event'].includes(icon)) return EVENT_STYLES.blue;
    if (['local_library', 'science'].includes(icon)) return EVENT_STYLES.green;
    if (['sports_esports', 'school'].includes(icon)) return EVENT_STYLES.purple;
    if (['fitness_center', 'travel_explore'].includes(icon)) return EVENT_STYLES.cyan;
    if (['laptop_mac'].includes(icon)) return EVENT_STYLES.slate;
    return EVENT_STYLES.blue;
  };

  const handleAddChecklistItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (checklistInput.trim()) {
        onAddChecklistItem(checklistInput.trim());
        setChecklistInput('');
    }
  };

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (habitInput.trim()) {
        onAddCustomHabit(habitInput.trim(), habitFrequency);
        setHabitInput('');
    }
  };

  const handleChecklistLongPressStart = (item: CampusChecklistItem) => {
    checklistLongPressTimer.current = window.setTimeout(() => {
        setEditingItem(item);
    }, 600);
  };

  const handleChecklistLongPressEnd = () => {
    if (checklistLongPressTimer.current) clearTimeout(checklistLongPressTimer.current);
  };

  const handleResourceLongPressStart = (id: string) => {
    resourceLongPressTimer.current = window.setTimeout(() => {
        setReorderMode(true);
        setSelectedResourceId(id);
    }, 600);
  };

  const handleResourceLongPressEnd = () => {
    if (resourceLongPressTimer.current) clearTimeout(resourceLongPressTimer.current);
  };

  const handleResourceClick = (res: ResourceLink) => {
    if (reorderMode) {
        if (selectedResourceId === res.id) {
            setSelectedResourceId(null);
            return;
        }
        if (selectedResourceId) {
            const indexA = resources.findIndex(r => r.id === selectedResourceId);
            const indexB = resources.findIndex(r => r.id === res.id);
            if (indexA === -1 || indexB === -1) return;
            
            const newResources = [...resources];
            [newResources[indexA], newResources[indexB]] = [newResources[indexB], newResources[indexA]];
            
            onReorderResources(newResources);
            setSelectedResourceId(null);
        } else {
            setSelectedResourceId(res.id);
        }
    } else {
        window.open(res.url, '_blank');
    }
  };

  const getHabitPlusColor = (frequency: string) => {
      switch(frequency) {
          case 'daily': return 'bg-primary text-white shadow-[0_0_20px_rgba(13,127,242,0.5)]';
          case 'weekly': return 'bg-violet-500 text-white shadow-[0_0_20px_rgba(139,92,246,0.5)]';
          case 'monthly': return 'bg-pink-500 text-white shadow-[0_0_20px_rgba(236,72,153,0.5)]';
          default: return 'bg-white/10 text-slate-500';
      }
  };

  const getFrequencyActiveStyle = (frequency: string) => {
      switch(frequency) {
          case 'daily': return 'bg-primary text-white shadow-[0_0_15px_rgba(13,127,242,0.4)]';
          case 'weekly': return 'bg-violet-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.4)]';
          case 'monthly': return 'bg-pink-500 text-white shadow-[0_0_15px_rgba(236,72,153,0.4)]';
          default: return 'text-slate-600 hover:text-slate-400 hover:bg-white/5';
      }
  };

  // Budget Handlers
  const handleBudgetLongPressStart = () => {
    budgetLongPressTimer.current = window.setTimeout(() => {
        setShowAddTransaction(true);
    }, 600);
  };

  const handleBudgetLongPressEnd = () => {
    if (budgetLongPressTimer.current) clearTimeout(budgetLongPressTimer.current);
  };

  const handleBudgetClick = () => {
    setShowBudgetDetails(true);
  };

  const handleAddTransactionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (transactionAmount && transactionDesc) {
        onAddTransaction(parseFloat(transactionAmount), transactionDesc);
        setTransactionAmount('');
        setTransactionDesc('');
        setShowAddTransaction(false);
    }
  };

  const totalSpent = budget.transactions.reduce((acc, curr) => acc + curr.amount, 0);

  const getBudgetComment = (amount: number) => {
      if (amount === 0) return "Fresh start!";
      if (amount < 100) return "Just a snack?";
      if (amount < 500) return "Daily essentials.";
      if (amount < 2000) return "Treating yourself?";
      if (amount < 5000) return "Money moves!";
      return "Big spender!";
  };

  const menuItems = [
    { id: 'progress', label: 'Progress', icon: 'donut_large', color: 'text-indigo-400', bg: 'hover:bg-indigo-500/10', border: 'hover:border-indigo-500/20' },
    { id: 'budget', label: 'Budget', icon: 'account_balance_wallet', color: 'text-emerald-400', bg: 'hover:bg-emerald-500/10', border: 'hover:border-emerald-500/20' },
    { id: 'events', label: 'Upcoming Events', icon: 'event', color: 'text-pink-400', bg: 'hover:bg-pink-500/10', border: 'hover:border-pink-500/20' },
    { id: 'categories', label: 'Categories', icon: 'category', color: 'text-cyan-400', bg: 'hover:bg-cyan-500/10', border: 'hover:border-cyan-500/20' },
    { id: 'tasks', label: 'Active Tasks', icon: 'check_circle', color: 'text-emerald-400', bg: 'hover:bg-emerald-500/10', border: 'hover:border-emerald-500/20' },
    { id: 'inspiration', label: 'Inspiration', icon: 'auto_awesome', color: 'text-violet-400', bg: 'hover:bg-violet-500/10', border: 'hover:border-violet-500/20' },
    { id: 'checklist', label: 'Quick Checklist', icon: 'checklist', color: 'text-amber-400', bg: 'hover:bg-amber-500/10', border: 'hover:border-amber-500/20' },
    { id: 'habits', label: 'Habits', icon: 'repeat', color: 'text-rose-400', bg: 'hover:bg-rose-500/10', border: 'hover:border-rose-500/20' },
    { id: 'resources', label: 'Resources', icon: 'link', color: 'text-blue-400', bg: 'hover:bg-blue-500/10', border: 'hover:border-blue-500/20' },
  ];

  return (
    <div className="p-4 space-y-6" onClick={() => { setMenuOpenTaskId(null); setShowNavMenu(false); }}>
      {/* ... Header and other components ... */}
      <div className="flex items-center justify-between pt-2 px-1">
        <div className="flex items-center gap-3">
          <div className="size-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-[0_10px_30px_-10px_rgba(13,127,242,0.4)] relative overflow-hidden group">
            <img src={ASTRONAUT_IMG} alt="User" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors"></div>
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-black tracking-tight truncate max-w-[180px]">Hello, {userProfile?.name?.split(' ')[0] || 'Student'}</h1>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <div className="relative">
                <button 
                    onClick={(e) => { e.stopPropagation(); setShowNavMenu(!showNavMenu); }} 
                    className="size-11 flex items-center justify-center rounded-2xl bg-white/5 relative group active:scale-95 transition-transform border border-white/10 hover:bg-white/10"
                >
                    <span className="material-symbols-outlined text-2xl text-slate-300">toc</span>
                </button>
                {showNavMenu && (
                    <div className="absolute top-14 right-0 w-56 bg-[#1a2530]/95 backdrop-blur-xl border border-white/10 rounded-[24px] shadow-2xl z-[60] overflow-hidden animate-zoom-in p-2">
                        {menuItems.map((item, index) => (
                            <button 
                                key={item.id}
                                onClick={() => handleScrollTo(item.id as keyof typeof sectionRefs)} 
                                className={`w-full px-4 py-3 rounded-xl text-left text-xs font-bold text-slate-300 transition-all duration-300 flex items-center gap-3 group border border-transparent ${item.bg} ${item.border} active:scale-95 mb-1 last:mb-0`}
                                style={{ animation: `slideInItem 0.2s forwards ${index * 0.03}s`, opacity: 0, transform: 'translateX(-10px)' }}
                            >
                                <div className={`size-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner ${item.color.replace('text-', 'bg-').replace('400', '500/20')}`}>
                                    <span className={`material-symbols-outlined text-sm ${item.color} drop-shadow-md`}>{item.icon}</span>
                                </div>
                                <span className="group-hover:text-white transition-colors">{item.label}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
            <button 
            onClick={(e) => { e.stopPropagation(); setShowNotifications(true); }} 
            className="size-11 flex items-center justify-center rounded-2xl bg-white/5 relative group active:scale-95 transition-transform border border-white/10"
            >
            <span className="material-symbols-outlined text-2xl text-slate-300">notifications</span>
            {hasUnread && (
                <span className="absolute top-2 right-2.5 size-2 bg-soft-pink border-2 border-background-dark rounded-full animate-pulse"></span>
            )}
            </button>
        </div>
      </div>

      <div ref={sectionRefs.progress} className="p-6 rounded-2xl bg-primary/10 border border-primary/20 relative overflow-hidden shadow-[0_0_30px_rgba(13,127,242,0.1)] mx-1">
        <div className="relative z-10">
          <div className="flex justify-between items-end mb-4">
            <div>
              <p className="text-4xl font-black">{progressPercent}%</p>
              <p className="text-sm text-primary/80 font-bold">
                {getMotivationalMessage(progressPercent)}
              </p>
            </div>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1">{completedCount} / {tasks.length}</p>
          </div>
          <div className="w-full bg-white/5 h-2.5 rounded-full overflow-hidden border border-white/5">
            <div className="bg-primary h-full rounded-full transition-all duration-700 shadow-[0_0_15px_rgba(13,127,242,0.6)]" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>
        <div className="absolute -right-4 -top-4 size-24 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
      </div>

      {/* Budget Tile */}
      <div 
        ref={sectionRefs.budget}
        onMouseDown={handleBudgetLongPressStart}
        onMouseUp={handleBudgetLongPressEnd}
        onMouseLeave={handleBudgetLongPressEnd}
        onTouchStart={handleBudgetLongPressStart}
        onTouchEnd={handleBudgetLongPressEnd}
        onClick={handleBudgetClick}
        onDoubleClick={() => setShowAddTransaction(true)}
        className="p-6 rounded-2xl bg-gradient-to-br from-emerald-600/20 to-teal-600/20 border border-emerald-500/20 relative overflow-hidden shadow-[0_0_30px_rgba(16,185,129,0.15)] mx-1 cursor-pointer active:scale-[0.98] transition-all group"
      >
        <div className="relative z-10">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                        <span className="material-symbols-outlined text-emerald-400">account_balance_wallet</span>
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-white">Budget</h3>
                        <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">{budget.period}</p>
                        <p className="text-[10px] font-bold text-slate-400">{getBudgetComment(totalSpent)}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-0.5">Spent</p>
                    <p className="text-2xl font-black text-white">₹{totalSpent.toLocaleString('en-IN')}</p>
                </div>
            </div>
        </div>
        <div className="absolute -right-12 -bottom-12 size-32 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-colors"></div>
      </div>

      <div ref={sectionRefs.events} className="space-y-4">
        {/* ... Events Section (Existing Code) ... */}
        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg font-black tracking-tight flex items-center gap-2">Upcoming Events <span className="size-1.5 rounded-full bg-soft-pink animate-ping"></span></h2>
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Long Press to Edit</span>
        </div>
        <div className="flex gap-4 overflow-x-auto hide-scrollbar -mx-4 px-6 pb-6 items-center">
          {events.length > 0 ? events.map((event) => {
            const timeLeft = getTimeRemaining(event);
            const style = getEventStyle(event.icon);
            return (
              <div 
                key={event.id} 
                onMouseDown={() => handleEventPressStart(event)} 
                onMouseUp={handleEventPressEnd} 
                onMouseLeave={handleEventPressEnd} 
                onTouchStart={() => handleEventPressStart(event)} 
                onTouchEnd={handleEventPressEnd} 
                className={`min-w-[240px] rounded-[24px] p-3 relative group active:scale-95 transition-all cursor-pointer overflow-visible shrink-0 bg-gradient-to-br ${style.bg} border ${style.border} ${style.glow}`}
              >
                <div className="flex justify-between items-start mb-1.5">
                    <div className={`size-9 rounded-xl flex items-center justify-center ${style.iconBg} backdrop-blur-md shadow-sm`}>
                        <span className="material-symbols-outlined text-lg text-white">{event.icon}</span>
                    </div>
                    <span className="text-[10px] font-bold text-white/95 mt-1">{formatDisplayDate(event.date)} • {formatDisplayTime(event.startTime)}</span>
                </div>
                <div className="mb-1">
                    <h3 className="font-black text-base text-white leading-tight truncate pr-2">{event.title}</h3>
                    <div className="flex items-center gap-1 text-white/80 mt-0.5">
                        <span className="material-symbols-outlined text-[10px]">location_on</span>
                        <span className="text-[9px] font-medium truncate max-w-[150px]">{event.location}</span>
                    </div>
                </div>
                <div className="flex justify-end mt-1.5">
                    {timeLeft ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/20 backdrop-blur-sm border border-white/10">
                            <span className="material-symbols-outlined text-[10px] text-white">timer</span>
                            <span className="text-[9px] font-black text-white uppercase tracking-wider">
                                {timeLeft.days > 0 && `${timeLeft.days}d `}{timeLeft.hours}h {timeLeft.minutes}m Left
                            </span>
                        </div>
                    ) : (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/20 backdrop-blur-sm border border-white/20">
                            <span className="text-[9px] font-black text-white uppercase tracking-wider">Happening Now</span>
                        </div>
                    )}
                </div>
              </div>
            );
          }) : (
            <div className="min-w-[200px] h-[100px] rounded-2xl border-2 border-dashed border-white/5 flex flex-col items-center justify-center gap-1.5 opacity-40 shrink-0">
              <span className="material-symbols-outlined text-xl">event</span>
              <span className="text-[9px] font-black uppercase tracking-widest">No Events Today</span>
            </div>
          )}
          <button onClick={(e) => { e.stopPropagation(); onOpenAddEvent(); }} className="min-w-[80px] h-[90px] rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-2 text-slate-500 hover:border-primary/40 hover:text-primary transition-all active:scale-90 shrink-0 mr-4">
            <span className="material-symbols-outlined text-3xl">add_circle</span>
            <span className="text-[9px] font-black uppercase tracking-tighter">Add Event</span>
          </button>
        </div>
      </div>

      {/* Focus Mode Tile */}
      <div className="px-1">
        <button 
            onClick={onOpenFocus}
            className="w-full relative group overflow-hidden rounded-[32px] p-1 transition-all active:scale-[0.98]"
        >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 animate-gradient-xy opacity-70 group-hover:opacity-100 transition-opacity blur-sm"></div>
            <div className="relative bg-[#131b24] rounded-[30px] p-6 flex items-center justify-between overflow-hidden">
                {/* Background Galaxy Effect */}
                <div className="absolute -right-10 -top-10 size-40 bg-purple-500/20 rounded-full blur-[50px] animate-pulse"></div>
                <div className="absolute -left-10 -bottom-10 size-40 bg-cyan-500/20 rounded-full blur-[50px] animate-pulse" style={{ animationDelay: '1s' }}></div>
                
                <div className="relative z-10 flex items-center gap-5">
                    <div className={`size-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-12 ${
                        focusState.status === 'focus' ? 'bg-cyan-500 text-white animate-spin-slow' : 
                        focusState.status === 'break' ? 'bg-emerald-500 text-white' : 
                        'bg-white/10 text-cyan-400'
                    }`}>
                        <span className="material-symbols-outlined text-3xl">
                            {focusState.status === 'focus' ? 'all_inclusive' : 
                             focusState.status === 'break' ? 'coffee' : 'self_improvement'}
                        </span>
                    </div>
                    <div className="text-left">
                        <h3 className="text-xl font-black text-white leading-tight">
                            {focusState.status === 'focus' ? 'Focus Active' : 
                             focusState.status === 'break' ? 'Break Time' : 'Focus Mode'}
                        </h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5 group-hover:text-cyan-400 transition-colors">
                            {focusState.status === 'focus' ? `${Math.ceil(focusState.timeLeft / 60)} min remaining` : 
                             focusState.status === 'break' ? 'Recharge Phase' : 'Enter the Zone'}
                        </p>
                    </div>
                </div>

                <div className="relative z-10 size-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                    <span className="material-symbols-outlined text-white">arrow_forward</span>
                </div>
            </div>
        </button>
      </div>

      <div ref={sectionRefs.categories} className="space-y-4">
        {/* ... Categories Section (Updated) ... */}
        <h3 className="text-lg font-black tracking-tight px-1">Task Categories</h3>
        <div className="flex gap-4 overflow-x-auto pt-8 pb-14 hide-scrollbar -mx-4 px-6 items-center">
          {categories.map((cat) => {
            const tasksLeft = getTasksLeft(cat.name);
            const isActive = activeCategory === cat.name;
            return (
              <button 
                key={cat.name} 
                onClick={(e) => { e.stopPropagation(); setActiveCategory(cat.name); }} 
                className={`flex flex-col justify-center gap-1 min-w-[125px] h-[82px] px-4 py-3 transition-all relative active:scale-95 shrink-0 ${
                  isActive 
                  ? `bg-gradient-to-br ${cat.gradient} rounded-[20px] scale-105 z-10 shadow-[0_0_25px_2px] ${cat.shadow}` 
                  : 'bg-white/5 border border-white/5 rounded-[20px]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`size-8 rounded-[12px] flex items-center justify-center shrink-0 ${isActive ? 'bg-white/25' : 'bg-white/10'}`}>
                    <span className={`material-symbols-outlined text-[18px] ${isActive ? 'text-white' : 'text-slate-400'}`}>{cat.icon}</span>
                  </div>
                  <p className={`text-[15px] font-bold tracking-tight ${isActive ? 'text-white' : 'text-slate-200'}`}>{cat.name}</p>
                </div>
                <div className="w-full text-left pl-1">
                  <p className={`text-[12px] font-bold tracking-tight ${isActive ? 'text-white/90' : 'text-slate-500'}`}>
                    {tasksLeft} {tasksLeft === 1 ? 'task' : 'tasks'} left
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div ref={sectionRefs.tasks} className="space-y-4 px-2">
        {/* ... Tasks Section (Existing Code) ... */}
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-black tracking-tight">Active Tasks</h3>
        </div>
        <div className="space-y-4">
          {filteredTasks.length > 0 ? filteredTasks.map((task) => (
            <div 
              key={task.id} 
              className={`group flex items-center gap-5 p-5 rounded-2xl border transition-all cursor-pointer relative shadow-sm ${
                task.completed ? 'bg-white/[0.02] border-dashed border-white/5 opacity-40 grayscale' : 'bg-white/[0.04] border-white/10 hover:bg-white/[0.08] hover:border-primary/20'
              } ${menuOpenTaskId === task.id ? 'z-50' : 'z-0'}`} 
              onClick={() => onToggle(task.id)}
            >
              <div className={`flex size-7 shrink-0 items-center justify-center rounded-lg border-2 transition-all ${task.completed ? 'border-primary bg-primary text-white' : 'border-primary/40 text-transparent'}`}><span className="material-symbols-outlined text-[18px] font-black">check</span></div>
              <div className="flex-1 min-w-0 pr-2">
                <p className={`text-base font-bold leading-tight ${task.completed ? 'line-through text-slate-600' : 'text-white'}`}>{task.title}</p>
                <div className="flex items-center gap-3 mt-2.5">
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-primary opacity-50">schedule</span>
                    <span className="text-slate-500 text-[10px] font-bold">
                        {formatDisplayDate(task.date)}, {formatDisplayTime(task.time)}
                    </span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border transition-colors ${getCategoryBadgeStyle(task.category)}`}>
                    {task.category}
                  </span>
                </div>
              </div>
              <div className="relative">
                <button onClick={(e) => { e.stopPropagation(); setMenuOpenTaskId(menuOpenTaskId === task.id ? null : task.id); }} className="size-9 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 active:scale-90 transition-all border border-white/5"><span className="material-symbols-outlined text-slate-500 text-xl">more_vert</span></button>
                {menuOpenTaskId === task.id && (
                  <div className="absolute right-0 top-11 w-32 bg-[#1a2530] border border-white/10 rounded-2xl shadow-2xl z-[60] overflow-hidden animate-zoom-in">
                    <button onClick={(e) => { e.stopPropagation(); onEditTask(task); setMenuOpenTaskId(null); }} className="w-full px-4 py-3.5 text-left text-sm font-bold text-slate-300 hover:bg-white/5 flex items-center gap-2 border-b border-white/5"><span className="material-symbols-outlined text-sm">edit</span>Edit</button>
                    <button onClick={(e) => { e.stopPropagation(); onDeleteTask(task.id); setMenuOpenTaskId(null); }} className="w-full px-4 py-3.5 text-left text-sm font-bold text-soft-pink hover:bg-white/5 flex items-center gap-2"><span className="material-symbols-outlined text-sm">delete</span>Delete</button>
                  </div>
                )}
              </div>
            </div>
          )) : (
            <div className="py-20 text-center flex flex-col items-center gap-4 bg-white/[0.02] border border-dashed border-white/5 rounded-[32px] opacity-40">
              <span className="material-symbols-outlined text-5xl">checklist</span>
              <div className="space-y-1">
                <p className="font-bold text-sm">No tasks as of now</p>
                <p className="text-[10px] font-medium max-w-[180px] mx-auto leading-relaxed">Your productivity space is clear. Click the '+' button to get started.</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* ... Inspiration ... */}
      <div ref={sectionRefs.inspiration} className="pt-2">
        <button 
            onClick={handleShowQuote}
            className="w-full p-6 rounded-3xl bg-gradient-to-r from-violet-600 to-indigo-600 border border-white/10 shadow-[0_10px_40px_-10px_rgba(124,58,237,0.5)] group active:scale-[0.98] transition-all relative overflow-hidden"
        >
             <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
             <div className="flex items-center justify-between relative z-10">
                 <div className="flex items-center gap-4">
                     <div className="size-12 rounded-2xl bg-white/20 flex items-center justify-center text-white backdrop-blur-sm shadow-inner">
                         <span className="material-symbols-outlined text-2xl">auto_awesome</span>
                     </div>
                     <div className="text-left">
                         <h3 className="font-black text-lg text-white">Daily Inspiration</h3>
                         <p className="text-[10px] text-white/70 font-bold uppercase tracking-wider">Tap for motivation</p>
                     </div>
                 </div>
                 <div className="size-10 rounded-full bg-white/10 flex items-center justify-center">
                     <span className="material-symbols-outlined text-white">arrow_forward</span>
                 </div>
             </div>
        </button>
      </div>

      <div ref={sectionRefs.checklist} className="pt-2 space-y-4">
          {/* ... Checklist Logic ... */}
          <div className="flex items-center justify-between px-2">
              <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
                  Quick Checklist
                  <span className="size-2 rounded-full bg-cyan-400 animate-pulse"></span>
              </h3>
              {checklist.length > 0 && (
                  <button 
                    onClick={() => setShowClearConfirm(true)}
                    className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:brightness-125 transition-all flex items-center gap-1.5 bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20"
                  >
                      <span className="material-symbols-outlined text-sm">delete</span>
                      Delete All
                  </button>
              )}
          </div>
          
          <div className="p-6 rounded-[32px] bg-[#111c26]/60 border border-white/5 backdrop-blur-xl relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-primary to-violet-500 animate-gradient-flow opacity-60"></div>
              <form onSubmit={handleAddChecklistItem} className="relative z-10 mb-6 group">
                  <div className="relative">
                      <input 
                        type="text" 
                        value={checklistInput}
                        onChange={(e) => setChecklistInput(e.target.value)}
                        placeholder="Add a Checklist (Laptop, Lab Coat , Record Note etc)"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pr-12 text-sm font-bold text-white placeholder:text-slate-600 focus:border-cyan-500/50 outline-none transition-all"
                      />
                      <button 
                        type="submit" 
                        className={`absolute right-2 top-1/2 -translate-y-1/2 size-10 rounded-xl flex items-center justify-center transition-all ${
                            checklistInput.trim() ? 'bg-cyan-500 text-white shadow-lg scale-100' : 'bg-white/10 text-slate-400 scale-90 opacity-60'
                        }`}
                      >
                          <span className="material-symbols-outlined">add</span>
                      </button>
                  </div>
              </form>
              <div className="space-y-3 relative z-10 max-h-[300px] overflow-y-auto hide-scrollbar">
                  {checklist.length > 0 ? checklist.map((item, index) => {
                      const glowStyle = GLOW_COLORS[index % GLOW_COLORS.length];
                      return (
                      <div 
                        key={item.id}
                        onMouseDown={() => handleChecklistLongPressStart(item)}
                        onMouseUp={handleChecklistLongPressEnd}
                        onMouseLeave={handleChecklistLongPressEnd}
                        onTouchStart={() => handleChecklistLongPressStart(item)}
                        onTouchEnd={handleChecklistLongPressEnd}
                        onDoubleClick={() => setEditingItem(item)}
                        onClick={() => onToggleChecklistItem(item.id)}
                        className={`group p-4 rounded-2xl flex items-center gap-4 transition-all cursor-pointer relative overflow-hidden border ${
                            item.completed 
                            ? 'bg-white/[0.01] border-white/5 opacity-50 grayscale select-none' 
                            : `${glowStyle.bg} ${glowStyle.border} ${glowStyle.shadow} hover:brightness-125`
                        }`}
                      >
                          {item.completed && (
                              <div className="absolute inset-0 bg-cyan-500/5 blur-xl pointer-events-none"></div>
                          )}
                          <div className={`size-6 rounded-lg flex items-center justify-center transition-all border-2 ${
                              item.completed ? 'bg-cyan-500 border-cyan-500' : 'bg-transparent border-white/10 group-hover:border-white/30'
                          }`}>
                              {item.completed && <span className="material-symbols-outlined text-[16px] text-white font-black">check</span>}
                          </div>
                          <span className={`flex-1 text-sm font-bold leading-tight transition-all ${
                              item.completed ? 'line-through text-slate-600' : 'text-slate-200'
                          }`}>
                              {item.text}
                          </span>
                      </div>
                  )}) : (
                      <div className="py-8 text-center flex flex-col items-center gap-3 opacity-20">
                          <span className="material-symbols-outlined text-4xl">inventory_2</span>
                          <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed max-w-[160px]">Empty Checklist. Add things you might forget!</p>
                      </div>
                  )}
              </div>
          </div>
          <p className="text-center text-[9px] font-black text-slate-700 uppercase tracking-widest">
              Checklist items are separate from tasks
          </p>
      </div>

      {/* NEW: Habits Section (Renamed from Daily Routine) */}
      <div ref={sectionRefs.habits} className="pt-2 space-y-4">
          {/* ... Habits Logic ... */}
          <div className="flex items-center justify-between px-2">
              <h3 className="text-xl font-black tracking-tight flex items-center gap-2.5 text-white">
                  Habits
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                  </span>
              </h3>
              <button 
                onClick={() => setShowRoutineClearConfirm(true)}
                className="text-[10px] font-black text-red-500 uppercase tracking-widest bg-red-500/10 px-3 py-1.5 rounded-full border border-red-500/20 hover:bg-red-500/20 transition-all"
              >
                  RESET
              </button>
          </div>

          <div className="p-6 rounded-[32px] bg-[#111c26] border border-white/10 relative overflow-hidden shadow-xl">
              <form onSubmit={handleAddHabit} className="relative z-10 mb-6 space-y-3">
                  <input 
                    type="text" 
                    value={habitInput}
                    onChange={(e) => setHabitInput(e.target.value)}
                    placeholder="Add a new habit..."
                    className="w-full bg-[#1e2a36] border border-white/10 rounded-2xl p-4 text-sm font-bold text-white placeholder:text-slate-600 outline-none transition-all focus:border-white/20"
                  />
                  
                  <div className="flex gap-3">
                      <div className="flex-1 flex bg-[#1e2a36] rounded-2xl p-1.5 border border-white/10 h-[54px] items-center justify-between">
                          {['daily', 'weekly', 'monthly'].map((freq) => (
                              <button
                                key={freq}
                                type="button"
                                onClick={() => setHabitFrequency(freq as any)}
                                className={`flex-1 h-full rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                                    habitFrequency === freq 
                                    ? getFrequencyActiveStyle(freq)
                                    : 'text-slate-600 hover:text-slate-400 hover:bg-white/5'
                                }`}
                              >
                                  {freq.charAt(0).toUpperCase() + freq.slice(1)}
                              </button>
                          ))}
                      </div>
                      <button 
                        type="submit" 
                        className={`size-[54px] rounded-2xl flex items-center justify-center transition-all shadow-lg shrink-0 ${habitInput.trim() ? getHabitPlusColor(habitFrequency) : 'bg-[#1e2a36] text-slate-600 border border-white/10'}`}
                        disabled={!habitInput.trim()}
                      >
                          <span className="material-symbols-outlined text-2xl">add</span>
                      </button>
                  </div>
              </form>

              <div className="space-y-3 relative z-10">
                  {routine.map((item) => (
                      <div 
                        key={item.id}
                        className={`group relative rounded-2xl bg-[#16202a] p-4 flex items-center gap-4 border border-white/5 overflow-hidden transition-all hover:bg-[#1a2530]`}
                        onClick={() => onToggleRoutineItem(item.id)}
                      >
                          {/* Colored Border Strip */}
                          <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${item.color || 'bg-slate-500'}`}></div>
                          
                          <div className={`size-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                              item.completed 
                              ? `bg-white/10 border-transparent text-white`
                              : `border-white/20 bg-transparent text-transparent group-hover:border-white/40`
                          }`}>
                              {item.completed && <span className="material-symbols-outlined text-[14px] font-black">check</span>}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                              <p className={`text-sm font-bold leading-tight transition-all ${item.completed ? 'line-through text-slate-500' : 'text-white'}`}>
                                  {item.title}
                              </p>
                              <div className="flex gap-2 mt-1.5">
                                  <span className="px-2 py-0.5 rounded bg-white/5 text-[9px] font-black uppercase tracking-wider text-slate-500">
                                      {item.frequency}
                                  </span>
                                  {item.type === 'custom' && (
                                      <span className="px-2 py-0.5 rounded bg-white/5 text-[9px] font-black uppercase tracking-wider text-slate-600">
                                          CUSTOM
                                      </span>
                                  )}
                              </div>
                          </div>

                          <button 
                            onClick={(e) => { e.stopPropagation(); onDeleteRoutineItem(item.id); }}
                            className="size-10 rounded-full flex items-center justify-center text-slate-600 hover:text-red-500 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                          >
                              <span className="material-symbols-outlined text-lg">delete</span>
                          </button>
                      </div>
                  ))}
                  
                  {routine.length === 0 && (
                      <div className="py-8 text-center opacity-30">
                          <p className="text-xs font-bold text-slate-400">No active habits</p>
                      </div>
                  )}
              </div>
          </div>
      </div>

      {/* NEW SECTION: The Future (Resources) */}
      <div ref={sectionRefs.resources} className="pt-2 pb-24 space-y-5">
          {/* ... Resources Logic ... */}
          <div className="flex items-center justify-between px-2">
              <h3 className="text-xl font-black tracking-tight flex items-center gap-2.5 text-white">
                  The Future
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-purple-500"></span>
                  </span>
              </h3>
              {reorderMode ? (
                  <button 
                    onClick={() => { setReorderMode(false); setSelectedResourceId(null); }}
                    className="text-[10px] font-black text-white uppercase tracking-widest bg-emerald-500/20 px-3 py-1.5 rounded-full border border-emerald-500/30 animate-pulse"
                  >
                      Done Reordering
                  </button>
              ) : (
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-full border border-white/5">Study Materials</p>
              )}
          </div>
          
          <div className="grid grid-cols-2 gap-3 px-1">
              {resources.map((res) => {
                  const themeIndex = res.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                  const theme = RESOURCE_THEMES[themeIndex % RESOURCE_THEMES.length];
                  
                  const titleLength = res.title.length;
                  let fontSizeClass = 'text-xl';
                  if (titleLength > 20) fontSizeClass = 'text-base';
                  if (titleLength > 35) fontSizeClass = 'text-xs';

                  const maxChars = 50;
                  const displayTitle = titleLength > maxChars ? res.title.substring(0, maxChars) + '...' : res.title;

                  const isSelected = selectedResourceId === res.id;

                  return (
                      <div 
                        key={res.id}
                        onMouseDown={() => handleResourceLongPressStart(res.id)}
                        onMouseUp={handleResourceLongPressEnd}
                        onMouseLeave={handleResourceLongPressEnd}
                        onTouchStart={() => handleResourceLongPressStart(res.id)}
                        onTouchEnd={handleResourceLongPressEnd}
                        onClick={() => handleResourceClick(res)}
                        className={`group relative h-40 rounded-[32px] border transition-all duration-500 cursor-pointer overflow-hidden ${
                            reorderMode 
                            ? isSelected 
                                ? `scale-95 border-2 border-white ring-4 ring-white/20 z-20 ${theme.bg}`
                                : `scale-100 opacity-80 border-dashed border-white/30 animate-pulse ${theme.bg}`
                            : `active:scale-[0.97] ${theme.bg} ${theme.border} ${theme.shadow}`
                        }`}
                      >
                          <div className={`absolute -right-8 -top-8 w-32 h-32 blur-[50px] rounded-full transition-all duration-700 opacity-0 group-hover:opacity-100 ${theme.blob1}`}></div>
                          <div className={`absolute -left-8 -bottom-8 w-32 h-32 blur-[50px] rounded-full transition-all duration-700 opacity-0 group-hover:opacity-100 ${theme.blob2}`}></div>
                          
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out pointer-events-none skew-x-12"></div>

                          <div className="flex flex-col h-full relative z-10 p-5">
                              <div className="flex justify-between items-start">
                                  <span className={`px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest backdrop-blur-md transition-colors ${theme.badgeBg} ${theme.badgeBorder} ${theme.text}`}>
                                     {res.subject.length > 10 ? res.subject.substring(0, 10) + '..' : res.subject}
                                  </span>
                                  <div className={`size-9 rounded-full bg-white/5 flex items-center justify-center transition-all duration-500 shadow-inner group-hover:rotate-45 group-hover:scale-110 ${theme.iconBg} ${theme.iconText}`}>
                                      <span className="material-symbols-outlined text-lg">
                                          {reorderMode ? 'swap_horiz' : 'arrow_outward'}
                                      </span>
                                  </div>
                              </div>

                              <div className="flex-1 flex items-center justify-center text-center px-2">
                                  <h4 className={`${fontSizeClass} font-black leading-tight drop-shadow-lg transition-all duration-300 group-hover:scale-105 ${theme.titleColor}`}>
                                      {displayTitle}
                                  </h4>
                              </div>
                              <div className="h-6"></div>
                          </div>

                          {!reorderMode && (
                              <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteResource(res.id);
                                }}
                                className={`absolute bottom-0 right-0 h-12 w-12 flex items-center justify-center rounded-tl-[24px] bg-white/5 text-slate-500 transition-all z-20 active:scale-95 ${theme.deleteHover} hover:text-white`}
                              >
                                  <span className="material-symbols-outlined text-xl">delete</span>
                              </button>
                          )}
                      </div>
                  );
              })}
              
              <button 
                 onClick={onOpenAddResource}
                 className="h-40 rounded-[32px] border-2 border-dashed border-white/10 hover:border-purple-500/40 hover:bg-purple-500/5 flex flex-col items-center justify-center gap-3 transition-all active:scale-95 group relative overflow-hidden"
              >
                  <div className="size-14 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 group-hover:bg-purple-500/10 transition-all duration-300 shadow-sm border border-white/5 group-hover:border-purple-500/20">
                      <span className="material-symbols-outlined text-3xl text-slate-500 group-hover:text-purple-400 transition-colors">add_link</span>
                  </div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-purple-300 transition-colors">Add Resource</span>
              </button>
          </div>
      </div>
      
      {/* ... Modals (Budget, Transactions, Confirmations) ... */}
      {showBudgetDetails && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 backdrop-blur-md px-4" onClick={() => setShowBudgetDetails(false)}>
            <div 
                className="w-full max-w-sm bg-[#111c26] rounded-[40px] p-8 border border-white/10 shadow-2xl flex flex-col max-h-[80vh] animate-zoom-in"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-black text-white">Budget Details</h2>
                    <button onClick={() => setShowBudgetDetails(false)} className="size-8 rounded-full bg-white/5 flex items-center justify-center">
                        <span className="material-symbols-outlined text-sm text-slate-400">close</span>
                    </button>
                </div>

                <div className="flex gap-2 mb-6">
                    {['daily', 'weekly', 'monthly'].map((p) => (
                        <button
                            key={p}
                            onClick={() => onChangeBudgetPeriod(p as any)}
                            className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                                budget.period === p 
                                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                                : 'bg-white/5 text-slate-500 hover:bg-white/10'
                            }`}
                        >
                            {p}
                        </button>
                    ))}
                </div>

                <div className="mb-6 p-5 rounded-3xl bg-gradient-to-br from-emerald-600/20 to-teal-600/10 border border-emerald-500/20 text-center">
                    <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1">Total Spent</p>
                    <p className="text-3xl font-black text-white">₹{totalSpent.toLocaleString('en-IN')}</p>
                </div>

                <div className="flex-1 overflow-y-auto hide-scrollbar space-y-3">
                    {budget.transactions.length > 0 ? (
                        budget.transactions.slice().reverse().map(t => (
                            <div key={t.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-sm text-white">{t.description}</p>
                                    <p className="text-[10px] font-bold text-slate-500">{new Date(t.date).toLocaleDateString()}</p>
                                </div>
                                <p className="font-black text-emerald-400">₹{t.amount}</p>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 opacity-30">
                            <span className="material-symbols-outlined text-4xl mb-2">receipt_long</span>
                            <p className="text-xs font-bold">No transactions yet</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}

      {showAddTransaction && (
        <div className="fixed inset-0 z-[350] flex items-center justify-center bg-black/80 backdrop-blur-md px-4" onClick={() => setShowAddTransaction(false)}>
            <div 
                className="w-full max-w-sm bg-[#111c26] rounded-[40px] p-8 border border-white/10 shadow-2xl animate-zoom-in"
                onClick={e => e.stopPropagation()}
            >
                <h2 className="text-xl font-black text-white mb-6">Manage Budget</h2>
                
                <form onSubmit={handleAddTransactionSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Amount (₹)</label>
                        <input
                            type="number"
                            autoFocus
                            value={transactionAmount}
                            onChange={e => setTransactionAmount(e.target.value)}
                            placeholder="0"
                            className="w-full bg-[#1e2a36] border border-white/10 rounded-2xl p-4 text-white font-bold focus:border-emerald-500 outline-none transition-all"
                        />
                        {/* Quick Add Buttons */}
                        <div className="flex gap-2 overflow-x-auto hide-scrollbar pt-2">
                            {[10, 25, 50, 100, 500].map(amt => (
                                <button
                                    key={amt}
                                    type="button"
                                    onClick={() => setTransactionAmount(prev => (Number(prev || 0) + amt).toString())}
                                    className="flex-1 py-2 px-3 rounded-xl bg-white/5 border border-white/10 text-xs font-black text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/30 transition-all active:scale-95"
                                >
                                    +{amt}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Description</label>
                        <input
                            type="text"
                            value={transactionDesc}
                            onChange={e => setTransactionDesc(e.target.value)}
                            placeholder="Lunch, Bus fare..."
                            className="w-full bg-[#1e2a36] border border-white/10 rounded-2xl p-4 text-white font-bold focus:border-emerald-500 outline-none transition-all"
                        />
                    </div>

                    <button 
                        type="submit"
                        disabled={!transactionAmount || !transactionDesc}
                        className="w-full py-4 rounded-2xl bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 active:scale-95 transition-all mt-4 disabled:opacity-50"
                    >
                        Add Transaction
                    </button>
                </form>

                <div className="mt-6 pt-6 border-t border-white/10">
                    <button 
                        onClick={() => { onResetBudget(); setShowAddTransaction(false); }}
                        className="w-full py-3 rounded-2xl bg-red-500/10 text-red-500 font-bold text-xs border border-red-500/20 hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined text-sm">restart_alt</span>
                        Reset Current Period
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Confirmation Modals */}
      {showClearConfirm && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 backdrop-blur-md px-4" onClick={() => setShowClearConfirm(false)}>
              <div 
                className="w-full max-w-xs bg-[#111c26] rounded-[32px] p-8 border border-red-500/30 shadow-2xl animate-zoom-in text-center"
                onClick={e => e.stopPropagation()}
              >
                  <div className="size-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
                      <span className="material-symbols-outlined text-3xl text-red-500">delete</span>
                  </div>
                  <h3 className="text-xl font-black text-white mb-3">Delete Checklist?</h3>
                  <p className="text-slate-400 text-sm font-medium mb-8 leading-relaxed">This will permanently delete all items in the checklist.</p>
                  <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => setShowClearConfirm(false)}
                        className="py-4 rounded-2xl bg-white/5 text-slate-400 font-bold text-sm hover:bg-white/10 transition-all"
                      >
                          Cancel
                      </button>
                      <button 
                        onClick={() => { onClearChecklist(); setShowClearConfirm(false); }}
                        className="py-4 rounded-2xl bg-red-500 text-white font-bold text-sm shadow-lg shadow-red-500/20 hover:brightness-110 transition-all"
                      >
                          Delete All
                      </button>
                  </div>
              </div>
          </div>
      )}

      {showRoutineClearConfirm && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 backdrop-blur-md px-4" onClick={() => setShowRoutineClearConfirm(false)}>
              <div 
                className="w-full max-w-xs bg-[#111c26] rounded-[32px] p-8 border border-soft-pink/30 shadow-2xl animate-zoom-in text-center"
                onClick={e => e.stopPropagation()}
              >
                  <div className="size-16 rounded-full bg-soft-pink/10 flex items-center justify-center mx-auto mb-6">
                      <span className="material-symbols-outlined text-3xl text-soft-pink">restart_alt</span>
                  </div>
                  <h3 className="text-xl font-black text-white mb-3">Reset Habits?</h3>
                  <p className="text-slate-400 text-sm font-medium mb-8 leading-relaxed">This will uncheck all habits so you can start fresh.</p>
                  <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => setShowRoutineClearConfirm(false)}
                        className="py-4 rounded-2xl bg-white/5 text-slate-400 font-bold text-sm hover:bg-white/10 transition-all"
                      >
                          Cancel
                      </button>
                      <button 
                        onClick={() => { onClearRoutine(); setShowRoutineClearConfirm(false); }}
                        className="py-4 rounded-2xl bg-soft-pink text-white font-bold text-sm shadow-lg shadow-soft-pink/20 hover:brightness-110 transition-all"
                      >
                          Reset All
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Item Editing Modal */}
      {editingItem && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 backdrop-blur-md px-4" onClick={() => setEditingItem(null)}>
              <div 
                className="w-full max-w-sm bg-[#111c26] rounded-[32px] p-8 border border-white/10 shadow-2xl animate-zoom-in"
                onClick={e => e.stopPropagation()}
              >
                  <h3 className="text-xl font-black text-white mb-6">Edit Item</h3>
                  <input 
                    autoFocus
                    type="text"
                    defaultValue={editingItem.text}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            onEditChecklistItem(editingItem.id, (e.target as HTMLInputElement).value.trim());
                            setEditingItem(null);
                        }
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-base font-bold text-white focus:border-cyan-500 transition-all mb-6"
                  />
                  <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => { onDeleteChecklistItem(editingItem.id); setEditingItem(null); }}
                        className="py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 font-bold text-sm hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
                      >
                          <span className="material-symbols-outlined text-sm">delete</span>
                          Delete
                      </button>
                      <button 
                        onClick={() => setEditingItem(null)}
                        className="py-4 rounded-2xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20 hover:brightness-110 transition-all"
                      >
                          Done
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Event Details Modal */}
      {viewingEvent && (
        <div className="fixed inset-0 z-[350] flex items-center justify-center bg-black/80 backdrop-blur-md p-6" onClick={() => setViewingEvent(null)}>
            <div 
                className="w-full max-w-sm bg-[#111c26] rounded-[40px] border border-white/10 shadow-2xl overflow-hidden animate-zoom-in"
                onClick={e => e.stopPropagation()}
            >
                <div className={`h-32 bg-gradient-to-br ${getEventStyle(viewingEvent.icon).bg} relative`}>
                    <button onClick={() => setViewingEvent(null)} className="absolute top-4 right-4 size-8 rounded-full bg-black/20 text-white flex items-center justify-center hover:bg-black/30">
                        <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                    <div className="absolute -bottom-8 left-8 size-16 rounded-2xl bg-[#111c26] p-1.5 shadow-xl">
                        <div className={`w-full h-full rounded-xl flex items-center justify-center ${getEventStyle(viewingEvent.icon).iconBg}`}>
                            <span className="material-symbols-outlined text-3xl text-white">{viewingEvent.icon}</span>
                        </div>
                    </div>
                </div>
                
                <div className="pt-10 p-8">
                    <div className="mb-6">
                        <h2 className="text-2xl font-black text-white leading-tight">{viewingEvent.title}</h2>
                        <div className="flex items-center gap-2 mt-1 text-slate-400">
                            <span className="material-symbols-outlined text-sm">location_on</span>
                            <span className="text-xs font-bold">{viewingEvent.location}</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Date</p>
                                <p className="text-sm font-bold text-white">{formatDisplayDate(viewingEvent.date)}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Time</p>
                                <p className="text-sm font-bold text-white">{formatDisplayTime(viewingEvent.startTime)}</p>
                            </div>
                        </div>

                        {viewingEvent.description && (
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Description</p>
                                <p className="text-sm font-medium text-slate-300 leading-relaxed">{viewingEvent.description}</p>
                            </div>
                        )}

                        {getTimeRemaining(viewingEvent) && (
                            <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 text-center">
                                <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Time Remaining</p>
                                <p className="text-xl font-black text-white">
                                    {(() => {
                                        const t = getTimeRemaining(viewingEvent);
                                        return t ? `${t.days}d : ${t.hours}h : ${t.minutes}m` : 'Started';
                                    })()}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-8">
                        <button 
                            onClick={() => { onDeleteEvent(viewingEvent.id); setViewingEvent(null); }}
                            className="py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-base">delete</span>
                            Delete
                        </button>
                        <button 
                            onClick={() => { onEditEvent(viewingEvent); setViewingEvent(null); }}
                            className="py-4 rounded-2xl bg-white/5 border border-white/10 text-white text-xs font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-base">edit</span>
                            Edit
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Notifications Modal */}
      {showNotifications && (
        <div 
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-2xl px-4"
          onClick={() => setShowNotifications(false)}
        >
          <div 
            className="w-full max-w-sm bg-[#111c26] rounded-[40px] border border-white/10 shadow-2xl overflow-hidden animate-zoom-in flex flex-col max-h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8 pb-6 flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="material-symbols-outlined text-primary text-3xl">notifications</span>
                <h2 className="text-2xl font-black text-white truncate">Notifications</h2>
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-4">
                {hasUnread && (
                  <button 
                    onClick={handleMarkAsRead}
                    className="text-[10px] font-black text-primary uppercase tracking-[0.15em] px-5 py-3 rounded-full border border-primary/40 bg-primary/5 active:scale-95 transition-all whitespace-nowrap"
                  >
                    Mark all as read
                  </button>
                )}
                <button 
                  onClick={() => setShowNotifications(false)} 
                  className="size-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 active:scale-90 transition-all border border-white/10"
                >
                  <span className="material-symbols-outlined text-slate-400 text-sm font-bold">close</span>
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 pt-0 space-y-4 hide-scrollbar">
              {notifications.length > 0 ? notifications.map((notif) => (
                <div 
                  key={notif.id} 
                  className={`p-5 rounded-2xl border flex gap-4 transition-all ${
                    hasUnread ? 'bg-primary/5 border-primary/20 shadow-lg' : 'bg-white/[0.02] border-white/5 opacity-60'
                  }`}
                >
                  <div className={`size-12 rounded-2xl flex items-center justify-center shrink-0 ${
                    notif.type === 'event' ? 'bg-indigo-500/10 text-indigo-400' :
                    notif.type === 'task' ? 'bg-soft-pink/10 text-soft-pink' :
                    notif.type === 'class' ? 'bg-purple-500/10 text-purple-400' :
                    'bg-emerald-500/10 text-emerald-400'
                  }`}>
                    <span className="material-symbols-outlined text-2xl">
                      {notif.type === 'event' ? 'calendar_month' : notif.type === 'task' ? 'assignment' : notif.type === 'class' ? 'school' : 'info'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-sm text-white truncate">{notif.title}</h4>
                      <span className="text-[10px] font-black text-slate-600 uppercase tracking-tighter shrink-0">{notif.time}</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed font-medium line-clamp-2">{notif.message}</p>
                  </div>
                </div>
              )) : (
                <div className="py-20 text-center flex flex-col items-center gap-4 opacity-30">
                  <span className="material-symbols-outlined text-5xl">notifications_off</span>
                  <p className="text-sm font-bold">No new notifications</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {showQuoteModal && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/80 backdrop-blur-md px-4" onClick={() => setShowQuoteModal(false)}>
            <div 
                className={`w-full max-w-sm bg-[#1a1a2e] rounded-[40px] p-8 border ${currentTheme.border} ${currentTheme.shadow} animate-zoom-in relative overflow-hidden`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className={`absolute top-0 right-0 p-32 ${currentTheme.glow} blur-[80px] rounded-full pointer-events-none`}></div>
                <div className="relative z-10">
                    <div className={`size-16 rounded-full ${currentTheme.glow} flex items-center justify-center mb-6 mx-auto`}>
                        <span className={`material-symbols-outlined text-3xl ${currentTheme.text}`}>format_quote</span>
                    </div>
                    <p className="text-xl font-bold text-center text-white leading-relaxed italic mb-8">
                        "{currentQuote}"
                    </p>
                    <button 
                        onClick={() => setShowQuoteModal(false)}
                        className="w-full py-4 rounded-2xl bg-white text-black font-black uppercase tracking-widest hover:bg-slate-200 transition-colors shadow-xl"
                    >
                        {currentButtonText}
                    </button>
                </div>
            </div>
        </div>
      )}

      <style>{`
        @keyframes zoomIn { 
          from { transform: scale(0.9); opacity: 0; } 
          to { transform: scale(1); opacity: 1; } 
        } 
        .animate-zoom-in { animation: zoomIn 0.35s cubic-bezier(0.16, 1, 0.3, 1); }
        
        @keyframes slideInItem {
            from { opacity: 0; transform: translateX(-10px); }
            to { opacity: 1; transform: translateX(0); }
        }

        @keyframes gradientFlow {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        .animate-gradient-flow {
            background-size: 200% 200%;
            animation: gradientFlow 4s ease infinite;
        }

        @keyframes gradient-xy {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
        }
        .animate-gradient-xy {
            background-size: 200% 200%;
            animation: gradient-xy 6s ease infinite;
        }

        @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
            animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default TasksScreen;
