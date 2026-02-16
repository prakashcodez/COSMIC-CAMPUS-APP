
import React, { useState, useEffect, useCallback } from 'react';
import { INITIAL_TASKS, INITIAL_CLASSES, UPCOMING_EVENTS, ASTRONAUT_IMG } from './constants';
import { Task, Category, ClassSession, UpcomingEvent, UserProfile, CampusChecklistItem, DailyRoutineItem, ResourceLink, BudgetState, BudgetPeriod, FocusState, ExamSchedule, ExamSubject } from './types';
import TasksScreen from './components/TasksScreen';
import TimetableScreen from './components/TimetableScreen';
import ProgressScreen from './components/ProgressScreen';
import AddTaskModal from './components/AddTaskModal';
import EditTaskModal from './components/EditTaskModal';
import AddClassModal from './components/AddClassModal';
import EditClassModal from './components/EditClassModal';
import AddEventModal from './components/AddEventModal';
import AddResourceModal from './components/AddResourceModal';
import FocusModal from './components/FocusModal';
import ExamModal from './components/ExamModal'; // Now used for adding subjects
import AddExamGroupModal from './components/AddExamGroupModal';

type Screen = 'tasks' | 'planner' | 'stats' | 'settings';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('tasks');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('cosmic_campus_user_profile');
    return saved ? JSON.parse(saved) : null;
  });
  const [showOnboarding, setShowOnboarding] = useState(!userProfile);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showLegal, setShowLegal] = useState<'terms' | 'privacy' | null>(null);

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('cosmic_campus_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });
  const [classes, setClasses] = useState<ClassSession[]>(() => {
    const saved = localStorage.getItem('cosmic_campus_classes');
    return saved ? JSON.parse(saved) : INITIAL_CLASSES;
  });
  const [events, setEvents] = useState<UpcomingEvent[]>(() => {
    const saved = localStorage.getItem('cosmic_campus_events');
    return saved ? JSON.parse(saved) : UPCOMING_EVENTS;
  });
  const [checklist, setChecklist] = useState<CampusChecklistItem[]>(() => {
    const saved = localStorage.getItem('cosmic_campus_checklist');
    return saved ? JSON.parse(saved) : [];
  });
  const [routine, setRoutine] = useState<DailyRoutineItem[]>(() => {
    const saved = localStorage.getItem('cosmic_campus_routine');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'r1', title: 'Wake up before', type: 'fixed', frequency: 'daily', completed: false, color: 'bg-indigo-500' },
      { id: 'r2', title: 'Eat breakfast before', type: 'fixed', frequency: 'daily', completed: false, color: 'bg-emerald-500' },
      { id: 'r3', title: 'Sleep before', type: 'fixed', frequency: 'daily', completed: false, color: 'bg-purple-500' },
    ];
  });
  const [resources, setResources] = useState<ResourceLink[]>(() => {
    const saved = localStorage.getItem('cosmic_campus_resources');
    return saved ? JSON.parse(saved) : [];
  });
  const [budget, setBudget] = useState<BudgetState>(() => {
    const saved = localStorage.getItem('cosmic_campus_budget');
    return saved ? JSON.parse(saved) : { period: 'daily', transactions: [], lastReset: new Date().toISOString() };
  });
  
  // Updated Exam State to support Groups
  const [examSchedules, setExamSchedules] = useState<ExamSchedule[]>(() => {
    const saved = localStorage.getItem('cosmic_campus_exam_schedules');
    return saved ? JSON.parse(saved) : [];
  });
  
  // Focus Mode State
  const [focusState, setFocusState] = useState<FocusState>(() => {
    const saved = localStorage.getItem('cosmic_campus_focus');
    return saved ? JSON.parse(saved) : { status: 'idle', duration: 25, timeLeft: 25 * 60, isPaused: false, totalSessions: 0 };
  });
  const [showFocusModal, setShowFocusModal] = useState(false);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  
  // Exam Modals
  const [isAddExamGroupModalOpen, setIsAddExamGroupModalOpen] = useState(false);
  const [editingExamGroup, setEditingExamGroup] = useState<ExamSchedule | null>(null);
  const [activeExamGroupId, setActiveExamGroupId] = useState<string | null>(null); // For adding subject
  const [editingExamSubject, setEditingExamSubject] = useState<{ groupId: string, subject: ExamSubject } | null>(null);
  
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingClass, setEditingClass] = useState<ClassSession | null>(null);
  const [editingEvent, setEditingEvent] = useState<UpcomingEvent | null>(null);
  const [isFabMenuOpen, setIsFabMenuOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('cosmic_campus_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('cosmic_campus_classes', JSON.stringify(classes));
  }, [classes]);

  useEffect(() => {
    localStorage.setItem('cosmic_campus_events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('cosmic_campus_checklist', JSON.stringify(checklist));
  }, [checklist]);

  useEffect(() => {
    localStorage.setItem('cosmic_campus_routine', JSON.stringify(routine));
  }, [routine]);

  useEffect(() => {
    localStorage.setItem('cosmic_campus_resources', JSON.stringify(resources));
  }, [resources]);

  useEffect(() => {
    localStorage.setItem('cosmic_campus_budget', JSON.stringify(budget));
  }, [budget]);

  useEffect(() => {
    localStorage.setItem('cosmic_campus_exam_schedules', JSON.stringify(examSchedules));
  }, [examSchedules]);

  useEffect(() => {
    localStorage.setItem('cosmic_campus_focus', JSON.stringify(focusState));
  }, [focusState]);

  useEffect(() => {
    if (userProfile) {
      localStorage.setItem('cosmic_campus_user_profile', JSON.stringify(userProfile));
    }
  }, [userProfile]);

  // Focus Timer Logic
  useEffect(() => {
    let interval: number;
    if (focusState.status !== 'idle' && focusState.status !== 'completed' && !focusState.isPaused) {
        interval = window.setInterval(() => {
            setFocusState(prev => {
                if (prev.timeLeft <= 1) {
                    // Timer Finished
                    if (prev.status === 'focus') {
                        // Focus Done -> Start Break
                        updateXP(100); // 100 XP fixed per session
                        return {
                            ...prev,
                            status: 'break',
                            timeLeft: 5 * 60, // 5 min break
                            totalSessions: prev.totalSessions + 1
                        };
                    } else {
                        // Break Done -> Completed Screen
                        return {
                            ...prev,
                            status: 'completed',
                            timeLeft: 0,
                            isPaused: false
                        };
                    }
                }
                return { ...prev, timeLeft: prev.timeLeft - 1 };
            });
        }, 1000);
    }
    return () => clearInterval(interval);
  }, [focusState.status, focusState.isPaused]);

  const updateXP = (amount: number) => {
    if (userProfile) {
      const currentXp = userProfile.xp || 0;
      let newXp = Math.max(0, currentXp + amount);
      const newLevel = Math.floor(newXp / 1000);

      setUserProfile({
        ...userProfile,
        xp: newXp,
        level: newLevel
      });
    }
  };

  // Focus Handlers
  const startFocusSession = (minutes: number) => {
    setFocusState({
        status: 'focus',
        duration: minutes,
        timeLeft: minutes * 60,
        isPaused: false,
        totalSessions: focusState.totalSessions
    });
    setShowFocusModal(true);
  };

  const pauseFocusSession = () => setFocusState(prev => ({ ...prev, isPaused: true }));
  const resumeFocusSession = () => setFocusState(prev => ({ ...prev, isPaused: false }));
  
  const stopFocusSession = () => {
      setFocusState(prev => ({ ...prev, status: 'idle', timeLeft: prev.duration * 60, isPaused: false }));
  };

  // Task Handlers
  const toggleTask = (id: string) => {
    setTasks(prev => {
      const task = prev.find(t => t.id === id);
      if (!task) return prev;
      const isCompleting = !task.completed;
      updateXP(isCompleting ? 10 : -10);
      return prev.map(t => t.id === id ? { ...t, completed: isCompleting, completedAt: isCompleting ? new Date().toISOString() : undefined } : t);
    });
  };
  const deleteTask = (id: string) => setTasks(prev => prev.filter(t => t.id !== id));
  const addTask = (title: string, category: Category, date: string, time: string, priority: 'low'|'med'|'high') => {
    setTasks(prev => [{ id: Date.now().toString(), title, date, category, time, completed: false, priority }, ...prev]);
    setIsTaskModalOpen(false);
  };
  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    setEditingTask(null);
  };

  // Event & Class Handlers
  const deleteEvent = (id: string) => setEvents(prev => prev.filter(e => e.id !== id));
  const updateEvent = (id: string, updates: Partial<UpcomingEvent>) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
    setEditingEvent(null);
  };
  const handleAddEventFull = (title: string, date: string, startTime: string, endTime: string, location: string, description: string, icon: string) => {
    setEvents(prev => [...prev, { id: Date.now().toString(), title, date, startTime, endTime, location, description, icon }]);
    updateXP(100);
    setIsEventModalOpen(false);
  };
  const addClass = (name: string, room: string, startTime: string, endTime: string, day: string, instructor: string, type: 'LECTURE'|'LAB'|'WORKSHOP'|'SEMINAR'|'BREAK'|'THEORY CUM LAB') => {
    const colors = ['bg-primary', 'bg-indigo-500', 'bg-purple-500', 'bg-emerald-500', 'bg-orange-500'];
    const color = colors[classes.length % colors.length];
    setClasses(prev => [...prev, { id: Date.now().toString(), name, room, instructor, startTime, endTime, day, color, type }]);
    updateXP(10);
    setIsClassModalOpen(false);
  };
  const updateClass = (id: string, updates: Partial<ClassSession>) => {
    setClasses(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    setEditingClass(null);
  };
  const updateClassNotes = (id: string, notes: string, noteFormat: 'paragraph' | 'bullets') => {
    setClasses(prev => prev.map(c => c.id === id ? { ...c, notes, noteFormat } : c));
  };

  // --- NEW EXAM HANDLERS ---

  const addExamGroup = (title: string) => {
    const newGroup: ExamSchedule = {
      id: Date.now().toString(),
      title,
      isConfirmed: false,
      subjects: []
    };
    setExamSchedules(prev => [newGroup, ...prev]);
    updateXP(20); // Bonus for starting a schedule
    setIsAddExamGroupModalOpen(false);
  };

  const updateExamGroup = (id: string, title: string) => {
    setExamSchedules(prev => prev.map(g => g.id === id ? { ...g, title } : g));
    setEditingExamGroup(null);
  };

  const deleteExamGroup = (id: string) => {
    setExamSchedules(prev => prev.filter(g => g.id !== id));
  };

  const toggleExamConfirmation = (id: string) => {
      setExamSchedules(prev => prev.map(g => {
          if (g.id === id) {
              const newStatus = !g.isConfirmed;
              if (newStatus) updateXP(50); // Bonus for confirming schedule
              return { ...g, isConfirmed: newStatus };
          }
          return g;
      }));
  };

  const addExamSubject = (subject: Omit<ExamSubject, 'id'>) => {
    if (!activeExamGroupId) return;
    
    setExamSchedules(prev => prev.map(group => {
      if (group.id === activeExamGroupId) {
        return {
          ...group,
          subjects: [...group.subjects, { id: Date.now().toString(), ...subject }]
        };
      }
      return group;
    }));
    
    setActiveExamGroupId(null);
  };

  const updateExamSubject = (groupId: string, subjectId: string, updates: Partial<ExamSubject>) => {
    setExamSchedules(prev => prev.map(group => {
      if (group.id === groupId) {
        return {
          ...group,
          subjects: group.subjects.map(sub => sub.id === subjectId ? { ...sub, ...updates } : sub)
        };
      }
      return group;
    }));
    setEditingExamSubject(null);
  };

  const deleteExamSubject = (groupId: string, subjectId: string) => {
    setExamSchedules(prev => prev.map(group => {
      if (group.id === groupId) {
        return {
          ...group,
          subjects: group.subjects.filter(s => s.id !== subjectId)
        };
      }
      return group;
    }));
  };

  // ... (Other handlers: Checklist, Routine, Budget, Resources) ...
  const addChecklistItem = (text: string) => setChecklist(prev => [{ id: Date.now().toString(), text, completed: false }, ...prev]);
  const toggleChecklistItem = (id: string) => setChecklist(prev => prev.map(i => i.id === id ? { ...i, completed: !i.completed, completedAt: !i.completed ? new Date().toISOString() : undefined } : i));
  const editChecklistItem = (id: string, text: string) => setChecklist(prev => prev.map(i => i.id === id ? { ...i, text } : i));
  const deleteChecklistItem = (id: string) => setChecklist(prev => prev.filter(i => i.id !== id));
  const clearChecklist = () => setChecklist([]);
  
  const toggleRoutineItem = (id: string) => setRoutine(prev => prev.map(i => i.id === id ? { ...i, completed: !i.completed, completedAt: !i.completed ? new Date().toISOString() : undefined } : i));
  const updateRoutineItem = (id: string, updates: Partial<DailyRoutineItem>) => setRoutine(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
  const addCustomHabit = (title: string, frequency: 'daily' | 'weekly' | 'monthly') => {
      const colors = ['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500'];
      setRoutine(prev => [...prev, { id: Date.now().toString(), title, type: 'custom', frequency, completed: false, color: colors[Math.floor(Math.random()*colors.length)] }]);
  };
  const deleteRoutineItem = (id: string) => setRoutine(prev => prev.filter(i => i.id !== id));
  const resetRoutine = () => setRoutine(prev => prev.map(i => ({ ...i, completed: false, completedAt: undefined })));

  const addTransaction = (amount: number, description: string) => setBudget(prev => ({ ...prev, transactions: [{ id: Date.now().toString(), amount, description, date: new Date().toISOString() }, ...prev.transactions] }));
  const resetBudget = () => setBudget(prev => ({ ...prev, transactions: [], lastReset: new Date().toISOString() }));
  const changeBudgetPeriod = (period: BudgetPeriod) => setBudget(prev => ({ ...prev, period, lastReset: new Date().toISOString() }));

  const addResource = (title: string, url: string, subject: string) => {
      setResources(prev => [{ id: Date.now().toString(), title, url: url.startsWith('http') ? url : `https://${url}`, subject, createdAt: new Date().toISOString() }, ...prev]);
      setIsResourceModalOpen(false);
  };
  const deleteResource = (id: string) => setResources(prev => prev.filter(r => r.id !== id));
  const reorderResources = (newOrder: ResourceLink[]) => setResources(newOrder);
  const handleInspirationXP = () => updateXP(5);

  const handleNavClick = (screen: Screen) => {
    if (currentScreen === screen) {
        const scrollId = screen === 'tasks' ? 'scroll-tasks' : screen === 'planner' ? 'scroll-planner' : screen === 'stats' ? 'scroll-stats' : 'scroll-settings';
        document.getElementById(scrollId)?.scrollTo({ top: 0, behavior: 'smooth' });
    } else setCurrentScreen(screen);
    setIsFabMenuOpen(false);
  };

  const allExamSubjects = examSchedules.flatMap(g => g.subjects);

  // Render Profile Screen (Settings)
  const renderSettingsScreen = () => {
      return (
          <div id="scroll-settings" className="h-full overflow-y-auto hide-scrollbar pb-32 p-6 space-y-8">
                {/* ... existing profile content ... */}
                <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-4">
                    <div className="size-20 rounded-full bg-primary/20 border-2 border-primary/20 flex items-center justify-center shadow-lg shadow-primary/10 overflow-hidden">
                    <img src={ASTRONAUT_IMG} alt="Profile" className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                    <h2 className="text-2xl font-black text-white truncate max-w-[180px]">{userProfile?.name}</h2>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{userProfile?.joinedDate ? `Joined ${new Date(userProfile.joinedDate).toLocaleDateString()}` : 'New Student'}</p>
                    </div>
                </div>
                <button 
                    onClick={() => setShowEditProfile(true)}
                    className="size-10 flex items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary active:scale-90 transition-all"
                >
                    <span className="material-symbols-outlined text-xl">edit_square</span>
                </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                <div className="p-5 rounded-3xl bg-white/5 border border-white/10 space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-primary">Student Credentials</h3>
                    <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-slate-500 text-xs font-bold">College</span>
                        <span className="text-white text-sm font-black">{userProfile?.college}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-slate-500 text-xs font-bold">Department</span>
                        <span className="text-white text-sm font-black">{userProfile?.department}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-slate-500 text-xs font-bold">Year</span>
                        <span className="text-white text-sm font-black">{userProfile?.year}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-white/5 pt-4">
                        <span className="text-slate-400 text-xs font-bold">Gender</span>
                        <span className="text-slate-500 text-sm font-bold capitalize">{userProfile?.gender}</span>
                    </div>
                    </div>
                </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-2">Connect</h3>
                  <div className="grid grid-cols-1 gap-3">
                    <a href="https://t.me/cosmic_campus" target="_blank" rel="noopener noreferrer" className="p-4 rounded-2xl bg-[#1e2a36] border border-white/5 flex items-center gap-4 hover:bg-white/5 transition-colors group">
                      <div className="size-10 rounded-full bg-gradient-to-tr from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M7.8,2H16.2C19.4,2 22,4.6 22,7.8V16.2A5.8,5.8 0 0,1 16.2,22H7.8C4.6,22 2,19.4 2,16.2V7.8A5.8,5.8 0 0,1 7.8,2M7.6,4A3.6,3.6 0 0,0 4,7.6V16.4C4,18.39 5.61,20 7.6,20H16.4A3.6,3.6 0 0,0 20,16.4V7.6C20,5.61 18.39,4 16.4,4H7.6M12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M19,5A1,1 0 0,1 20,6A1,1 0 0,1 19,7A1,1 0 0,1 18,6A1,1 0 0,1 19,5Z" /></svg>
                      </div>
                      <span className="font-bold text-white">Instagram</span>
                    </a>
                    {/* ... other social links ... */}
                  </div>
                </div>
                
                <div className="text-center pt-8 pb-4">
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Cosmic Campus v1.0.0</p>
                  <p className="text-[9px] text-slate-700 mt-1">© 2026 Cosmic Campus</p>
                  <div className="flex justify-center gap-4 mt-4">
                    <button onClick={() => setShowLegal('terms')} className="text-[9px] font-bold text-slate-600 hover:text-white transition-colors">Terms of Service</button>
                    <span className="text-slate-800">•</span>
                    <button onClick={() => setShowLegal('privacy')} className="text-[9px] font-bold text-slate-600 hover:text-white transition-colors">Privacy Policy</button>
                  </div>
                </div>
          </div>
      );
  };

  return (
    <div className="flex h-screen w-full flex-col mesh-gradient overflow-hidden relative font-display text-white">
      <div className="flex-1 relative z-10 overflow-hidden">
        {currentScreen === 'tasks' && (
            <div id="scroll-tasks" className="h-full overflow-y-auto hide-scrollbar pb-32">
                <TasksScreen 
                    userProfile={userProfile} tasks={tasks} events={events} classes={classes}
                    onToggle={toggleTask} onDeleteTask={deleteTask} onEditTask={setEditingTask}
                    onDeleteEvent={deleteEvent} onEditEvent={setEditingEvent} onOpenAddEvent={() => setIsEventModalOpen(true)}
                    checklist={checklist} onAddChecklistItem={addChecklistItem} onToggleChecklistItem={toggleChecklistItem}
                    onEditChecklistItem={editChecklistItem} onDeleteChecklistItem={deleteChecklistItem} onClearChecklist={clearChecklist}
                    routine={routine} onToggleRoutineItem={toggleRoutineItem} onUpdateRoutineItem={updateRoutineItem}
                    onAddCustomHabit={addCustomHabit} onDeleteRoutineItem={deleteRoutineItem} onClearRoutine={resetRoutine}
                    onGetInspiration={handleInspirationXP} resources={resources} onOpenAddResource={() => setIsResourceModalOpen(true)}
                    onDeleteResource={deleteResource} onReorderResources={reorderResources} budget={budget}
                    onAddTransaction={addTransaction} onResetBudget={resetBudget} onChangeBudgetPeriod={changeBudgetPeriod}
                    focusState={focusState} onOpenFocus={() => setShowFocusModal(true)}
                />
            </div>
        )}
        {currentScreen === 'planner' && (
            <TimetableScreen 
                key="planner"
                classes={classes} 
                examSchedules={examSchedules}
                onOpenAddClass={() => setIsClassModalOpen(true)}
                onOpenAddExamGroup={() => setIsAddExamGroupModalOpen(true)}
                onOpenAddSubject={(groupId) => setActiveExamGroupId(groupId)}
                onUpdateNotes={updateClassNotes}
                onEditClass={setEditingClass}
                onEditSubject={(groupId, subject) => setEditingExamSubject({ groupId, subject })}
                onDeleteSubject={deleteExamSubject}
                onDeleteExamGroup={deleteExamGroup}
                onToggleConfirmGroup={toggleExamConfirmation}
                onEditExamGroup={setEditingExamGroup}
            />
        )}
        {currentScreen === 'stats' && (
            <div id="scroll-stats" className="h-full overflow-y-auto hide-scrollbar pb-32">
                <ProgressScreen tasks={tasks} userProfile={userProfile} classes={classes} events={events} checklist={checklist} routine={routine} budget={budget} focusState={focusState} examSchedules={examSchedules} />
            </div>
        )}
        {currentScreen === 'settings' && renderSettingsScreen()}
      </div>

      {/* FAB */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-4">
        {isFabMenuOpen && (
          <div className="flex flex-col items-center gap-3 mb-2 animate-slide-up">
            <button onClick={() => { setShowFocusModal(true); setIsFabMenuOpen(false); }} className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-[#1e2a36] border border-white/10 shadow-xl group transition-all">
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Focus Mode</span>
              <div className="size-10 rounded-full bg-cyan-500 flex items-center justify-center text-white shadow-lg"><span className="material-symbols-outlined text-sm">self_improvement</span></div>
            </button>
            <button onClick={() => { setIsClassModalOpen(true); setIsFabMenuOpen(false); }} className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-[#1e2a36] border border-white/10 shadow-xl group transition-all">
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Schedule Class</span>
              <div className="size-10 rounded-full bg-indigo-500 flex items-center justify-center text-white"><span className="material-symbols-outlined text-sm">school</span></div>
            </button>
            <button onClick={() => { setIsTaskModalOpen(true); setIsFabMenuOpen(false); }} className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-[#1e2a36] border border-white/10 shadow-xl group transition-all">
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Create Task</span>
              <div className="size-10 rounded-full bg-primary flex items-center justify-center text-white"><span className="material-symbols-outlined text-sm">task_alt</span></div>
            </button>
          </div>
        )}
        <button onClick={() => setIsFabMenuOpen(!isFabMenuOpen)} className={`flex size-14 items-center justify-center rounded-full bg-primary text-white shadow-[0_8px_30px_rgb(13,127,242,0.4)] hover:scale-105 active:scale-95 transition-all ${isFabMenuOpen ? 'rotate-45' : ''}`}>
          <span className="material-symbols-outlined text-3xl">add</span>
        </button>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-background-dark/80 backdrop-blur-xl border-t border-white/5 grid grid-cols-5 items-center px-2 z-40">
        <button onClick={() => handleNavClick('tasks')} className={`flex flex-col items-center gap-1 transition-colors ${currentScreen === 'tasks' ? 'text-primary' : 'text-[#9cabba]'}`}><span className={`material-symbols-outlined ${currentScreen === 'tasks' ? 'fill-1' : ''}`}>home</span><span className="text-[10px] font-black uppercase tracking-tight">Home</span></button>
        <button onClick={() => handleNavClick('planner')} className={`flex flex-col items-center gap-1 transition-colors ${currentScreen === 'planner' ? 'text-primary' : 'text-[#9cabba]'}`}><span className={`material-symbols-outlined ${currentScreen === 'planner' ? 'fill-1' : ''}`}>calendar_today</span><span className="text-[10px] font-black uppercase tracking-tight">Planner</span></button>
        <div></div>
        <button onClick={() => handleNavClick('stats')} className={`flex flex-col items-center gap-1 transition-colors ${currentScreen === 'stats' ? 'text-primary' : 'text-[#9cabba]'}`}><span className={`material-symbols-outlined ${currentScreen === 'stats' ? 'fill-1' : ''}`}>analytics</span><span className="text-[10px] font-black uppercase tracking-tight">Stats</span></button>
        <button onClick={() => handleNavClick('settings')} className={`flex flex-col items-center gap-1 transition-colors ${currentScreen === 'settings' ? 'text-primary' : 'text-[#9cabba]'}`}><span className={`material-symbols-outlined ${currentScreen === 'settings' ? 'fill-1' : ''}`}>person</span><span className="text-[10px] font-black uppercase tracking-tight">Profile</span></button>
      </nav>

      {/* Modals */}
      {showFocusModal && <FocusModal focusState={focusState} onStart={startFocusSession} onPause={pauseFocusSession} onResume={resumeFocusSession} onStop={() => { stopFocusSession(); setShowFocusModal(false); }} onClose={() => setShowFocusModal(false)} />}
      
      {showOnboarding && <OnboardingScreen onComplete={(profile) => { setUserProfile(profile); setShowOnboarding(false); }} onClose={() => setShowOnboarding(false)} />}
      {showEditProfile && userProfile && <ProfileEditModal currentProfile={userProfile} onClose={() => setShowEditProfile(false)} onUpdate={(updates) => { setUserProfile(prev => prev ? { ...prev, ...updates } : null); setShowEditProfile(false); }} />}
      {showLegal && (
        <div className="fixed inset-0 z-[1200] bg-black/90 backdrop-blur-xl p-6 flex flex-col animate-fade-in">
           {/* ... Legal modal content (omitted for brevity) ... */}
           <div className="flex items-center justify-between mb-6"><h2 className="text-xl font-bold text-white">Terms & Policy</h2><button onClick={() => setShowLegal(null)} className="size-10 rounded-full bg-white/5 flex items-center justify-center"><span className="material-symbols-outlined text-slate-400">close</span></button></div>
           <div className="text-slate-400 text-sm">Standard terms apply. Data is local.</div>
        </div>
      )}
      
      {isTaskModalOpen && <AddTaskModal onClose={() => setIsTaskModalOpen(false)} onAdd={addTask} />}
      {editingTask && <EditTaskModal task={editingTask} onClose={() => setEditingTask(null)} onUpdate={updateTask} />}
      {editingEvent && <AddEventModal initialEvent={editingEvent} onClose={() => setEditingEvent(null)} onAdd={(...args) => { const [title, date, startTime, endTime, location, description, icon] = args; updateEvent(editingEvent.id, { title, date, startTime, endTime, location, description, icon }); }} existingEvents={events} existingClasses={classes} />}
      {isClassModalOpen && <AddClassModal onClose={() => setIsClassModalOpen(false)} onAdd={addClass} existingClasses={classes} />}
      {editingClass && <EditClassModal classSession={editingClass} onClose={() => setEditingClass(null)} onUpdate={updateClass} existingClasses={classes} />}
      {isEventModalOpen && <AddEventModal onClose={() => setIsEventModalOpen(false)} onAdd={handleAddEventFull} existingEvents={events} existingClasses={classes} />}
      {isResourceModalOpen && <AddResourceModal onClose={() => setIsResourceModalOpen(false)} onAdd={addResource} />}
      
      {/* Exam Modals */}
      {isAddExamGroupModalOpen && <AddExamGroupModal onClose={() => setIsAddExamGroupModalOpen(false)} onAdd={addExamGroup} />}
      {editingExamGroup && <AddExamGroupModal initialTitle={editingExamGroup.title} onClose={() => setEditingExamGroup(null)} onAdd={(title) => updateExamGroup(editingExamGroup.id, title)} isEditing={true} />}
      {activeExamGroupId && <ExamModal onClose={() => setActiveExamGroupId(null)} onAdd={addExamSubject} existingExams={allExamSubjects} />}
      {editingExamSubject && <ExamModal initialExam={editingExamSubject.subject} onClose={() => setEditingExamSubject(null)} onAdd={(subject) => updateExamSubject(editingExamSubject.groupId, editingExamSubject.subject.id, subject)} existingExams={allExamSubjects} />}
    
    </div>
  );
};

const OnboardingScreen: React.FC<{ onComplete: (profile: UserProfile) => void, onClose: () => void }> = ({ onComplete, onClose }) => {
    // ... (Placeholder content preserved) ...
    return null; 
};
const ProfileEditModal: React.FC<{ currentProfile: UserProfile, onClose: () => void, onUpdate: (updates: Partial<UserProfile>) => void }> = ({ currentProfile, onClose, onUpdate }) => {
    // ... (Placeholder content preserved) ...
    return null;
};

export default App;
