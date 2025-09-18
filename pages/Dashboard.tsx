import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../context/AppContext';
import { Mood, AIAnalysis, Quote, Language, Streak, StreakType, Intention, ProactiveSuggestion } from '../types';
import { moodOptions, motivationalQuotes, selfCareIdeas, languageOptions, wellnessFactKeys, moodContextActivities, moodContextPeople, wellnessJourneys, badgeDetails } from '../constants';
import { getAIAnalysis, getDailyJournalPrompt, getProactiveSuggestion } from '../services/geminiService';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';
import Confetti from '../components/ui/Confetti';
import QuickActionsWidget from '../components/dashboard/QuickActions';

// ====================================================================================
// Reusable Widget Card Component
// ====================================================================================
interface WidgetCardProps {
    title: string;
    children: React.ReactNode;
    isCollapsed: boolean;
    onToggle: () => void;
    className?: string;
}

const WidgetCard: React.FC<WidgetCardProps> = ({ title, children, isCollapsed, onToggle, className = '' }) => (
    <div className={`bg-[var(--bg-surface)] rounded-2xl shadow-lg transition-all duration-300 ${className}`}>
        <div className="flex justify-between items-center p-4 cursor-pointer" onClick={onToggle}>
            <h3 className="font-bold text-lg text-[var(--text-primary)]">{title}</h3>
            <button className="text-[var(--text-secondary)] transform transition-transform" style={{ transform: isCollapsed ? 'rotate(0deg)' : 'rotate(180deg)' }}>
                ▲
            </button>
        </div>
        {!isCollapsed && (
            <div className="p-4 pt-0">
                {children}
            </div>
        )}
    </div>
);

// ====================================================================================
// Dashboard Header Component
// ====================================================================================
const DashboardHeader: React.FC = () => {
    const { user, language, setLanguage } = useAppContext();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const userName = user?.name === 'Guest' || !user?.name ? '' : user.name;

    return (
        <header className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">
                    {t('dashboard_greeting', { nickname: userName })}
                </h1>
                <p className="text-[var(--text-secondary)]">{t('dashboard_welcome_back')}</p>
            </div>
            <div className="flex items-center space-x-4">
                 <div className="relative">
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value as Language)}
                        className="bg-[var(--bg-muted)] text-[var(--text-primary)] font-semibold py-2 pl-3 pr-8 rounded-full appearance-none"
                    >
                        {Object.entries(languageOptions).map(([code, { name, icon }]) => (
                            <option key={code} value={code}>{icon} {name}</option>
                        ))}
                    </select>
                </div>
                <Link to="/settings" className="w-10 h-10 bg-[var(--bg-muted)] rounded-full flex items-center justify-center font-bold text-[var(--text-secondary)]">
                    {user?.avatar || (userName ? userName.charAt(0).toUpperCase() : 'G')}
                </Link>
                <button 
                    onClick={() => navigate('/emergency')} 
                    className="bg-[var(--danger-secondary)] hover:bg-[var(--danger-primary)] text-white rounded-full p-3 shadow-lg"
                    aria-label={t('emergency_panic_button_label')}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                </button>
            </div>
        </header>
    );
};

// ====================================================================================
// Left Column ("Mind") Widgets
// ====================================================================================
const MoodCheckinWidget: React.FC = () => {
    const { addMoodLog, user, triggerHapticFeedback } = useAppContext();
    const { t } = useTranslation();
    const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
    const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
    const [selectedPeople, setSelectedPeople] = useState<string[]>([]);
    const [note, setNote] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleToggleSelection = (id: string, list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>) => {
        triggerHapticFeedback('light');
        if (list.includes(id)) {
            setList(list.filter(item => item !== id));
        } else {
            setList([...list, id]);
        }
    };

    const handleSaveMood = () => {
        if (!selectedMood) return;
        if (user?.isAnonymous) {
            alert(t('streak_anonymous'));
            return;
        }
        const today = new Date().toISOString().split('T')[0];
        addMoodLog({ 
            date: today, 
            mood: selectedMood,
            activities: selectedActivities,
            people: selectedPeople,
            note: note,
            source: 'check-in' 
        });
        triggerHapticFeedback('medium');
        setSubmitted(true);
        setTimeout(() => {
            setSubmitted(false);
            setSelectedMood(null);
            setSelectedActivities([]);
            setSelectedPeople([]);
            setNote('');
        }, 2000);
    };

    return (
        <div className="text-center">
            <h4 className="font-semibold text-[var(--text-primary)] mb-4">
                {submitted ? t('widget_mood_check_thanks') : t('widget_mood_check_prompt')}
            </h4>
            <div className="flex justify-center space-x-2 sm:space-x-4 mb-4">
                {moodOptions.map(mood => (
                    <button 
                        key={mood} 
                        onClick={() => {
                            setSelectedMood(mood);
                            triggerHapticFeedback('light');
                        }} 
                        className={`text-4xl p-2 rounded-full transition-transform transform hover:scale-125 ${selectedMood === mood ? 'bg-blue-200 dark:bg-blue-800 scale-125' : ''}`}
                    >
                        {mood}
                    </button>
                ))}
            </div>
            
            {selectedMood && !submitted && (
                 <div className="animate-fade-in mt-6 text-left space-y-4">
                     <div>
                         <label className="font-semibold text-[var(--text-secondary)]">{t('widget_mood_context_activities')}</label>
                         <div className="flex flex-wrap gap-2 mt-2">
                             {moodContextActivities.map(activity => (
                                 <button key={activity.id} onClick={() => handleToggleSelection(activity.id, selectedActivities, setSelectedActivities)} className={`px-3 py-1.5 text-sm rounded-full flex items-center gap-2 border-2 transition ${selectedActivities.includes(activity.id) ? 'bg-[var(--accent-primary)] text-[var(--text-on-accent)] border-[var(--accent-primary)]' : 'bg-[var(--bg-muted)] border-transparent hover:bg-[var(--bg-surface-hover)]'}`}>
                                     {activity.icon} {t(activity.key)}
                                 </button>
                             ))}
                         </div>
                     </div>
                      <div>
                         <label className="font-semibold text-[var(--text-secondary)]">{t('widget_mood_context_people')}</label>
                         <div className="flex flex-wrap gap-2 mt-2">
                             {moodContextPeople.map(person => (
                                 <button key={person.id} onClick={() => handleToggleSelection(person.id, selectedPeople, setSelectedPeople)} className={`px-3 py-1.5 text-sm rounded-full flex items-center gap-2 border-2 transition ${selectedPeople.includes(person.id) ? 'bg-[var(--accent-primary)] text-[var(--text-on-accent)] border-[var(--accent-primary)]' : 'bg-[var(--bg-muted)] border-transparent hover:bg-[var(--bg-surface-hover)]'}`}>
                                     {person.icon} {t(person.key)}
                                 </button>
                             ))}
                         </div>
                     </div>
                     <div>
                          <textarea 
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            rows={2}
                            className="w-full p-2 bg-[var(--bg-subtle)] rounded-lg border border-[var(--border-primary)] focus:ring-2 focus:ring-[var(--accent-primary)] focus:outline-none"
                            placeholder={t('widget_mood_context_note_placeholder')}
                        />
                     </div>
                     <button 
                        onClick={handleSaveMood}
                        className="w-full bg-[var(--accent-primary)] text-[var(--text-on-accent)] font-bold py-3 px-6 rounded-lg shadow-md hover:bg-[var(--accent-primary-hover)] transition"
                     >
                        {t('widget_mood_save_button')}
                     </button>
                 </div>
            )}
        </div>
    );
};

const AIInsightWidget: React.FC = () => {
    const { journalEntries, moodLogs } = useAppContext();
    const { t } = useTranslation();
    const [insight, setInsight] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchInsight = async () => {
            if (journalEntries.length > 0 || moodLogs.length > 0) {
                const analysis = await getAIAnalysis(journalEntries, moodLogs);
                setInsight(analysis?.insight || t('widget_ai_insight_default'));
            } else {
                setInsight(t('widget_ai_insight_default'));
            }
            setIsLoading(false);
        };
        fetchInsight();
    }, [journalEntries, moodLogs, t]);

    return (
        <div className="text-[var(--text-secondary)]">
            {isLoading ? <p>{t('widget_ai_insight_loading')}</p> : <p>{insight}</p>}
        </div>
    );
};

const CopingToolkitWidget: React.FC = () => {
    const { t } = useTranslation();
    return(
        <div className="space-y-3">
            <Link to="/exercises" className="block text-[var(--text-accent)] font-semibold hover:underline">{t('coping_toolkit_breathing')}</Link>
            <Link to="/intentions" className="block text-[var(--text-accent)] font-semibold hover:underline">{t('coping_toolkit_intentions')}</Link>
            <Link to="/journeys" className="block text-[var(--text-accent)] font-semibold hover:underline">{t('coping_toolkit_journeys')}</Link>
            <Link to="/journal" className="block text-[var(--text-accent)] font-semibold hover:underline">{t('coping_toolkit_journal')}</Link>
            <Link to="/circles" className="block text-[var(--text-accent)] font-semibold hover:underline">{t('coping_toolkit_community')}</Link>
        </div>
    );
};

// ====================================================================================
// Center Column ("Growth") Widgets
// ====================================================================================
const ProactiveSuggestionWidget: React.FC = () => {
    const { t } = useTranslation();
    const { moodLogs, journalEntries, journeyProgress } = useAppContext();
    const [suggestion, setSuggestion] = useState<ProactiveSuggestion | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);
    
    useEffect(() => {
        const fetchSuggestion = async () => {
            if (moodLogs.length === 0 && journalEntries.length === 0 && Object.keys(journeyProgress).length === 0) {
                setIsLoading(false);
                return;
            }

            try {
                const result = await getProactiveSuggestion(moodLogs, journalEntries, journeyProgress);
                setSuggestion(result);
            } catch (err) {
                console.error(err);
                setError(true);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSuggestion();
    }, []);

    if (isLoading) {
        return <div className="text-center p-4 text-[var(--text-secondary)]">{t('widget_proactive_loading')}</div>;
    }

    const suggestionToShow = suggestion || (error ? {
        suggestion: t('widget_proactive_error'),
        actionText: t('self_care_get_idea'),
        actionLink: '/exercises'
    } : null);

    if (!suggestionToShow) {
        return <div className="text-center p-4 text-[var(--text-secondary)]">{t('widget_proactive_no_data')}</div>;
    }

    return (
        <div className="p-4 bg-gradient-to-br from-purple-100 to-indigo-200 dark:from-purple-900/50 dark:to-indigo-900/50 rounded-2xl text-center shadow-lg">
            <p className="font-semibold text-purple-800 dark:text-purple-200 mb-4">{suggestionToShow.suggestion}</p>
            {suggestionToShow.actionText && suggestionToShow.actionLink && (
                <Link to={suggestionToShow.actionLink} className="bg-[var(--accent-primary)] text-[var(--text-on-accent)] font-bold py-2 px-5 rounded-full text-sm hover:bg-[var(--accent-primary-hover)] transition">
                    {suggestionToShow.actionText} &rarr;
                </Link>
            )}
        </div>
    );
};

const WellnessJourneysWidget: React.FC = () => {
    const { t } = useTranslation();
    const { journeyProgress } = useAppContext();
    const navigate = useNavigate();

    // Find the first active journey to show progress
    const activeJourneyId = Object.keys(journeyProgress)[0];
    const activeJourney = activeJourneyId ? wellnessJourneys.find(j => j.id === activeJourneyId) : null;
    const progress = activeJourneyId ? journeyProgress[activeJourneyId] : null;

    return (
        <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl text-white text-center cursor-pointer shadow-lg hover:shadow-xl transition-shadow" onClick={() => navigate('/journeys')}>
            <h4 className="font-bold text-lg mb-2">{t('widget_journeys_title')}</h4>
            {activeJourney && progress ? (
                <div>
                    <p className="text-sm font-semibold">{t(activeJourney.titleKey)}</p>
                    <p className="text-xs opacity-80">{t('widget_journeys_progress', { day: progress.currentDay, total: activeJourney.days.length })}</p>
                </div>
            ) : (
                <p className="text-sm">{t('widget_journeys_prompt')}</p>
            )}
            <span className="block mt-2 font-bold text-sm">{t('widget_journeys_cta')} &rarr;</span>
        </div>
    );
};

const CommunityCirclesWidget: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <div className="p-4 bg-gradient-to-br from-green-400 to-cyan-500 rounded-2xl text-white text-center cursor-pointer shadow-lg hover:shadow-xl transition-shadow" onClick={() => navigate('/circles')}>
            <h4 className="font-bold text-lg mb-2">{t('widget_community_title')}</h4>
            <p className="text-sm">{t('widget_community_prompt')}</p>
            <span className="block mt-2 font-bold text-sm">{t('widget_community_cta')} &rarr;</span>
        </div>
    );
};

const IntentionsWidget: React.FC = () => {
    const { t } = useTranslation();
    const { intentions, completeIntention, triggerHapticFeedback, user } = useAppContext();
    const navigate = useNavigate();

    if (user?.isAnonymous) {
        return null; // Don't show for guests
    }

    const today = new Date().toISOString().split('T')[0];
    const todayIntentions = intentions.filter(i => {
        if (i.frequency === 'daily') return true;
        // Basic weekly check, more complex logic could be used for specific week starts
        if (i.frequency === 'weekly') {
            const completedThisWeek = i.completedDates.filter(d => {
                const date = new Date(d);
                const todayDate = new Date(today);
                const weekStart = new Date(todayDate.setDate(todayDate.getDate() - todayDate.getDay()));
                return date >= weekStart;
            }).length;
            return completedThisWeek < i.target;
        }
        return false;
    });

    const handleComplete = (id: string) => {
        completeIntention(id);
        triggerHapticFeedback('light');
    };

    return (
        <div>
            {todayIntentions.map(intention => {
                const isCompletedToday = intention.completedDates.includes(today);
                return (
                    <div key={intention.id} className={`flex items-center justify-between p-3 rounded-lg mb-2 ${isCompletedToday ? 'bg-green-100 dark:bg-green-900/40' : 'bg-[var(--bg-muted)]'}`}>
                        <p className={`font-semibold ${isCompletedToday ? 'text-green-800 dark:text-green-200 line-through' : 'text-[var(--text-primary)]'}`}>{intention.title}</p>
                        <button 
                            onClick={() => handleComplete(intention.id)} 
                            disabled={isCompletedToday}
                            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition ${isCompletedToday ? 'bg-green-500 border-green-600 text-white' : 'border-[var(--border-primary)] hover:bg-green-200'}`}
                            aria-label={`Complete ${intention.title}`}
                        >
                            {isCompletedToday ? '✓' : ''}
                        </button>
                    </div>
                );
            })}
            {intentions.length === 0 && (
                <p className="text-sm text-center text-[var(--text-secondary)]">{t('intentions_widget_empty')}</p>
            )}
            <Link to="/intentions" className="text-center block mt-3 text-[var(--text-accent)] font-semibold text-sm">{t('intentions_widget_manage')}</Link>
        </div>
    );
};

const JournalPromptWidget: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPrompt = async () => {
            setIsLoading(true);
            const dailyPrompt = await getDailyJournalPrompt();
            setPrompt(dailyPrompt);
            setIsLoading(false);
        };
        fetchPrompt();
    }, []);

    return (
        <div className="text-center">
            {isLoading ? (
                <p className="text-[var(--text-secondary)]">{t('widget_journal_prompt_loading')}</p>
            ) : (
                <p className="italic text-[var(--text-primary)] mb-4">"{prompt}"</p>
            )}
            <button
                onClick={() => navigate('/journal')}
                disabled={isLoading}
                className="bg-[var(--accent-primary)] text-[var(--text-on-accent)] font-bold py-2 px-6 rounded-full shadow-md hover:bg-[var(--accent-primary-hover)] transition disabled:opacity-50"
            >
                {t('widget_journal_prompt_cta')}
            </button>
        </div>
    );
};

// ====================================================================================
// Right Column ("Inspiration") Widgets
// ====================================================================================
const QuoteWidget: React.FC = () => {
    const randomQuote = useMemo(() => motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)], []);

    return (
        <div>
            <p className="italic text-[var(--text-secondary)]">"{randomQuote.text}"</p>
            <p className="text-right font-semibold text-[var(--text-secondary)] mt-2">- {randomQuote.author}</p>
        </div>
    );
}

const DidYouKnowWidget: React.FC = () => {
    const { t } = useTranslation();
    const [fact, setFact] = useState<string>('');

    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        const storedFactKey = localStorage.getItem('dailyWellnessFactKey');
        const storedDate = localStorage.getItem('dailyWellnessFactDate');

        let factKeyToUse: string;

        if (storedFactKey && storedDate === today) {
            factKeyToUse = storedFactKey;
        } else {
            factKeyToUse = wellnessFactKeys[Math.floor(Math.random() * wellnessFactKeys.length)];
            localStorage.setItem('dailyWellnessFactKey', factKeyToUse);
            localStorage.setItem('dailyWellnessFactDate', today);
        }
        setFact(t(factKeyToUse));
    }, [t]);

    return (
        <div>
            <p className="italic text-[var(--text-secondary)]">"{fact}"</p>
        </div>
    );
};

const SelfCareIdeaWidget: React.FC = () => {
    const { t } = useTranslation();
    const [idea, setIdea] = useState<{ text: string; icon: string; } | null>(null);

    const getNewIdea = () => {
        const randomIndex = Math.floor(Math.random() * selfCareIdeas.length);
        setIdea(selfCareIdeas[randomIndex]);
    };

    return (
        <div className="text-center">
            {idea ? (
                <div className="p-4 bg-green-100 dark:bg-green-900/50 rounded-lg mb-4">
                    <span className="text-4xl">{idea.icon}</span>
                    <p className="font-semibold mt-2 text-green-800 dark:text-green-200">{idea.text}</p>
                </div>
            ) : (
                <p className="text-[var(--text-secondary)] mb-4">{t('self_care_prompt')}</p>
            )}
            <button
                onClick={getNewIdea}
                className="bg-green-500 text-white font-bold py-2 px-6 rounded-full shadow-md hover:bg-green-600 transition"
            >
                {idea ? t('self_care_another_one') : t('self_care_get_idea')}
            </button>
        </div>
    );
};

const streakStyles: Record<StreakType, { titleKey: string; icon: string; bgColor: string; textColor: string; subTextColor: string; }> = {
    journaling: {
        titleKey: 'streak_journaling_title',
        icon: '🔥',
        bgColor: 'bg-orange-100 dark:bg-orange-900/50',
        textColor: 'text-orange-600 dark:text-orange-300',
        subTextColor: 'text-orange-500 dark:text-orange-400'
    },
    mood_tracking: {
        titleKey: 'streak_mood_tracking_title',
        icon: '😊',
        bgColor: 'bg-blue-100 dark:bg-blue-900/50',
        textColor: 'text-blue-600 dark:text-blue-300',
        subTextColor: 'text-blue-500 dark:text-blue-400'
    }
};


const StreakDisplay: React.FC<{ streak: Streak | undefined, type: StreakType }> = ({ streak, type }) => {
    const { t } = useTranslation();
    const style = streakStyles[type];

    if (!streak || streak.count === 0) return null;

    return (
        <div className="flex flex-col items-center">
             <div className={`relative w-24 h-24 rounded-full flex items-center justify-center ${style.bgColor}`}>
                <span className="absolute -top-3 -right-3 text-4xl transform rotate-12">{style.icon}</span>
                <div className="text-center">
                    <p className={`text-4xl font-bold ${style.textColor}`}>{streak.count}</p>
                    <p className={`text-xs font-semibold ${style.subTextColor}`}>{t('streak_days_count', { count: streak.count })}</p>
                </div>
            </div>
            <p className="mt-3 font-semibold text-[var(--text-secondary)]">{t(style.titleKey)}</p>
        </div>
    );
}

const HabitStreaksWidget: React.FC = () => {
    const { streaks, badges, user } = useAppContext();
    const { t } = useTranslation();

    if (user?.isAnonymous) return <p className="text-[var(--text-secondary)] p-4">{t('streak_anonymous')}</p>;

    const journalingStreak = streaks.find(s => s.type === 'journaling');
    const moodStreak = streaks.find(s => s.type === 'mood_tracking');
    const hasStreaks = (journalingStreak && journalingStreak.count > 0) || (moodStreak && moodStreak.count > 0);

    return (
        <div className="space-y-6">
            <div className="flex justify-around items-start">
                {journalingStreak && <StreakDisplay streak={journalingStreak} type="journaling" />}
                {moodStreak && <StreakDisplay streak={moodStreak} type="mood_tracking" />}
            </div>
            
            {hasStreaks && (
                <p className="text-sm text-center text-[var(--text-secondary)]">{t('streak_encouragement')}</p>
            )}

            {!hasStreaks && badges.length === 0 && (
                <div className="text-center p-4">
                    <p className="font-semibold text-[var(--text-secondary)]">{t('streak_start_prompt')}</p>
                </div>
            )}
            
            {badges.length > 0 && (
                 <div>
                    <h5 className="font-semibold text-center mb-3 text-[var(--text-secondary)]">{t('your_badges_title')}</h5>
                    <div className="flex flex-wrap gap-4 justify-center">
                        {badges.map(badge => {
                            const details = badgeDetails[badge.id];
                            if (!details) return null;
                            return (
                                <div key={badge.id} className="flex flex-col items-center text-center w-20" title={t(details.descKey)}>
                                    <div className="text-4xl bg-[var(--bg-muted)] p-3 rounded-full">{badge.icon}</div>
                                    <p className="text-xs mt-2 font-semibold text-[var(--text-secondary)]">{t(details.nameKey)}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};


// ====================================================================================
// Bottom Analytics Strip Components
// ====================================================================================
const moodToValue: Record<Mood, number> = { '😔': 1, '😐': 2, '🙂': 3, '😃': 4, '😍': 5 };

const MoodSparkline: React.FC = () => {
    const { moodLogs, journalEntries } = useAppContext();

    const data = useMemo(() => {
        const today = new Date();
        const chartData = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateString = date.toISOString().split('T')[0];
            const logForDay = moodLogs.find(log => log.date === dateString);
            const journalForDay = journalEntries.find(entry => new Date(entry.date).toISOString().split('T')[0] === dateString);
            const moodValue = logForDay ? moodToValue[logForDay.mood] : (journalForDay ? moodToValue[journalForDay.mood] : null);
            chartData.push({ date: dateString, mood: moodValue });
        }
        return chartData;
    }, [moodLogs, journalEntries]);

    return (
        <div className="w-full h-20">
            <ResponsiveContainer>
                <LineChart data={data}>
                    <Tooltip 
                        contentStyle={{
                            backgroundColor: 'var(--bg-surface)',
                            border: '1px solid var(--border-primary)',
                            borderRadius: '8px',
                            color: 'var(--text-primary)'
                        }}
                        labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <Line type="monotone" dataKey="mood" stroke="var(--accent-primary)" strokeWidth={2} dot={false} connectNulls />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

// ====================================================================================
// Column Components for Dynamic Layout
// ====================================================================================

const MindColumn: React.FC<{ collapsed: Record<string, boolean>; onToggle: (id: string) => void; }> = ({ collapsed, onToggle }) => {
    const { t } = useTranslation();
    return (
        <div className="lg:col-span-1 space-y-6">
            <WidgetCard title={t('widget_mood_check_title')} isCollapsed={!!collapsed['mood']} onToggle={() => onToggle('mood')}>
                <MoodCheckinWidget />
            </WidgetCard>
            <WidgetCard title={t('widget_ai_insight_title')} isCollapsed={!!collapsed['insight']} onToggle={() => onToggle('insight')}>
                <AIInsightWidget />
            </WidgetCard>
            <WidgetCard title={t('widget_coping_toolkit_title')} isCollapsed={!!collapsed['toolkit']} onToggle={() => onToggle('toolkit')}>
                <CopingToolkitWidget />
            </WidgetCard>
        </div>
    );
};

const GrowthColumn: React.FC<{ collapsed: Record<string, boolean>; onToggle: (id: string) => void; }> = ({ collapsed, onToggle }) => {
    const { t } = useTranslation();
    return (
        <div className="lg:col-span-2 space-y-6">
            <WidgetCard title={t('widget_proactive_title')} isCollapsed={!!collapsed['proactive']} onToggle={() => onToggle('proactive')}>
                <ProactiveSuggestionWidget />
            </WidgetCard>
            <WidgetCard title={t('widget_quick_actions_title')} isCollapsed={!!collapsed['actions']} onToggle={() => onToggle('actions')}>
                <QuickActionsWidget />
            </WidgetCard>
            <WidgetCard title={t('widget_intentions_title')} isCollapsed={!!collapsed['intentions']} onToggle={() => onToggle('intentions')}>
                <IntentionsWidget />
            </WidgetCard>
            <WellnessJourneysWidget />
            <CommunityCirclesWidget />
            <WidgetCard title={t('widget_journal_prompt_title')} isCollapsed={!!collapsed['prompt']} onToggle={() => onToggle('prompt')}>
                <JournalPromptWidget />
            </WidgetCard>
        </div>
    );
};

const InspirationColumn: React.FC<{ collapsed: Record<string, boolean>; onToggle: (id: string) => void; }> = ({ collapsed, onToggle }) => {
    const { t } = useTranslation();
    return (
        <div className="lg:col-span-1 space-y-6">
            <WidgetCard title={t('widget_streak_title')} isCollapsed={!!collapsed['streaks']} onToggle={() => onToggle('streaks')}>
                <HabitStreaksWidget />
            </WidgetCard>
            <WidgetCard title={t('widget_quote_title')} isCollapsed={!!collapsed['quote']} onToggle={() => onToggle('quote')}>
                <QuoteWidget />
            </WidgetCard>
            <WidgetCard title={t('widget_did_you_know_title')} isCollapsed={!!collapsed['didyouknow']} onToggle={() => onToggle('didyouknow')}>
                <DidYouKnowWidget />
            </WidgetCard>
            <WidgetCard title={t('widget_self_care_title')} isCollapsed={!!collapsed['selfcare']} onToggle={() => onToggle('selfcare')}>
                <SelfCareIdeaWidget />
            </WidgetCard>
        </div>
    );
};


// ====================================================================================
// Main Dashboard Component
// ====================================================================================
const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { badges, triggerHapticFeedback, dashboardLayout } = useAppContext();
    const [collapsedWidgets, setCollapsedWidgets] = useState<Record<string, boolean>>({});
    const [showConfetti, setShowConfetti] = useState(false);
    const prevBadgeCount = useRef(badges.length);

    useEffect(() => {
        if (badges.length > prevBadgeCount.current) {
            setShowConfetti(true);
            triggerHapticFeedback('success');
            const timer = setTimeout(() => setShowConfetti(false), 4000);
            return () => clearTimeout(timer);
        }
        prevBadgeCount.current = badges.length;
    }, [badges, triggerHapticFeedback]);


    const toggleWidget = (widgetId: string) => {
        setCollapsedWidgets(prev => ({ ...prev, [widgetId]: !prev[widgetId] }));
    };

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key.toLowerCase() === 't') {
                navigate('/chat');
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [navigate]);
    
    const columnMap = {
        mind: <MindColumn key="mind" collapsed={collapsedWidgets} onToggle={toggleWidget} />,
        growth: <GrowthColumn key="growth" collapsed={collapsedWidgets} onToggle={toggleWidget} />,
        inspiration: <InspirationColumn key="inspiration" collapsed={collapsedWidgets} onToggle={toggleWidget} />,
    };

    return (
        <div className="space-y-8 relative">
            {showConfetti && <Confetti />}
            <DashboardHeader />
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {dashboardLayout.map(columnKey => columnMap[columnKey])}
            </div>

            <div className="bg-[var(--bg-surface)] rounded-2xl shadow-lg p-4 flex flex-col md:flex-row items-center gap-4">
                <div className="w-full md:w-1/2">
                    <h3 className="font-bold text-lg text-[var(--text-primary)] mb-2">{t('analytics_sparkline_title')}</h3>
                    <MoodSparkline />
                </div>
                <div className="w-full md:w/1-2">
                     <h3 className="font-bold text-lg text-[var(--text-primary)] mb-2">{t('analytics_summary_title')}</h3>
                     <AIInsightWidget />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;