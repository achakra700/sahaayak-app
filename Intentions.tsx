import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../context/AppContext';
import { getGoalSuggestions } from '../services/geminiService';
import { Intention, IntentionFrequency } from '../types';

const getWeekProgress = (intention: Intention) => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // Sunday - 0, Monday - 1, ...
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)); // Adjust to start on Monday
    startOfWeek.setHours(0, 0, 0, 0);

    const completedThisWeek = intention.completedDates.filter(d => new Date(d) >= startOfWeek).length;
    return completedThisWeek;
};

const IntentionItem: React.FC<{ intention: Intention }> = ({ intention }) => {
    const { t } = useTranslation();
    const { completeIntention, deleteIntention, triggerHapticFeedback } = useAppContext();
    const today = new Date().toISOString().split('T')[0];

    const isCompletedToday = intention.completedDates.includes(today);
    const progress = intention.frequency === 'daily' 
        ? (isCompletedToday ? 1 : 0) 
        : getWeekProgress(intention);

    const handleComplete = () => {
        completeIntention(intention.id);
        triggerHapticFeedback('medium');
    };

    return (
        <div className="bg-[var(--bg-surface)] p-4 rounded-xl shadow-md flex items-center justify-between gap-4">
            <div>
                <h3 className="font-bold text-lg">{intention.title}</h3>
                <p className="text-sm text-[var(--text-secondary)]">
                    {t('intentions_progress_of', { progress, target: intention.target, frequency: t(`frequency_${intention.frequency}`) })}
                </p>
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={handleComplete}
                    disabled={isCompletedToday && intention.frequency === 'daily'}
                    className={`px-4 py-2 font-semibold rounded-lg text-sm transition ${isCompletedToday ? 'bg-green-500 text-white' : 'bg-[var(--accent-primary)] text-[var(--text-on-accent)] hover:bg-[var(--accent-primary-hover)]'}`}
                >
                    {isCompletedToday ? t('intentions_completed_today') : t('intentions_mark_as_done_button')}
                </button>
                <button onClick={() => deleteIntention(intention.id)} className="text-[var(--text-secondary)] hover:text-[var(--danger-primary)] p-2">
                    ✕
                </button>
            </div>
        </div>
    );
};

const Intentions: React.FC = () => {
    const { t } = useTranslation();
    const { intentions, addIntention } = useAppContext();
    
    // State for AI suggestions
    const [vagueGoal, setVagueGoal] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

    // State for new intention form
    const [title, setTitle] = useState('');
    const [frequency, setFrequency] = useState<IntentionFrequency>('daily');
    const [target, setTarget] = useState<number>(1);

    const handleGetSuggestions = async () => {
        if (!vagueGoal.trim()) return;
        setIsLoadingSuggestions(true);
        const result = await getGoalSuggestions(vagueGoal);
        setSuggestions(result);
        setIsLoadingSuggestions(false);
    };

    const handleAddIntention = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;
        addIntention({ title, frequency, target });
        setTitle('');
        setFrequency('daily');
        setTarget(1);
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">{t('intentions_page_title')}</h1>
                <p className="text-lg text-[var(--text-secondary)] mt-1">{t('intentions_page_subtitle')}</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 items-start">
                <div className="bg-[var(--bg-surface)] p-6 rounded-2xl shadow-lg space-y-6">
                    <div>
                        <h2 className="text-xl font-bold mb-2">{t('intentions_get_ai_suggestions_title')}</h2>
                        <p className="text-sm text-[var(--text-secondary)] mb-4">{t('intentions_get_ai_suggestions_desc')}</p>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={vagueGoal}
                                onChange={(e) => setVagueGoal(e.target.value)}
                                placeholder={t('intentions_vague_goal_placeholder')}
                                className="flex-grow p-3 bg-[var(--bg-muted)] rounded-lg border border-[var(--border-primary)]"
                            />
                            <button onClick={handleGetSuggestions} disabled={isLoadingSuggestions} className="bg-[var(--accent-primary)] text-[var(--text-on-accent)] font-bold px-5 rounded-lg hover:bg-[var(--accent-primary-hover)] disabled:opacity-50">
                                {isLoadingSuggestions ? '...' : t('intentions_get_suggestions_button')}
                            </button>
                        </div>
                    </div>
                    {suggestions.length > 0 && (
                        <div className="space-y-2 animate-fade-in">
                            <h3 className="font-semibold">{t('intentions_suggestions_title')}</h3>
                            {suggestions.map((s, i) => (
                                <button key={i} onClick={() => setTitle(s)} className="w-full text-left p-3 bg-[var(--bg-subtle)] rounded-lg hover:bg-[var(--bg-muted)]">
                                    💡 {s}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-[var(--bg-surface)] p-6 rounded-2xl shadow-lg">
                    <h2 className="text-xl font-bold mb-4">{t('intentions_add_new_intention')}</h2>
                    <form onSubmit={handleAddIntention} className="space-y-4">
                        <div>
                            <label className="font-semibold text-sm text-[var(--text-secondary)]">{t('intentions_title_label')}</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full p-3 mt-1 bg-[var(--bg-muted)] rounded-lg border border-[var(--border-primary)]"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="font-semibold text-sm text-[var(--text-secondary)]">{t('intentions_frequency_label')}</label>
                                <select value={frequency} onChange={(e) => {
                                    const newFreq = e.target.value as IntentionFrequency;
                                    setFrequency(newFreq);
                                    if (newFreq === 'daily') setTarget(1);
                                }} className="w-full p-3 mt-1 bg-[var(--bg-muted)] rounded-lg border border-[var(--border-primary)]">
                                    <option value="daily">{t('frequency_daily')}</option>
                                    <option value="weekly">{t('frequency_weekly')}</option>
                                </select>
                            </div>
                            <div>
                                <label className="font-semibold text-sm text-[var(--text-secondary)]">{t('intentions_target_label')}</label>
                                <input
                                    type="number"
                                    value={target}
                                    onChange={(e) => setTarget(parseInt(e.target.value))}
                                    min="1"
                                    max="7"
                                    disabled={frequency === 'daily'}
                                    className="w-full p-3 mt-1 bg-[var(--bg-muted)] rounded-lg border border-[var(--border-primary)] disabled:opacity-50"
                                    required
                                />
                            </div>
                        </div>
                        <button type="submit" className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700">
                            {t('intentions_add_intention_button')}
                        </button>
                    </form>
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-2xl font-bold">{t('intentions_your_intentions_title')}</h2>
                {intentions.length > 0 ? (
                    intentions.map(intention => <IntentionItem key={intention.id} intention={intention} />)
                ) : (
                    <p className="text-center py-8 text-[var(--text-secondary)] bg-[var(--bg-surface)] rounded-2xl">{t('intentions_empty_list')}</p>
                )}
            </div>
        </div>
    );
};

export default Intentions;