import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../context/AppContext';
import { wellnessJourneys } from '../constants';
import { WellnessTask, JournalEntry, Mood } from '../types';
import { moodOptions } from '../constants';

const AnimatedCheckmark: React.FC = () => {
    const { t } = useTranslation();
    return (
        <div className="flex items-center gap-2 text-green-600 font-bold animate-fade-in">
            <svg className="w-6 h-6 animate-scale-in" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>{t('task_completed')}</span>
        </div>
    );
};

const JourneyDetail: React.FC = () => {
    const { journeyId } = useParams<{ journeyId: string }>();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { 
        journeyProgress, 
        completeJourneyTask, 
        addJournalEntry,
        advanceJourneyDay,
        triggerHapticFeedback
    } = useAppContext();

    const journey = wellnessJourneys.find(j => j.id === journeyId);
    const progress = journeyId ? journeyProgress[journeyId] : null;

    // State for journal task
    const [journalContent, setJournalContent] = useState('');
    const [journalMood, setJournalMood] = useState<Mood>('😐');

    if (!journey || !progress) {
        return (
            <div className="text-center p-8">
                <h1 className="text-2xl font-bold">{t('journey_not_started_title')}</h1>
                <p className="text-[var(--text-secondary)] mt-2">{t('journey_not_started_desc')}</p>
                <button onClick={() => navigate('/journeys')} className="mt-4 bg-[var(--accent-primary)] text-[var(--text-on-accent)] font-bold py-2 px-6 rounded-lg">
                    {t('journey_back_to_list')}
                </button>
            </div>
        );
    }

    const currentDayData = journey.days.find(d => d.day === progress.currentDay);
    if (!currentDayData) {
        return (
            <div className="text-center p-8">
                <h1 className="text-3xl font-bold text-green-600 dark:text-green-400">🎉 {t('journey_fully_completed_title')} 🎉</h1>
                <p className="text-lg text-[var(--text-secondary)] mt-2">{t('journey_fully_completed_desc')}</p>
                 <button onClick={() => navigate('/journeys')} className="mt-6 bg-[var(--accent-primary)] text-[var(--text-on-accent)] font-bold py-3 px-8 rounded-lg">
                    {t('journey_back_to_list')}
                </button>
            </div>
        );
    }

    const completedTasksForToday = progress.completedTasksByDay[progress.currentDay] || [];
    const allTasksForTodayCompleted = currentDayData.tasks.every(task => completedTasksForToday.includes(task.id));

    const handleJournalSave = (task: WellnessTask) => {
        if (journalContent.trim() === '') return;
        
        const newEntry: JournalEntry = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            prompt: t(task.contentKey),
            content: journalContent,
            mood: journalMood,
        };
        addJournalEntry(newEntry);
        completeJourneyTask(journey.id, currentDayData.day, task.id);
        setJournalContent('');
        setJournalMood('😐');
    };

    const TaskCard: React.FC<{ task: WellnessTask }> = ({ task }) => {
        const isCompleted = completedTasksForToday.includes(task.id);

        return (
            <div className={`p-5 rounded-xl transition-all duration-300 ${isCompleted ? 'bg-green-100 dark:bg-green-900/40' : 'bg-[var(--bg-surface)] shadow-md'}`}>
                <div className="flex justify-between items-start">
                    <h3 className={`font-bold text-lg transition-colors ${isCompleted ? 'text-gray-500 dark:text-gray-400 line-through' : 'text-[var(--text-primary)]'}`}>{t(task.titleKey)}</h3>
                    {isCompleted && <AnimatedCheckmark />}
                </div>
                <div className={`mt-3 text-[var(--text-secondary)] transition-opacity ${isCompleted ? 'opacity-60' : 'opacity-100'}`}>
                    {task.type === 'read' && <p className="whitespace-pre-wrap">{t(task.contentKey)}</p>}
                    
                    {task.type === 'exercise' && (
                         <p>{t('task_exercise_desc')} <a href={`#${task.contentKey}`} onClick={() => navigate(task.contentKey)} className="text-[var(--text-accent)] font-semibold underline">{t('task_exercise_link_text')}</a>.</p>
                    )}

                    {task.type === 'journal' && (
                        <div>
                            <p className="italic mb-3">"{t(task.contentKey)}"</p>
                            {!isCompleted && (
                                <>
                                    <textarea
                                        value={journalContent}
                                        onChange={e => setJournalContent(e.target.value)}
                                        rows={5}
                                        className="w-full p-2 bg-[var(--bg-subtle)] rounded-lg border border-[var(--border-primary)] focus:ring-1 focus:ring-[var(--accent-primary)]"
                                        placeholder={t('journal_placeholder')}
                                    />
                                    <div className="flex items-center justify-between mt-3">
                                        <div className="flex items-center space-x-1">
                                            {moodOptions.map(mood => (
                                                <button key={mood} onClick={() => setJournalMood(mood)} className={`text-2xl p-1 rounded-full ${journalMood === mood ? 'bg-blue-200 dark:bg-blue-800' : ''}`}>
                                                    {mood}
                                                </button>
                                            ))}
                                        </div>
                                        <button onClick={() => handleJournalSave(task)} className="bg-[var(--accent-primary)] text-[var(--text-on-accent)] font-bold py-2 px-4 rounded-lg text-sm">{t('journal_save_button')}</button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
                {(task.type === 'read' || task.type === 'exercise') && !isCompleted && (
                    <button onClick={() => completeJourneyTask(journey.id, currentDayData.day, task.id)} className="mt-4 bg-[var(--accent-primary)] text-[var(--text-on-accent)] font-bold py-2 px-4 rounded-lg">
                        {t('task_complete_button')}
                    </button>
                )}
            </div>
        );
    };

    return (
        <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
                <div className="bg-[var(--bg-surface)] p-6 rounded-2xl shadow-lg sticky top-8">
                    <div className="flex items-center mb-4">
                        <span className="text-4xl mr-4">{journey.icon}</span>
                        <h1 className="text-2xl font-bold">{t(journey.titleKey)}</h1>
                    </div>
                    <hr className="border-[var(--border-secondary)] my-4" />
                    <ul>
                        {journey.days.map(day => (
                            <li key={day.day} className={`p-3 rounded-lg mb-2 font-semibold transition-colors duration-200 ${day.day === progress.currentDay ? 'bg-[var(--accent-primary)] text-[var(--text-on-accent)] shadow-md' : (day.day < progress.currentDay ? 'text-gray-400 line-through' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-muted)]')}`}>
                                {day.day < progress.currentDay && '✓ '}
                                {t('journey_detail_day')} {day.day}: {t(day.titleKey)}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="lg:col-span-2">
                <div className="mb-6">
                    <h2 className="text-3xl font-bold">{t('journey_detail_day')} {currentDayData.day}: {t(currentDayData.titleKey)}</h2>
                    <p className="text-[var(--text-secondary)] mt-1">{t('journey_detail_tasks_for_day')}</p>
                </div>

                <div className="space-y-6">
                    {currentDayData.tasks.map(task => (
                        <TaskCard key={task.id} task={task} />
                    ))}
                </div>

                {allTasksForTodayCompleted && (
                     <div className="mt-8 text-center p-6 bg-green-100 dark:bg-green-900/40 rounded-2xl animate-fade-in">
                        <h3 className="text-2xl font-bold text-green-700 dark:text-green-300">🎉 {t('journey_day_complete_title')} 🎉</h3>
                        <p className="text-green-600 dark:text-green-400 mt-2">{t('journey_day_complete_desc')}</p>
                        <button 
                            onClick={() => { advanceJourneyDay(journey.id); triggerHapticFeedback('success'); }} 
                            className="mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg"
                        >
                            {t('journey_next_day_button')}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default JourneyDetail;