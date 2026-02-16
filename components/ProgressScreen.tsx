
import React, { useMemo, useState, useRef } from 'react';
import { Task, UserProfile, ClassSession, UpcomingEvent, CampusChecklistItem, DailyRoutineItem, BudgetState, FocusState, ExamSchedule } from '../types';

interface ProgressScreenProps {
  tasks: Task[];
  userProfile: UserProfile | null;
  classes?: ClassSession[];
  events?: UpcomingEvent[];
  checklist?: CampusChecklistItem[];
  routine?: DailyRoutineItem[];
  budget?: BudgetState;
  focusState?: FocusState;
  examSchedules?: ExamSchedule[];
}

// Helper to check for class conflicts (simple version)
const hasClassConflicts = (classes: ClassSession[]) => {
    if (!classes || classes.length === 0) return false;
    // Group by day
    const byDay: Record<string, ClassSession[]> = {};
    for (const c of classes) {
        if (!byDay[c.day]) byDay[c.day] = [];
        byDay[c.day].push(c);
    }
    
    for (const day in byDay) {
        const dayClasses = byDay[day].sort((a,b) => a.startTime.localeCompare(b.startTime));
        for (let i = 0; i < dayClasses.length - 1; i++) {
            const currentEnd = dayClasses[i].endTime;
            const nextStart = dayClasses[i+1].startTime;
            if (currentEnd > nextStart) return true;
        }
    }
    return false;
};

// 100 Unique Titles (0-99 mapping to phases)
const LEVEL_TITLES = [
  // PHASE 1 — Student Awakening (1–20)
  "Fresh Arrival", "Orientation Survivor", "Schedule Starter", "Task Tracker", "Routine Builder",
  "Focus Seeker", "Habit Former", "Deadline Aware", "Early Initiator", "Consistency Cadet",
  "Study Starter", "Planner Apprentice", "Time Organizer", "Class Attendee", "Assignment Finisher",
  "Note Keeper", "Revision Runner", "Productivity Rookie", "Discipline Builder", "Academic Explorer",

  // PHASE 2 — Structured Scholar (21–40)
  "Time Strategist", "Focus Fighter", "Task Commander", "Routine Master", "Study Architect",
  "Deadline Dominator", "Consistency Keeper", "Exam Preparer", "Performance Tracker", "Organized Mind",
  "Study Specialist", "Progress Builder", "Efficiency Learner", "Momentum Creator", "Discipline Keeper",
  "Academic Warrior", "Focus Specialist", "Strategy Planner", "Study Commander", "Productivity Knight",

  // PHASE 3 — Elite Performer (41–60)
  "System Optimizer", "Task Elite", "Focus Veteran", "Consistency Elite", "Time Guardian",
  "Performance Master", "Routine Architect", "Deep Work Specialist", "Momentum Master", "Academic Champion",
  "Precision Planner", "Efficiency Master", "Deadline Slayer", "Focus Overlord", "Productivity Expert",
  "Discipline Titan", "Time Architect", "Study General", "Task Virtuoso", "Academic Conqueror",

  // PHASE 4 — Cosmic Ascension (61–80)
  "Orbit Organizer", "Stellar Strategist", "Gravity Defier", "Focus Voyager", "Habit Navigator",
  "Time Voyager", "Momentum Surfer", "Discipline Voyager", "Stellar Achiever", "Cosmic Performer",
  "Nebula Navigator", "Orbit Commander", "Stellar Guardian", "Galaxy Strategist", "Supernova Achiever",
  "Comet Commander", "Meteor Master", "Celestial Performer", "Quantum Planner", "Cosmic Architect",

  // PHASE 5 — Mythic Productivity Entity (81–100)
  "Dimension Organizer", "Reality Planner", "Timeline Keeper", "Energy Controller", "Time Bender",
  "Light Speed Achiever", "Warp Strategist", "Wormhole Commander", "Multiverse Planner", "Cosmic Entity",
  "Astral Guardian", "Galactic Sovereign", "Stellar Emperor", "Universal Strategist", "Time Sovereign",
  "Reality Architect", "Star Creator", "Galaxy Forger", "Universe Shaper","Infinity Sovereign", "ONE ABOVE ALL"
];

// Helper for Level Titles
const getLevelTitle = (level: number) => {
    if (level >= 100) return "ONE ABOVE ALL";
    // Returns title at index matching level (0-99)
    return LEVEL_TITLES[level] || "Student";
};

const ProgressScreen: React.FC<ProgressScreenProps> = ({ tasks, userProfile, classes = [], events = [], checklist = [], routine = [], budget, focusState, examSchedules = [] }) => {
  const [showAllLocked, setShowAllLocked] = useState(false);
  const [showAllLegendary, setShowAllLegendary] = useState(false);
  const [showLevelTable, setShowLevelTable] = useState(false);
  
  // Navigation Menu State
  const [showNavMenu, setShowNavMenu] = useState(false);
  const sectionRefs = {
      level: useRef<HTMLDivElement>(null),
      streak: useRef<HTMLDivElement>(null),
      activity: useRef<HTMLDivElement>(null),
      milestones: useRef<HTMLDivElement>(null),
  };

  const handleScrollTo = (section: keyof typeof sectionRefs) => {
      sectionRefs[section].current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setShowNavMenu(false);
  };

  // Menu Items Definition for Dynamic Rendering
  const menuItems = [
    { id: 'level', label: 'Current Level', icon: 'stars', color: 'text-indigo-400', bg: 'hover:bg-indigo-500/10', border: 'hover:border-indigo-500/20' },
    { id: 'streak', label: 'Weekly Streak', icon: 'local_fire_department', color: 'text-orange-400', bg: 'hover:bg-orange-500/10', border: 'hover:border-orange-500/20' },
    { id: 'activity', label: 'Weekly Activity', icon: 'bar_chart', color: 'text-emerald-400', bg: 'hover:bg-emerald-500/10', border: 'hover:border-emerald-500/20' },
    { id: 'milestones', label: 'Milestones', icon: 'emoji_events', color: 'text-yellow-400', bg: 'hover:bg-yellow-500/10', border: 'hover:border-yellow-500/20' },
  ];

  // Current Date Helper
  const now = new Date();
  
  // Long press logic
  const longPressTimer = useRef<number | null>(null);

  const handleLevelStart = () => {
    longPressTimer.current = window.setTimeout(() => {
        setShowLevelTable(true);
    }, 600);
  };

  const handleLevelEnd = () => {
    if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
    }
  };

  // --- 1. REAL STREAK CALCULATION ---
  const currentStreak = useMemo(() => {
    const completedWithDates = tasks
        .filter(t => t.completed && t.completedAt)
        .map(t => new Date(t.completedAt!).setHours(0,0,0,0))
        .sort((a, b) => b - a);

    if (completedWithDates.length === 0) return 0;

    const uniqueDates = Array.from(new Set(completedWithDates));
    const today = new Date().setHours(0,0,0,0);
    const yesterday = today - 86400000;

    if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) return 0;

    let streak = 0;
    let checkDate = uniqueDates[0] === today ? today : yesterday;

    for (const date of uniqueDates) {
        if (date === checkDate) {
            streak++;
            checkDate -= 86400000;
        } else {
            break; 
        }
    }
    return streak;
  }, [tasks]);

  // --- 2. STATS CALCULATION ---
  const weeklyData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const todayIndex = new Date().getDay();
    const currentWeekStart = new Date(now);
    currentWeekStart.setDate(now.getDate() - todayIndex);
    currentWeekStart.setHours(0,0,0,0);
    const lastWeekStart = new Date(currentWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    
    const currentWeekCounts = new Array(7).fill(0);
    const lastWeekCounts = new Array(7).fill(0);

    // Productivity Pulse Data
    let morningCount = 0;
    let afternoonCount = 0;
    let eveningCount = 0;

    // Helper to process any item with a completedAt date
    const processItem = (completedAt?: string) => {
        if (!completedAt) return;
        const date = new Date(completedAt);
        const time = date.getTime();
        
        if (time >= currentWeekStart.getTime() && time < currentWeekStart.getTime() + 7 * 86400000) {
            currentWeekCounts[date.getDay()]++;
        }
        if (time >= lastWeekStart.getTime() && time < lastWeekStart.getTime() + 7 * 86400000) {
            lastWeekCounts[date.getDay()]++;
        }

        // Pulse Logic
        const hour = date.getHours();
        if (hour >= 5 && hour < 12) morningCount++;
        else if (hour >= 12 && hour < 18) afternoonCount++;
        else eveningCount++;
    };

    // Process Tasks
    tasks.forEach(task => {
        if (task.completed) processItem(task.completedAt);
    });

    // Process Checklist
    checklist.forEach(item => {
        if (item.completed) processItem(item.completedAt);
    });

    // Process Routine
    routine.forEach(item => {
        if (item.completed) processItem(item.completedAt);
    });

    const rotatedDays = [...days.slice(1), days[0]]; 
    const rotatedCounts = [...currentWeekCounts.slice(1), currentWeekCounts[0]];
    const maxVal = Math.max(...rotatedCounts, 1);

    const graphData = rotatedDays.map((day, idx) => ({
        day,
        value: (rotatedCounts[idx] / maxVal) * 100,
        rawCount: rotatedCounts[idx],
        isToday: day === days[now.getDay()]
    }));

    const totalCurrent = currentWeekCounts.reduce((a,b) => a+b, 0);
    const totalLast = lastWeekCounts.reduce((a,b) => a+b, 0);
    
    let percentageChange = 0;
    if (totalLast === 0) {
        percentageChange = totalCurrent > 0 ? 100 : 0;
    } else {
        percentageChange = Math.round(((totalCurrent - totalLast) / totalLast) * 100);
    }

    // Determine Peak Time
    let peakTime = 'Balanced';
    const maxPulse = Math.max(morningCount, afternoonCount, eveningCount);
    if (maxPulse > 0) {
        if (morningCount === maxPulse) peakTime = 'Early Bird';
        else if (afternoonCount === maxPulse) peakTime = 'Afternoon Grinder';
        else peakTime = 'Night Owl';
    }

    return { graphData, totalCurrent, percentageChange, peakTime, morningCount, afternoonCount, eveningCount };
  }, [tasks, checklist, routine]);

  // --- 3. XP & LEVELING ---
  const xp: number = userProfile?.xp || 0;
  // Default to 0 instead of 1
  const level: number = userProfile?.level ?? 0;
  // Updated Calculation: 1000 XP per level
  const currentLevelXp = xp % 1000; 
  const xpProgress = (currentLevelXp / 1000) * 100;

  // --- 4. MILESTONES ENGINE ---
  const totalCompleted = tasks.filter(t => t.completed).length;
  const highPriorityCompleted = tasks.filter(t => t.completed && t.priority === 'high').length;
  
  // Calculate specific conditions
  const uniqueFutureDates = new Set(tasks.filter(t => new Date(t.date) > now).map(t => t.date)).size;
  const dailyTaskCounts = tasks.filter(t => t.completed).reduce((acc: Record<string, number>, t) => {
      const d = t.date;
      acc[d] = (acc[d] || 0) + 1;
      return acc;
  }, {});
  const maxTasksInOneDay = (Object.values(dailyTaskCounts) as number[]).reduce((a, b) => Math.max(a, b), 0);
  
  const hasEarlyTask = tasks.some(t => t.completed && parseInt(t.time) < 7);
  const hasLateTask = tasks.some(t => t.completed && parseInt(t.time) >= 23);
  const hasConflict = hasClassConflicts(classes);
  const allWeekdaysClasses = ['Monday','Tuesday','Wednesday','Thursday','Friday'].every(d => classes.some(c => c.day === d));
  const notesCount = classes.filter(c => c.notes).length;
  const joinedDays = userProfile?.joinedDate ? Math.floor((now.getTime() - new Date(userProfile.joinedDate).getTime()) / (1000 * 3600 * 24)) : 0;

  // New Checks for Habits & Checklist
  const allRoutineDone = routine.length > 0 && routine.every(r => r.completed);
  const customHabitCount = routine.filter(r => r.type === 'custom').length;
  const checklistActive = checklist.length > 0;
  const checklistDone = checklist.length > 0 && checklist.every(c => c.completed);

  // Budget
  const budgetTxCount = budget ? budget.transactions.length : 0;

  // Focus
  const totalFocusSessions = focusState?.totalSessions || 0;

  // Exam Milestones
  const examCount = examSchedules.length;
  const confirmedExamCount = examSchedules.filter(e => e.isConfirmed).length;

  // Milestone Definitions
  const normalMilestones = [
      // 🧠 Task & Productivity
      { name: 'First Orbit', req: 'Complete 1 Task', icon: 'check_circle', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', unlocked: totalCompleted >= 1 },
      { name: 'Double Check', req: 'Complete 2 tasks in a single day', icon: 'done_all', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', unlocked: maxTasksInOneDay >= 2 },
      { name: 'Daily Commander', req: 'Complete all tasks for a day', icon: 'fact_check', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', unlocked: tasks.length > 0 && tasks.every(t => t.completed) },
      { name: 'Early Bird', req: 'Complete a task before 7 AM', icon: 'wb_twilight', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20', unlocked: hasEarlyTask },
      { name: 'Night Owl', req: 'Complete a task after 11 PM', icon: 'dark_mode', color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20', unlocked: hasLateTask },
      { name: 'Priority Hunter', req: 'Complete 10 High-priority tasks', icon: 'priority_high', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', unlocked: highPriorityCompleted >= 10 },
      { name: 'Perfect Planner', req: 'Plan 5 future days', icon: 'calendar_month', color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20', unlocked: uniqueFutureDates >= 5 },
      { name: 'Clean Slate', req: 'Have zero pending tasks', icon: 'cleaning_services', color: 'text-teal-400', bg: 'bg-teal-500/10 border-teal-500/20', unlocked: tasks.length > 0 && tasks.every(t => t.completed) },

      // 🔥 Streak & Consistency
      { name: 'Spark Ignited', req: 'Start a 2-day streak', icon: 'local_fire_department', color: 'text-streak-orange', bg: 'bg-streak-orange/10 border-streak-orange/20', unlocked: currentStreak >= 2 },
      { name: 'On Fire', req: '5-day streak', icon: 'whatshot', color: 'text-streak-orange', bg: 'bg-streak-orange/10 border-streak-orange/20', unlocked: currentStreak >= 5 },
      { name: 'Habit Builder', req: '7-day streak', icon: 'repeat', color: 'text-streak-orange', bg: 'bg-streak-orange/10 border-streak-orange/20', unlocked: currentStreak >= 7 },
      { name: 'Unbroken Week', req: 'Complete tasks all week', icon: 'date_range', color: 'text-streak-orange', bg: 'bg-streak-orange/10 border-streak-orange/20', unlocked: currentStreak >= 7 },

      // 📅 Planner & Classes
      { name: 'First Lecture', req: 'Add your first class', icon: 'school', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', unlocked: classes.length >= 1 },
      { name: 'Timetable Architect', req: 'Fill all weekdays', icon: 'architecture', color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20', unlocked: allWeekdaysClasses },
      { name: 'Conflict Free', req: 'No conflicts in timetable', icon: 'thumb_up', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', unlocked: classes.length > 3 && !hasConflict },
      { name: 'Quiet Day', req: 'Day with no classes', icon: 'volume_off', color: 'text-slate-400', bg: 'bg-slate-500/10 border-slate-500/20', unlocked: classes.some(c => c.day !== new Date().toLocaleDateString('en-US', {weekday:'long'})) },

      // 📝 Notes & Habits (Updated)
      { name: 'Note Taker', req: 'Add first class note', icon: 'edit_note', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', unlocked: notesCount >= 1 },
      { name: 'Bullet Brain', req: 'Use bullet notes', icon: 'format_list_bulleted', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', unlocked: classes.some(c => c.noteFormat === 'bullets') },
      { name: 'Checklist User', req: 'Add items to checklist', icon: 'checklist', color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20', unlocked: checklistActive },
      { name: 'Routine Master', req: 'Complete daily routine', icon: 'task_alt', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', unlocked: allRoutineDone },
      { name: 'Weekly Warrior', req: 'Complete a weekly habit', icon: 'date_range', color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20', unlocked: routine.some(r => r.frequency === 'weekly' && r.completed) },
      { name: 'Monthly Master', req: 'Complete a monthly habit', icon: 'calendar_month', color: 'text-pink-400', bg: 'bg-pink-500/10 border-pink-500/20', unlocked: routine.some(r => r.frequency === 'monthly' && r.completed) },
      { name: 'Habit Starter', req: 'Add a custom habit', icon: 'add_circle', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', unlocked: customHabitCount > 0 },

      // 🧘 Focus Mode
      { name: 'Focus Initiate', req: 'Complete 1 focus session', icon: 'self_improvement', color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20', unlocked: totalFocusSessions >= 1 },
      { name: 'Deep Worker', req: 'Complete 5 focus sessions', icon: 'psychology', color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20', unlocked: totalFocusSessions >= 5 },
      { name: 'Zen Master', req: 'Complete 20 focus sessions', icon: 'spa', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', unlocked: totalFocusSessions >= 20 },

      // 📊 Stats & XP & Budget
      { name: 'XP Collector', req: 'Earn 1000 XP', icon: 'stars', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20', unlocked: xp >= 1000 },
      { name: 'Level Up!', req: 'Reach Level 1', icon: 'upgrade', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20', unlocked: level >= 1 },
      { name: 'Rising Star', req: 'Reach Level 5', icon: 'hotel_class', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20', unlocked: level >= 5 },
      { name: 'Penny Pincher', req: 'Track first expense', icon: 'payments', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', unlocked: budgetTxCount >= 1 },
      { name: 'Finance Guru', req: 'Track 10 expenses', icon: 'account_balance_wallet', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', unlocked: budgetTxCount >= 10 },

      // 🎉 Events & Exams
      { name: 'Event Horizon', req: 'Add first event', icon: 'event', color: 'text-pink-400', bg: 'bg-pink-500/10 border-pink-500/20', unlocked: events.length >= 1 },
      { name: 'Time Keeper', req: 'Attend an event', icon: 'schedule', color: 'text-pink-400', bg: 'bg-pink-500/10 border-pink-500/20', unlocked: events.length >= 1 }, 
      { name: 'Exam Strategist', req: 'Create an Exam Schedule', icon: 'assignment', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20', unlocked: examCount >= 1 },
      { name: 'Finalized Plan', req: 'Confirm an Exam Schedule', icon: 'assignment_turned_in', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20', unlocked: confirmedExamCount >= 1 },
      { name: 'Fully Booked', req: 'Task+Class+Event in one day', icon: 'layers', color: 'text-pink-400', bg: 'bg-pink-500/10 border-pink-500/20', unlocked: tasks.length>0 && classes.length>0 && events.length>0 },
      { name: 'Planner Pro', req: '7 day streak', icon: 'verified', color: 'text-pink-400', bg: 'bg-pink-500/10 border-pink-500/20', unlocked: currentStreak >= 7 }
  ];

  const legendaryMilestones = [
      // 🌌 Identity
      { name: 'Cosmic Genesis', req: 'Reach Level 8', icon: 'public', unlocked: level >= 8 },
      { name: 'Disciplined Mind', req: '14-day streak', icon: 'self_improvement', unlocked: currentStreak >= 14 },
      { name: 'Architect of Time', req: '20+ Classes Added', icon: 'history_edu', unlocked: classes.length >= 20 },
      
      // 🔥 Extreme Consistency
      { name: 'Streak Immortal', req: '30-day streak', icon: 'local_fire_department', unlocked: currentStreak >= 30 },
      { name: 'Unbreakable Flame', req: '21-day streak', icon: 'whatshot', unlocked: currentStreak >= 21 },
      { name: 'Comeback Legend', req: 'Reach Level 10', icon: 'replay', unlocked: level >= 10 },

      // 🧠 Intelligence
      { name: 'Zero Chaos', req: 'No conflicts (Active)', icon: 'balance', unlocked: !hasConflict && classes.length > 5 },
      { name: 'Chrono Master', req: '100 Tasks Done', icon: 'hourglass_full', unlocked: totalCompleted >= 100 },
      { name: 'Future Seer', req: '30 tasks planned ahead', icon: 'visibility', unlocked: uniqueFutureDates >= 30 },
      { name: 'Mind Over Matter', req: '50 Focus Sessions', icon: 'filter_center_focus', unlocked: totalFocusSessions >= 50 },

      // 🏆 Performance
      { name: 'Task Overlord', req: '500 Tasks Done', icon: 'military_tech', unlocked: totalCompleted >= 500 },
      { name: 'XP Titan', req: '10,000 XP Earned', icon: 'workspace_premium', unlocked: xp >= 10000 },
      { name: 'Level Ascendant', req: 'Reach Level 20', icon: 'rocket_launch', unlocked: level >= 20 },
      { name: 'Relentless', req: '50 High Priority Done', icon: 'bolt', unlocked: highPriorityCompleted >= 50 },

      // 📅 Planner Legends
      { name: 'Class Perfected', req: '14-day streak', icon: 'school', unlocked: currentStreak >= 14 },
      { name: 'Lecture Marathon', req: '5 classes in a day', icon: 'menu_book', unlocked: classes.filter(c => c.day === new Date().toLocaleDateString('en-US', {weekday:'long'})).length >= 5 },
      { name: 'Checklist Champion', req: 'Clear list with 5+ items', icon: 'checklist_rtl', unlocked: checklistDone && checklist.length >= 5 },

      // 🧊 Legendary Aesthetic
      { name: 'Frozen Will', req: 'Unlock 10 Legends', icon: 'ac_unit', unlocked: false },
      { name: 'Icebound Focus', req: 'Reach Level 15', icon: 'psychology', unlocked: level >= 15 },
      { name: 'Silent Efficiency', req: '7-day streak', icon: 'notifications_off', unlocked: currentStreak >= 7 },

      // 🌠 Ultimate
      { name: 'Cosmic Veteran', req: 'Member for 90 days', icon: 'stars', unlocked: joinedDays >= 90 },
      { name: 'System Breaker', req: 'Level 15 + 7 Day Streak', icon: 'terminal', unlocked: level >= 15 && currentStreak >= 7 },
      { name: 'Time Itself Obeys', req: '30 Day Streak', icon: 'schedule', unlocked: currentStreak >= 30 },
      { name: 'Legend of Campus', req: 'Unlock All Legends', icon: 'diamond', unlocked: false }
  ];

  // Logic update for self-referential milestones
  const unlockedLegendCount = legendaryMilestones.filter(m => m.unlocked).length;
  legendaryMilestones.find(m => m.name === 'Frozen Will')!.unlocked = unlockedLegendCount >= 10;
  legendaryMilestones.find(m => m.name === 'Legend of Campus')!.unlocked = unlockedLegendCount >= 22;

  const unlockedNormal = normalMilestones.filter(m => m.unlocked);
  const lockedNormal = normalMilestones.filter(m => !m.unlocked);
  
  const displayedLocked = showAllLocked ? lockedNormal : lockedNormal.slice(0, 3);
  const displayedLegendary = showAllLegendary ? legendaryMilestones : legendaryMilestones.slice(0, 3);

  return (
    <div className="p-4 space-y-6" onClick={() => setShowNavMenu(false)}>
      {/* Header */}
      <div className="pt-4 pb-2 px-2 flex items-center justify-between">
        <div>
            <h2 className="text-3xl font-black tracking-tight text-white drop-shadow-[0_0_15px_rgba(13,127,242,0.4)]">Your Progress</h2>
            <p className="text-slate-400 font-bold text-xs mt-1">Track your academic journey.</p>
        </div>
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
      </div>

      {/* Level / XP Card */}
      <div 
        ref={sectionRefs.level}
        className="relative rounded-[32px] p-6 bg-gradient-to-br from-indigo-600/20 to-purple-600/10 border border-white/10 overflow-hidden active:scale-[0.98] transition-all cursor-pointer select-none"
        onDoubleClick={() => setShowLevelTable(true)}
        onMouseDown={handleLevelStart}
        onMouseUp={handleLevelEnd}
        onMouseLeave={handleLevelEnd}
        onTouchStart={handleLevelStart}
        onTouchEnd={handleLevelEnd}
      >
        <div className="flex items-center justify-between mb-4 relative z-10">
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Current Level</p>
                <div className="flex items-center gap-3">
                    <p className="text-4xl font-black text-white">{level}</p>
                    <span className="text-sm font-bold text-indigo-300 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                        {getLevelTitle(level)}
                    </span>
                </div>
            </div>
            <div className="size-14 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                <span className="material-symbols-outlined text-3xl text-indigo-400">award_star</span>
            </div>
        </div>
        <div className="relative z-10">
            <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-2">
                <span>{currentLevelXp} XP</span>
                <span>1000 XP</span>
            </div>
            <div className="h-4 bg-black/40 rounded-full overflow-hidden border border-white/5">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000" style={{ width: `${xpProgress}%` }}></div>
            </div>
            <p className="text-center text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-widest">
                {1000 - currentLevelXp} XP to Level {level + 1}
            </p>
        </div>
        <div className="absolute -right-10 -bottom-10 size-40 bg-indigo-500/20 blur-3xl rounded-full pointer-events-none"></div>
      </div>

      {/* Streak Card - Real Data */}
      <div ref={sectionRefs.streak} className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-streak-orange/10 to-transparent border border-streak-orange/20 shadow-lg shadow-streak-orange/5">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-streak-orange">Weekly Streak</p>
              <p className="text-4xl font-black tracking-tight text-white">{currentStreak} Days</p>
              <p className="text-xs font-bold text-slate-400">
                {currentStreak === 0 ? "Complete a task to start!" : "Keep the flame alive!"}
              </p>
            </div>
            <div className="fire-glow bg-streak-orange/20 rounded-full p-4 flex items-center justify-center animate-pulse">
              <span className="material-symbols-outlined text-4xl text-streak-orange">local_fire_department</span>
            </div>
          </div>
          <div className="flex gap-1.5 h-2">
             {[...Array(7)].map((_, i) => (
                 <div 
                    key={i} 
                    className={`flex-1 rounded-full transition-all ${i < currentStreak ? 'bg-streak-orange shadow-[0_0_8px_rgba(255,107,0,0.6)]' : 'bg-white/5'}`}
                 ></div>
             ))}
          </div>
        </div>
      </div>

      {/* ... (Activity and Milestones rendering remains mostly same, keeping brief) ... */}
      
      {/* Activity Chart & Pulse */}
      <div ref={sectionRefs.activity} className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-lg font-black tracking-tight">Weekly Activity</h2>
          <span className={`text-[10px] font-black px-3 py-1.5 rounded-full border ${
              weeklyData.percentageChange >= 0 
              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
              : 'bg-red-500/10 text-red-500 border-red-500/20'
          }`}>
            {weeklyData.percentageChange > 0 ? '+' : ''}{weeklyData.percentageChange}% vs Last Week
          </span>
        </div>
        <div className="rounded-[32px] p-6 bg-white/5 border border-white/10 backdrop-blur-sm">
          {/* ... (Chart implementation same as original) ... */}
          <div className="mb-8">
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Tasks Completed</p>
            <p className="text-3xl font-black text-white mt-1">{weeklyData.totalCurrent}</p>
          </div>
          <div className="grid grid-cols-7 gap-3 h-40 items-end border-b border-white/5 pb-2">
            {weeklyData.graphData.map((point) => (
              <div key={point.day} className="flex flex-col items-center justify-end h-full group relative">
                <div 
                  className={`w-full rounded-t-lg transition-all duration-700 ${
                    point.isToday 
                      ? 'chart-bar-gradient bar-glow' 
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                  style={{ height: `${point.value}%` }}
                ></div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-3 mt-3 mb-6">
            {weeklyData.graphData.map(p => (
              <p key={p.day} className={`text-[9px] text-center font-black uppercase tracking-wider ${p.isToday ? 'text-primary' : 'text-slate-500'}`}>
                {p.day}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* Milestones */}
      <div ref={sectionRefs.milestones} className="space-y-8 pb-6">
        <h2 className="text-2xl font-black tracking-tight px-2">Milestones</h2>

        {/* Unlocked */}
        {unlockedNormal.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-500 px-2">Completed</h3>
            <div className="grid grid-cols-2 gap-3">
              {unlockedNormal.map((m) => (
                <div key={m.name} className={`p-4 rounded-2xl border flex flex-col items-center text-center gap-2 relative overflow-hidden ${m.bg}`}>
                    <div className="absolute inset-0 bg-white/5 blur-xl"></div>
                    <span className={`material-symbols-outlined text-3xl relative z-10 ${m.color}`}>{m.icon}</span>
                    <div className="relative z-10">
                        <p className="text-xs font-bold text-white leading-tight">{m.name}</p>
                        <p className={`text-[8px] font-bold uppercase tracking-wide mt-1 opacity-80 ${m.color.replace('text-', 'text-')}`}>Unlocked</p>
                    </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Locked */}
        <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
                 <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Locked</h3>
                 <button onClick={() => setShowAllLocked(!showAllLocked)} className="text-[10px] font-bold text-primary uppercase tracking-wider hover:text-white transition-colors">{showAllLocked ? 'Show Less' : 'View All'}</button>
            </div>
            <div className="grid grid-cols-1 gap-3">
                {displayedLocked.map((m) => (
                    <div key={m.name} className="p-5 rounded-3xl bg-[#0c1219] border border-[#1e2a36] flex items-center gap-5 relative group transition-all">
                         <div className="size-12 rounded-2xl bg-[#151e29] border border-white/5 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-slate-600 text-xl">{m.icon}</span>
                         </div>
                         <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-400 group-hover:text-slate-300 transition-colors">{m.name}</p>
                            <p className="text-[10px] text-slate-600 font-black uppercase tracking-wider mt-1">{m.req}</p>
                         </div>
                    </div>
                ))}
            </div>
        </div>
      </div>

      {/* Level XP Table Modal */}
      {showLevelTable && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md p-6" onClick={() => setShowLevelTable(false)}>
            <div className="w-full max-w-sm bg-[#111c26] rounded-[40px] border border-white/10 shadow-2xl flex flex-col max-h-[80vh] overflow-hidden animate-zoom-in" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                    <div><h2 className="text-xl font-black text-white">XP Roadmap</h2><p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Levels 1 - 100</p></div>
                    <button onClick={() => setShowLevelTable(false)} className="size-8 rounded-full bg-white/5 flex items-center justify-center"><span className="material-symbols-outlined text-sm">close</span></button>
                </div>
                <div className="flex-1 overflow-y-auto p-2 hide-scrollbar">
                    {Array.from({ length: 100 }, (_, i) => i + 1).map(lvl => {
                        const xpRequired = lvl * 1000;
                        const isCurrent = lvl === level;
                        const isUnlocked = lvl <= level;
                        return (
                            <div key={lvl} className={`p-4 rounded-xl flex items-center justify-between mb-2 ${isCurrent ? 'bg-primary/20 border border-primary' : isUnlocked ? 'bg-white/5 border border-white/5 opacity-50' : 'opacity-30'}`}>
                                <div className="flex items-center gap-4">
                                    <div className={`size-8 rounded-lg flex items-center justify-center font-black text-xs ${isCurrent ? 'bg-primary text-white' : 'bg-white/10 text-slate-400'}`}>{lvl}</div>
                                    <div className="flex flex-col"><span className={`text-sm font-bold ${isCurrent ? 'text-white' : 'text-slate-400'}`}>{getLevelTitle(lvl)}</span><span className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">{isCurrent ? 'Current Level' : lvl > level ? 'Locked' : 'Achieved'}</span></div>
                                </div>
                                <span className="font-mono text-xs text-slate-500 font-bold">{xpRequired.toLocaleString()} XP</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
      )}

      <style>{`
        @keyframes zoomIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-zoom-in { animation: zoomIn 0.35s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes slideInItem { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
      `}</style>
    </div>
  );
};

export default ProgressScreen;
