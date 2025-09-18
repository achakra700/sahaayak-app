import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { wellnessJourneys } from '../constants';

const Journeys: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { journeyProgress, startJourney } = useAppContext();

    return (
        <div className="space-y-8">
            <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">{t('journeys_page_title')}</h1>
            <p className="text-lg text-[var(--text-secondary)]">{t('journeys_page_subtitle')}</p>
            
            <div className="grid md:grid-cols-2 gap-8">
                {wellnessJourneys.map(journey => {
                    const progress = journeyProgress[journey.id];
                    const isStarted = !!progress;
                    
                    let progressPercentage = 0;
                    if (isStarted) {
                        const totalTasks = journey.days.reduce((acc, day) => acc + day.tasks.length, 0);
                        const completedTasks = Object.values(progress.completedTasksByDay).reduce((acc, tasks) => acc + tasks.length, 0);
                        if (totalTasks > 0) {
                            progressPercentage = Math.round((completedTasks / totalTasks) * 100);
                        }
                    }

                    return (
                        <div key={journey.id} className="bg-[var(--bg-surface)] p-6 rounded-2xl shadow-lg flex flex-col">
                            <div className="flex items-center mb-4">
                                <span className="text-4xl mr-4">{journey.icon}</span>
                                <div>
                                    <h2 className="text-xl font-bold">{t(journey.titleKey)}</h2>
                                </div>
                            </div>
                            <p className="text-[var(--text-secondary)] flex-grow mb-6">{t(journey.descriptionKey)}</p>
                            
                            {isStarted && (
                                <div className="mb-4">
                                    <div className="flex justify-between items-center text-sm text-[var(--text-secondary)] mb-1">
                                        <span className="font-semibold">{t('journey_progress_day', { day: progress.currentDay, total: journey.days.length })}</span>
                                        <span className="font-bold text-green-600 dark:text-green-400">{t('journey_progress_percent', { percent: progressPercentage })}</span>
                                    </div>
                                    <div className="w-full bg-[var(--bg-muted)] rounded-full h-2">
                                        <div className="bg-green-500 h-2 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={() => {
                                    if (!isStarted) {
                                        startJourney(journey.id);
                                    }
                                    navigate(`/journeys/${journey.id}`);
                                }}
                                className="w-full bg-[var(--accent-primary)] text-[var(--text-on-accent)] font-bold py-3 rounded-lg shadow-md hover:bg-[var(--accent-primary-hover)] transition mt-auto"
                            >
                                {isStarted ? t('journey_continue_button') : t('journey_start_button')}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Journeys;