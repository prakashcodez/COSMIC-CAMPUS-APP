
export interface Transaction {
  id: string;
  amount: number;
  description: string;
  date: string;
}

export type BudgetPeriod = 'daily' | 'weekly' | 'monthly';

export interface BudgetState {
  period: BudgetPeriod;
  transactions: Transaction[];
  lastReset: string; // ISO String
}

export interface FocusState {
  status: 'idle' | 'focus' | 'break' | 'completed';
  duration: number; // target duration in minutes
  timeLeft: number; // current seconds left
  isPaused: boolean;
  totalSessions: number;
}

export enum Category {
  WORK = 'Work',
  PERSONAL = 'Personal',
  HEALTH = 'Health',
  STUDY = 'Study',
  CLASS = 'Class',
  URGENT = 'Urgent',
}

export interface Task {
  id: string;
  title: string;
  date: string;
  category: Category;
  time: string;
  completed: boolean;
  priority: 'low' | 'med' | 'high';
  completedAt?: string;
}

export interface ClassSession {
  id: string;
  name: string;
  room: string;
  instructor: string;
  startTime: string;
  endTime: string;
  day: string;
  color?: string;
  type: 'LECTURE' | 'LAB' | 'WORKSHOP' | 'SEMINAR' | 'BREAK' | 'THEORY CUM LAB';
  notes?: string;
  noteFormat?: 'paragraph' | 'bullets';
}

export interface ExamSubject {
  id: string;
  subject: string;
  date: string; // ISO Date String YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  type: 'Theory' | 'Practical' | 'Laboratory' | 'Viva' | 'Project';
  session: 'FN' | 'AN' | 'Evening';
  location?: string;
  notes?: string;
}

export interface ExamSchedule {
  id: string;
  title: string; // e.g. "CAT 1", "Semester I"
  isConfirmed: boolean;
  subjects: ExamSubject[];
}

// Keeping Exam alias for backward compatibility in some components if needed, 
// but mostly we use ExamSubject now.
export type Exam = ExamSubject; 

export interface Milestone {
  id: string;
  name: string;
  requirement: string;
  icon: string;
  achieved: boolean;
  type: 'gold' | 'silver' | 'none';
}

export interface ActivityPoint {
  day: string;
  value: number;
  isToday?: boolean;
}

export interface UpcomingEvent {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  description: string;
  icon: string;
}

export interface UserProfile {
  name: string;
  college: string;
  department: string;
  year: string;
  gender: 'male' | 'female';
  joinedDate: string;
  xp: number;
  level: number;
  timetableImageUrl?: string;
}

export interface CampusChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  completedAt?: string;
}

export interface DailyRoutineItem {
  id: string;
  title: string;
  type: 'fixed' | 'custom';
  frequency: 'daily' | 'weekly' | 'monthly';
  completed: boolean;
  completedAt?: string;
  color?: string;
  targetDate?: string;
}

export interface ResourceLink {
  id: string;
  title: string;
  url: string;
  subject: string;
  createdAt: string;
}