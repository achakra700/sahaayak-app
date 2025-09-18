import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Language, Theme, User, MoodLog, JournalEntry, EmergencyContact, Streak, Badge, Persona, ChatMessage, StreakType, ChatFontSize, JourneyProgress, CirclePost, CircleComment, Intention, EmergencyLog, AIPersonalization, DashboardLayout, QuietHours } from '../types';
import { moderateContent } from '../services/geminiService';
import { badgeDetails, wellnessJourneys } from '../constants';
import { db } from '../services/database';
import { usePersistedState } from '../hooks/usePersistedState';

interface AppContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  chatFontSize: ChatFontSize;
  setChatFontSize: (size: ChatFontSize) => void;
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  moodLogs: MoodLog[];
  addMoodLog: (moodLog: Omit<MoodLog, 'id'>) => void;
  journalEntries: JournalEntry[];
  addJournalEntry: (entry: JournalEntry) => void;
  emergencyContacts: EmergencyContact[];
  addEmergencyContact: (contact: Omit<EmergencyContact, 'id'>) => void;
  updateEmergencyContact: (contact: EmergencyContact) => void;
  deleteEmergencyContact: (id: string) => void;
  emergencyLogs: EmergencyLog[];
  logEmergencyAction: (action: 'helpline_tap') => void;
  streaks: Streak[];
  updateJournalingStreak: () => void;
  updateMoodTrackingStreak: () => void;
  badges: Badge[];
  selectedPersona: Persona;
  setPersona: (persona: Persona) => void;
  dynamicPersonaEnabled: boolean;
  setDynamicPersonaEnabled: (enabled: boolean) => void;
  chatMessages: ChatMessage[];
  addChatMessage: (message: ChatMessage) => void;
  setChatMessages: (messages: ChatMessage[]) => void;
  triggerHapticFeedback: (type: 'light' | 'medium' | 'success') => void;
  moodReminderEnabled: boolean;
  journalPromptReminderEnabled: boolean;
  setMoodReminderEnabled: (enabled: boolean) => Promise<void>;
  setJournalPromptReminderEnabled: (enabled: boolean) => Promise<void>;
  journeyProgress: Record<string, JourneyProgress>;
  startJourney: (journeyId: string) => void;
  completeJourneyTask: (journeyId: string, day: number, taskId: string) => void;
  isJourneyCompleted: (journeyId: string) => boolean;
  advanceJourneyDay: (journeyId: string) => void;
  posts: CirclePost[];
  addPost: (post: Omit<CirclePost, 'id' | 'authorId' | 'authorName' | 'timestamp' | 'likes'>) => Promise<{ success: boolean; message: string; }>;
  togglePostLike: (postId: string) => void;
  comments: CircleComment[];
  addComment: (comment: Omit<CircleComment, 'id' | 'authorId' | 'authorName' | 'timestamp' | 'likes'>) => Promise<{ success: boolean; message: string; }>;
  toggleCommentLike: (commentId: string) => void;
  intentions: Intention[];
  addIntention: (intention: Omit<Intention, 'id' | 'completedDates'>) => void;
  deleteIntention: (intentionId: string) => void;
  completeIntention: (intentionId: string) => void;
  aiPersonalization: AIPersonalization | null;
  dashboardLayout: DashboardLayout;
  setDashboardLayout: (layout: DashboardLayout) => void;
  quietHours: QuietHours;
  setQuietHours: (hours: QuietHours) => void;
  exportUserData: () => void;
  clearAllUserData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const daysBetween = (dateStr1: string, dateStr2: string): number => {
    const d1 = new Date(dateStr1);
    const d2 = new Date(dateStr2);
    d1.setHours(0, 0, 0, 0);
    d2.setHours(0, 0, 0, 0);
    return Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();

  // --- UI State (managed with usePersistedState hook) ---
  const [theme, setTheme] = usePersistedState<Theme>('sahaayak_theme', 'light');
  const [chatFontSize, setChatFontSize] = usePersistedState<ChatFontSize>('sahaayak_chatFontSize', 'base');
  const [selectedPersona, setPersona] = usePersistedState<Persona>('sahaayak_persona', 'empathetic');
  const [dynamicPersonaEnabled, setDynamicPersonaEnabled] = usePersistedState<boolean>('sahaayak_dynamicPersona', true);
  const [moodReminderEnabled, setMoodReminderEnabledState] = usePersistedState<boolean>('sahaayak_moodReminder', false);
  const [journalPromptReminderEnabled, setJournalPromptReminderEnabledState] = usePersistedState<boolean>('sahaayak_journalPromptReminder', false);
  const [dashboardLayout, setDashboardLayout] = usePersistedState<DashboardLayout>('sahaayak_dashboardLayout', ['mind', 'growth', 'inspiration']);
  const [quietHours, setQuietHours] = usePersistedState<QuietHours>('sahaayak_quietHours', { start: '22:00', end: '08:00', enabled: false });

  // Language is special, it needs to sync with i18n
  const [language, setLanguageState] = useState<Language>(() => (i18n.language as Language) || 'en');

  // --- Application Data State (Managed via `db` service, user session via hook) ---
  const [user, setUser] = usePersistedState<User | null>('sahaayak_user', null);
  const [moodLogs, setMoodLogs] = useState<MoodLog[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [emergencyLogs, setEmergencyLogs] = useState<EmergencyLog[]>([]);
  const [streaks, setStreaks] = useState<Streak[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [journeyProgress, setJourneyProgress] = useState<Record<string, JourneyProgress>>({});
  const [posts, setPosts] = useState<CirclePost[]>([]);
  const [comments, setComments] = useState<CircleComment[]>([]);
  const [intentions, setIntentions] = useState<Intention[]>([]);
  const [aiPersonalization, setAIPersonalization] = useState<AIPersonalization | null>(null);
  const [chatMessages, setChatMessagesInternal] = useState<ChatMessage[]>([]);
  const [anonymousUsername, setAnonymousUsername] = useState<string>('');
  
  const userId = useMemo(() => user?.uid, [user]);

  // --- Load all user data from DB on login ---
  useEffect(() => {
    // FIX: Refactored data loading to be async and await promises before setting state.
    const loadUserData = async (currentUserId: string) => {
      setMoodLogs(await db.getMoodLogs(currentUserId));
      setJournalEntries(await db.getJournalEntries(currentUserId));
      setChatMessagesInternal(await db.getChatMessages(currentUserId));
      setEmergencyContacts(await db.getEmergencyContacts(currentUserId));
      setEmergencyLogs(await db.getEmergencyLogs(currentUserId));
      setStreaks(await db.getStreaks(currentUserId));
      setBadges(await db.getBadges(currentUserId));
      setJourneyProgress(await db.getJourneyProgress(currentUserId));
      setIntentions(await db.getIntentions(currentUserId));
      setAIPersonalization(await db.getAIPersonalization(currentUserId));
    };

    if (user && userId) {
      loadUserData(userId);
    } else {
      // Clear data on logout
      setMoodLogs([]);
      setJournalEntries([]);
      setChatMessagesInternal([]);
      setEmergencyContacts([]);
      setEmergencyLogs([]);
      setStreaks([]);
      setBadges([]);
      setJourneyProgress({});
      setIntentions([]);
      setAIPersonalization(null);
    }
    
    // FIX: Load public data asynchronously as well.
    const loadPublicData = async () => {
      setPosts(await db.getPosts());
      setComments(await db.getComments());
    };
    // Community data is public
    loadPublicData();
  }, [user, userId]);
  
  // Sync language changes with i18next
  useEffect(() => {
    const handleLanguageChange = (lng: string) => setLanguageState(lng as Language);
    i18n.on('languageChanged', handleLanguageChange);
    return () => i18n.off('languageChanged', handleLanguageChange);
  }, [i18n]);

  const setLanguage = useCallback((lang: Language) => i18n.changeLanguage(lang), [i18n]);

  useEffect(() => {
    let anonName = sessionStorage.getItem('sahaayak_anon_username');
    if (!anonName) {
        const adjectives = ['Kind', 'Brave', 'Wise', 'Calm', 'Happy', 'Gentle', 'Strong', 'Curious', 'Creative', 'Hopeful'];
        const nouns = ['Panda', 'Lotus', 'River', 'Star', 'Mountain', 'Sparrow', 'Tiger', 'Phoenix', 'Voyager', 'Dreamer'];
        anonName = `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]}`;
        sessionStorage.setItem('sahaayak_anon_username', anonName);
    }
    setAnonymousUsername(anonName);
  }, []);

  const triggerHapticFeedback = useCallback((type: 'light' | 'medium' | 'success') => {
    if (typeof window !== 'undefined' && 'vibrate' in window.navigator) {
        if (type === 'light') window.navigator.vibrate(50);
        else if (type === 'medium') window.navigator.vibrate(100);
        else if (type === 'success') window.navigator.vibrate([100, 50, 100]);
    }
  }, []);

  const createNotificationSetter = useCallback((setter: React.Dispatch<React.SetStateAction<boolean>>) => async (enabled: boolean) => {
    if (enabled && Notification.permission !== 'granted') {
        const permission = await Notification.requestPermission();
        setter(permission === 'granted');
    } else {
        setter(enabled);
    }
  }, []);

  const setMoodReminderEnabled = useMemo(() => createNotificationSetter(setMoodReminderEnabledState), [createNotificationSetter]);
  const setJournalPromptReminderEnabled = useMemo(() => createNotificationSetter(setJournalPromptReminderEnabledState), [createNotificationSetter]);
  
  const login = useCallback((userData: User) => {
    setUser(userData);
  }, [setUser]);

  const logout = useCallback(() => {
    if (userId) db.clearUserData(userId);
    setUser(null);
  }, [userId, setUser]);
  
  const addBadge = useCallback((badgeId: string) => {
    if (!userId) return;
    const badgeInfo = badgeDetails[badgeId];
    if (!badgeInfo) return;

    setBadges(prev => {
        if (prev.some(b => b.id === badgeId)) return prev;
        const newBadge: Badge = { id: badgeId, icon: badgeInfo.icon, dateEarned: new Date().toISOString() };
        const updatedBadges = [...prev, newBadge];
        db.saveBadges(userId, updatedBadges);
        return updatedBadges;
    });
  }, [userId]);

  const updateStreak = useCallback((type: StreakType) => {
    if (!userId) return;
    const today = new Date().toISOString().split('T')[0];
    
    setStreaks(prev => {
        const relevantStreak = prev.find(s => s.type === type);
        let newStreakCount = 1;
        let updatedStreak: Streak;

        if (!relevantStreak) {
            updatedStreak = { type, count: 1, lastDate: today };
            if(type === 'journaling') addBadge('first_journal');
            if(type === 'mood_tracking') addBadge('first_mood');
        } else {
            const diff = daysBetween(relevantStreak.lastDate, today);
            if (diff === 1) newStreakCount = relevantStreak.count + 1;
            else if (diff > 1) newStreakCount = 1;
            else return prev; // No change
            updatedStreak = { ...relevantStreak, count: newStreakCount, lastDate: today };
        }

        if (type === 'journaling') {
            if (newStreakCount === 3) addBadge('journal_3_day');
            if (newStreakCount === 7) addBadge('journal_7_day');
        } else if (type === 'mood_tracking') {
            if (newStreakCount === 3) addBadge('mood_3_day');
            if (newStreakCount === 7) addBadge('mood_7_day');
        }
        
        const otherStreaks = prev.filter(s => s.type !== type);
        const updatedStreaks = [...otherStreaks, updatedStreak];
        db.saveStreaks(userId, updatedStreaks);
        return updatedStreaks;
    });
  }, [userId, addBadge]);

  const updateJournalingStreak = useCallback(() => updateStreak('journaling'), [updateStreak]);
  const updateMoodTrackingStreak = useCallback(() => updateStreak('mood_tracking'), [updateStreak]);
  
  const addMoodLog = useCallback((moodLog: Omit<MoodLog, 'id'>) => {
    if (!userId) return;
    setMoodLogs(prev => {
        const otherLogs = prev.filter(log => !(log.date === moodLog.date && log.source === moodLog.source));
        const newLogWithId = { ...moodLog, id: Date.now().toString() };
        const updatedLogs = [...otherLogs, newLogWithId];
        // FIX: Called correct db method 'saveMoodLogs'
        db.saveMoodLogs(userId, updatedLogs);
        return updatedLogs;
    });
    updateMoodTrackingStreak();
  }, [userId, updateMoodTrackingStreak]);

  const addJournalEntry = useCallback((entry: JournalEntry) => {
    if (!userId) return;
    setJournalEntries(prev => {
        const updatedEntries = [entry, ...prev];
        // FIX: Called correct db method 'saveJournalEntries'
        db.saveJournalEntries(userId, updatedEntries);
        return updatedEntries;
    });
    updateJournalingStreak();
    const today = new Date(entry.date).toISOString().split('T')[0];
    addMoodLog({ date: today, mood: entry.mood, source: 'journal', activities: [], people: [] });
  }, [userId, updateJournalingStreak, addMoodLog]);

  const setChatMessages = useCallback((messages: ChatMessage[]) => {
    if (!userId) return;
    db.saveChatMessages(userId, messages);
    setChatMessagesInternal(messages);
  }, [userId]);

  const addChatMessage = useCallback((message: ChatMessage) => {
    if (!userId) return;
    setChatMessagesInternal(prev => {
        const updatedMessages = [...prev, message];
        db.saveChatMessages(userId, updatedMessages);
        return updatedMessages;
    });
  }, [userId]);
  
  const addEmergencyContact = useCallback((contact: Omit<EmergencyContact, 'id'>) => {
    if (!userId) return;
    setEmergencyContacts(prev => {
        const newContact = { ...contact, id: Date.now().toString() };
        const updatedContacts = [...prev, newContact];
        // FIX: Called correct db method 'saveEmergencyContacts'
        db.saveEmergencyContacts(userId, updatedContacts);
        return updatedContacts;
    });
  }, [userId]);
  
  const updateEmergencyContact = useCallback((contact: EmergencyContact) => {
    if (!userId) return;
    setEmergencyContacts(prev => {
        const updatedContacts = prev.map(c => c.id === contact.id ? contact : c);
        // FIX: Called correct db method 'saveEmergencyContacts'
        db.saveEmergencyContacts(userId, updatedContacts);
        return updatedContacts;
    });
  }, [userId]);

  const deleteEmergencyContact = useCallback((id: string) => {
    if (!userId) return;
    setEmergencyContacts(prev => {
        const updatedContacts = prev.filter(c => c.id !== id);
        // FIX: Called correct db method 'saveEmergencyContacts'
        db.saveEmergencyContacts(userId, updatedContacts);
        return updatedContacts;
    });
  }, [userId]);

  const logEmergencyAction = useCallback((action: 'helpline_tap') => {
    if (!userId) return;
    const newLog: EmergencyLog = {
        id: Date.now().toString(),
        action,
        timestamp: new Date().toISOString()
    };
    setEmergencyLogs(prev => {
        const updatedLogs = [...prev, newLog];
        // FIX: Called correct db method 'saveEmergencyLogs'
        db.saveEmergencyLogs(userId, updatedLogs);
        return updatedLogs;
    });
  }, [userId]);

  const startJourney = useCallback((journeyId: string) => {
    if (!userId) return;
    setJourneyProgress(prev => {
        if (prev[journeyId]) return prev;
        const newProgress = { ...prev, [journeyId]: { currentDay: 1, completedTasksByDay: {} } };
        // FIX: Passed correct arguments to saveJourneyProgress
        db.saveJourneyProgress(userId, journeyId, newProgress[journeyId]);
        return newProgress;
    });
    triggerHapticFeedback('medium');
  }, [userId, triggerHapticFeedback]);

  const completeJourneyTask = useCallback((journeyId: string, day: number, taskId: string) => {
    if (!userId) return;
    setJourneyProgress(prev => {
        const currentJourney = prev[journeyId];
        if (!currentJourney) return prev;
        const dayTasks = currentJourney.completedTasksByDay[day] || [];
        if (dayTasks.includes(taskId)) return prev;
        const newProgress = { ...prev, [journeyId]: { ...currentJourney, completedTasksByDay: { ...currentJourney.completedTasksByDay, [day]: [...dayTasks, taskId] } } };
        // FIX: Passed correct arguments to saveJourneyProgress
        db.saveJourneyProgress(userId, journeyId, newProgress[journeyId]);
        return newProgress;
    });
    triggerHapticFeedback('light');
  }, [userId, triggerHapticFeedback]);
  
  const isJourneyCompleted = useCallback((journeyId: string) => {
    const journey = wellnessJourneys.find(j => j.id === journeyId);
    const progress = journeyProgress[journeyId];
    if (!journey || !progress) return false;
    
    // A journey is complete if the user has advanced past the final day.
    if (progress.currentDay > journey.days.length) return true;

    // Or if they are on the final day and have completed all tasks for that day.
    const lastDay = journey.days[journey.days.length - 1];
    if (progress.currentDay === lastDay.day) {
        const lastDayTasks = progress.completedTasksByDay[lastDay.day] || [];
        return lastDay.tasks.every(task => lastDayTasks.includes(task.id));
    }

    return false;
}, [journeyProgress]);

  const advanceJourneyDay = useCallback((journeyId: string) => {
    if (!userId) return;
    setJourneyProgress(prev => {
        const currentJourneyProgress = prev[journeyId];
        if (!currentJourneyProgress) return prev;
        const journey = wellnessJourneys.find(j => j.id === journeyId);
        if (journey && currentJourneyProgress.currentDay === journey.days.length) {
            addBadge(`${journeyId}_complete`);
        }
        const newProgress = { ...prev, [journeyId]: { ...currentJourneyProgress, currentDay: currentJourneyProgress.currentDay + 1 } };
        // FIX: Passed correct arguments to saveJourneyProgress
        db.saveJourneyProgress(userId, journeyId, newProgress[journeyId]);
        return newProgress;
    });
    triggerHapticFeedback('success');
  }, [userId, addBadge, triggerHapticFeedback]);
  
  const addPost = useCallback(async (post: Omit<CirclePost, 'id' | 'authorId' | 'authorName' | 'timestamp' | 'likes'>): Promise<{ success: boolean; message: string; }> => {
    const moderationResult = await moderateContent(`${post.title} ${post.content}`);
    if (!moderationResult.isSafe) return { success: false, message: moderationResult.reason || 'Content is not allowed.' };

    const newPost: CirclePost = { ...post, id: Date.now().toString(), authorId: userId || 'anonymous', authorName: anonymousUsername, timestamp: new Date().toISOString(), likes: [] };
    setPosts(prev => {
        const updatedPosts = [newPost, ...prev];
        // FIX: Called correct db method 'savePosts'
        db.savePosts(updatedPosts);
        return updatedPosts;
    });
    return { success: true, message: 'Post added successfully.' };
  }, [userId, anonymousUsername]);

  const togglePostLike = useCallback((postId: string) => {
    if (!userId) return;
    setPosts(prevPosts => {
        const updatedPosts = prevPosts.map(p => {
            if (p.id === postId) {
                const newLikes = p.likes.includes(userId)
                    ? p.likes.filter(id => id !== userId)
                    : [...p.likes, userId];
                return { ...p, likes: newLikes };
            }
            return p;
        });
        // FIX: Called correct db method 'savePosts'
        db.savePosts(updatedPosts);
        return updatedPosts;
    });
  }, [userId]);

  const addComment = useCallback(async (comment: Omit<CircleComment, 'id' | 'authorId' | 'authorName' | 'timestamp' | 'likes'>): Promise<{ success: boolean; message: string; }> => {
    const moderationResult = await moderateContent(comment.content);
    if (!moderationResult.isSafe) return { success: false, message: moderationResult.reason || 'Content is not allowed.' };

    const newComment: CircleComment = { ...comment, id: Date.now().toString(), authorId: userId || 'anonymous', authorName: anonymousUsername, timestamp: new Date().toISOString(), likes: [] };
    setComments(prev => {
        const updatedComments = [...prev, newComment];
        // FIX: Called correct db method 'saveComments'
        db.saveComments(updatedComments);
        return updatedComments;
    });
    return { success: true, message: 'Comment added successfully.' };
  }, [userId, anonymousUsername]);

  const toggleCommentLike = useCallback((commentId: string) => {
    if (!userId) return;
    setComments(prevComments => {
        const updatedComments = prevComments.map(c => {
            if (c.id === commentId) {
                const newLikes = c.likes.includes(userId)
                    ? c.likes.filter(id => id !== userId)
                    : [...c.likes, userId];
                return { ...c, likes: newLikes };
            }
            return c;
        });
        // FIX: Called correct db method 'saveComments'
        db.saveComments(updatedComments);
        return updatedComments;
    });
  }, [userId]);

  const addIntention = useCallback((intention: Omit<Intention, 'id' | 'completedDates'>) => {
    if (!userId) return;
    const newIntention: Intention = { ...intention, id: Date.now().toString(), completedDates: [] };
    setIntentions(prev => {
        const updatedIntentions = [...prev, newIntention];
        // FIX: Called correct db method 'saveIntentions'
        db.saveIntentions(userId, updatedIntentions);
        return updatedIntentions;
    });
  }, [userId]);

  const deleteIntention = useCallback((intentionId: string) => {
    if (!userId) return;
    setIntentions(prev => {
        const updatedIntentions = prev.filter(i => i.id !== intentionId);
        // FIX: Called correct db method 'saveIntentions'
        db.saveIntentions(userId, updatedIntentions);
        return updatedIntentions;
    });
  }, [userId]);

  const completeIntention = useCallback((intentionId: string) => {
    if (!userId) return;
    const today = new Date().toISOString().split('T')[0];
    setIntentions(prev => {
        const updatedIntentions = prev.map(intention => {
            if (intention.id === intentionId && !intention.completedDates.includes(today)) {
                return { ...intention, completedDates: [...intention.completedDates, today] };
            }
            return intention;
        });
        // FIX: Called correct db method 'saveIntentions'
        db.saveIntentions(userId, updatedIntentions);
        return updatedIntentions;
    });
  }, [userId]);
  
  const exportUserData = useCallback(() => {
    if (!userId) return;
    const dataToExport = {
        user,
        moodLogs,
        journalEntries,
        chatMessages,
        emergencyContacts,
        streaks,
        badges,
        journeyProgress,
        intentions,
        settings: {
            theme,
            language,
            chatFontSize,
            selectedPersona,
            dynamicPersonaEnabled,
            moodReminderEnabled,
            journalPromptReminderEnabled,
            quietHours,
            dashboardLayout
        }
    };
    const jsonString = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sahaayak-data.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [user, moodLogs, journalEntries, chatMessages, emergencyContacts, streaks, badges, journeyProgress, intentions, theme, language, chatFontSize, selectedPersona, dynamicPersonaEnabled, moodReminderEnabled, journalPromptReminderEnabled, quietHours, dashboardLayout, userId]);
  
  const clearAllUserData = useCallback(() => {
    if (!userId) return;
    db.clearUserData(userId);
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sahaayak_')) {
            localStorage.removeItem(key);
        }
    });
    sessionStorage.removeItem('sahaayak_anon_username');
    logout();
    window.location.reload();
  }, [userId, logout]);

  const isAuthenticated = !!user;

  const contextValue: AppContextType = {
    language, setLanguage, theme, setTheme, chatFontSize, setChatFontSize,
    user, isAuthenticated, login, logout,
    moodLogs, addMoodLog,
    journalEntries, addJournalEntry,
    emergencyContacts, addEmergencyContact, updateEmergencyContact, deleteEmergencyContact,
    emergencyLogs, logEmergencyAction,
    streaks, updateJournalingStreak, updateMoodTrackingStreak, badges,
    selectedPersona, setPersona, dynamicPersonaEnabled, setDynamicPersonaEnabled,
    chatMessages, addChatMessage, setChatMessages,
    triggerHapticFeedback,
    moodReminderEnabled, setMoodReminderEnabled,
    journalPromptReminderEnabled, setJournalPromptReminderEnabled,
    journeyProgress, startJourney, completeJourneyTask, isJourneyCompleted, advanceJourneyDay,
    posts, addPost, togglePostLike,
    comments, addComment, toggleCommentLike,
    intentions, addIntention, deleteIntention, completeIntention,
    aiPersonalization,
    dashboardLayout, setDashboardLayout,
    quietHours, setQuietHours,
    exportUserData, clearAllUserData,
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};