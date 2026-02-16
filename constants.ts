
import { Task, Category, ClassSession, Milestone, ActivityPoint, UpcomingEvent } from './types';

export const INITIAL_TASKS: Task[] = [];

export const UPCOMING_EVENTS: UpcomingEvent[] = [];

// Default Profile Picture
export const ASTRONAUT_IMG = "https://yt3.ggpht.com/yti/ANjgQV_PFcHmUSrw2rmFNxs5mVXuj9BvMDrnEZtDYnnwI-2Y0Q=s108-c-k-c0x00ffffff-no-rj";

export const INITIAL_CLASSES: ClassSession[] = [];

export const MILESTONES: Milestone[] = [
  { id: 'm1', name: 'Elite Achiever', requirement: '100 Tasks Done', icon: 'emoji_events', achieved: true, type: 'gold' },
  { id: 'm2', name: 'Dawn Patrol', requirement: '5 Tasks before 8 AM', icon: 'wb_sunny', achieved: true, type: 'silver' },
  { id: 'm3', name: 'Iron Will', requirement: '30 Day Streak', icon: 'rocket_launch', achieved: false, type: 'none' },
  { id: 'm4', name: 'Grand Architect', requirement: '7 Days Scheduled', icon: 'hotel_class', achieved: true, type: 'gold' },
];

export const WEEKLY_ACTIVITY: ActivityPoint[] = [
  { day: 'Mon', value: 60 },
  { day: 'Tue', value: 85 },
  { day: 'Wed', value: 45 },
  { day: 'Thu', value: 100, isToday: true },
  { day: 'Fri', value: 75 },
  { day: 'Sat', value: 20 },
  { day: 'Sun', value: 35 },
];
