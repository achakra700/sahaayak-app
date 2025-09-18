export type Language = 'en' | 'hi' | 'bn';
export type Theme = 'light' | 'dark' | 'warm' | 'cool';
export type Persona = 'empathetic' | 'coach' | 'calm' | 'mindful' | 'energetic';
export type ChatFontSize = 'sm' | 'base' | 'lg';

export interface User {
  uid: string;
  name: string;
  email: string | null;
  avatar?: string;
  isAnonymous?: boolean;
  age?: number;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
}

export type Mood = '😔' | '😐' | '🙂' | '😃' | '😍';

export interface MoodLog {
    id: string;
    date: string; // YYYY-MM-DD
    mood: Mood;
    activities: string[]; // activity keys e.g. 'exercise', 'work'
    people: string[]; // people keys e.g. 'family', 'friends'
    note?: string;
    source: 'check-in' | 'journal';
}

export interface JournalEntry {
    id: string;
    date: string; // ISO String
    prompt: string;
    content: string;
    mood: Mood;
}

export interface ChatMessage {
    id:string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: string;
    quickReplies?: string[];
    persona?: Persona;
}

export interface EmergencyContact {
    id: string;
    name: string;
    phone: string;
    relationship?: string;
}

export interface EmergencyLog {
    id: string;
    action: 'helpline_tap';
    timestamp: string; // ISO String
}

export interface AIPersonalization {
    id: string;
    summary_data: {
        most_common_mood?: Mood;
        last_interaction_topic?: string;
        wellness_tips_shown?: string[];
    };
    updated_at: string; // ISO String
}


export interface AIAnalysis {
    insight: string;
    crisisLevel: 'none' | 'low' | 'high';
}

export interface ProactiveSuggestion {
    suggestion: string;
    actionText?: string;
    actionLink?: string;
}

export type StreakType = 'journaling' | 'mood_tracking';

export interface Streak {
    type: StreakType;
    count: number;
    lastDate: string; // YYYY-MM-DD
}

export interface Badge {
    id: string; // e.g. 'journal_3_day', used for translation keys
    icon: string;
    dateEarned: string;
}

export interface Quote {
    text: string;
    author: string;
}

export type WellnessTaskType = 'read' | 'exercise' | 'journal';

export interface WellnessTask {
    id: string;
    type: WellnessTaskType;
    titleKey: string;
    contentKey: string; // for 'read' type content, or 'exercise' type link, or 'journal' type prompt
}

export interface WellnessDay {
    day: number;
    titleKey:string;
    tasks: WellnessTask[];
}

export interface WellnessJourney {
    id: string;
    titleKey: string;
    descriptionKey: string;
    icon: string;
    days: WellnessDay[];
}

export interface JourneyProgress {
    currentDay: number;
    // e.g. { 1: ['task1_id', 'task2_id'], 2: ['task3_id'] }
    completedTasksByDay: { [day: number]: string[] };
}

export interface CommunityCircle {
    id: string;
    titleKey: string;
    descriptionKey: string;
    icon: string;
}

export interface CirclePost {
    id: string;
    circleId: string;
    authorId: string;
    authorName: string; 
    title: string;
    content: string;
    timestamp: string; // ISO String
    likes: string[]; // Array of userIds
}

export interface CircleComment {
    id: string;
    postId: string;
    authorId: string;
    authorName: string;
    content: string;
    timestamp: string; // ISO String
    likes: string[]; // Array of userIds
}

export type IntentionFrequency = 'daily' | 'weekly';

export interface Intention {
    id: string;
    title: string;
    frequency: IntentionFrequency;
    target: number; // e.g., 3 times a week, or 1 for daily
    completedDates: string[]; // array of YYYY-MM-DD strings
}

export type DashboardLayout = ('mind' | 'growth' | 'inspiration')[];

export interface QuietHours {
    start: string; // "HH:MM"
    end: string;   // "HH:MM"
    enabled: boolean;
}