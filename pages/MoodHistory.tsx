import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAppContext } from '../context/AppContext';
import { Mood, MoodLog } from '../types';
import { getAIAnalysis } from '../services/geminiService';
import { moodContextActivities, moodContextPeople } from '../constants';

const moodToValue: Record<Mood, number> = { '😔': 1, '😐': 2, '🙂': 3, '😃': 4, '😍': 5 };
const valueToMood: Record<number, Mood> = { 1: '😔', 2: '😐', 3: '🙂', 4: '😃', 5: '😍' };

const CustomYAxisTick = (props: any) => {
    const { x, y, payload } = props;
    return (
        <g transform={`translate(${x},${y})`}>
            <text x={-10} y={0} dy={4} textAnchor="end" fill="var(--text-secondary)" fontSize={20}>
                {valueToMood[payload.value as keyof typeof valueToMood]}
            </text>
        </g>
    );
};

const CustomTooltip = ({ active, payload, label }: any) => {
    const { t } = useTranslation();
    if (active && payload && payload.length) {
        const moodPayload = payload.find((p: any) => p.dataKey === 'mood');
        const journalMoodPayload = payload.find((p: any) => p.dataKey === 'journalMood');
        const checkinLog = moodPayload?.payload?.checkinLog as MoodLog | undefined;
        
        const translatedActivities = checkinLog?.activities?.map(id => {
            const activity = moodContextActivities.find(a => a.id === id);
            return activity ? t(activity.key) : id;
        }).join(', ');

        const translatedPeople = checkinLog?.people?.map(id => {
            const person = moodContextPeople.find(p => p.id === id);
            return person ? t(person.key) : id;
        }).join(', ');

        return (
            <div className="bg-[var(--bg-surface)] p-3 border border-[var(--border-primary)] rounded-lg shadow-sm w-48 text-sm">
                <p className="label font-semibold">{`${label}`}</p>
                {moodPayload && moodPayload.value && (
                    <p style={{ color: moodPayload.color }}>
                        {`${t('mood_history_tooltip_checkin')}: ${valueToMood[moodPayload.value]}`}
                    </p>
                )}
                {journalMoodPayload && journalMoodPayload.value && (
                    <p style={{ color: journalMoodPayload.color }}>
                        {`${t('mood_history_tooltip_journal')}: ${valueToMood[journalMoodPayload.value]}`}
                    </p>
                )}
                {checkinLog?.note && <p className="text-xs mt-2 italic">"{checkinLog.note}"</p>}
                {translatedActivities && <p className="text-xs mt-1"><b>{t('mood_history_tooltip_activities')}:</b> {translatedActivities}</p>}
                {translatedPeople && <p className="text-xs mt-1"><b>{t('mood_history_tooltip_people')}:</b> {translatedPeople}</p>}
            </div>
        );
    }
    return null;
};

const MoodTrendChart: React.FC = () => {
    const { moodLogs } = useAppContext();
    const { t } = useTranslation();

    const last7DaysData = useMemo(() => {
        const today = new Date();
        const data = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateString = date.toISOString().split('T')[0];
            
            const checkinLogForDay = moodLogs.find(log => log.date === dateString && log.source === 'check-in');
            const journalLogForDay = moodLogs.find(log => log.date === dateString && log.source === 'journal');

            data.push({
                date: date.toLocaleDateString('en-US', { weekday: 'short' }),
                mood: checkinLogForDay ? moodToValue[checkinLogForDay.mood] : null,
                journalMood: journalLogForDay ? moodToValue[journalLogForDay.mood] : null,
                checkinLog: checkinLogForDay,
            });
        }
        return data;
    }, [moodLogs]);

    return (
         <div className="h-80">
            {moodLogs.length === 0 ? (
                <div className="flex items-center justify-center h-full text-[var(--text-secondary)]">
                    {t('mood_history_chart_empty')}
                </div>
            ) : (
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={last7DaysData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={<CustomYAxisTick />} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Line connectNulls type="monotone" dataKey="mood" stroke="#8884d8" activeDot={{ r: 8 }} name="Daily Check-in" />
                        <Line connectNulls type="monotone" dataKey="journalMood" stroke="#82ca9d" name="Journal Mood" />
                    </LineChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}

const MoodCalendar: React.FC = () => {
    const { moodLogs, journalEntries } = useAppContext();
    const [viewDate, setViewDate] = useState(new Date());

    const moodToColor: Record<Mood, string> = {
        '😔': 'bg-red-400 dark:bg-red-600',
        '😐': 'bg-gray-400 dark:bg-gray-500',
        '🙂': 'bg-blue-400 dark:bg-blue-500',
        '😃': 'bg-green-400 dark:bg-green-500',
        '😍': 'bg-yellow-400 dark:bg-yellow-500',
    };

    const combinedMoods = useMemo(() => {
        const moods: { [key: string]: Mood } = {};
        moodLogs.forEach(log => {
            moods[log.date] = log.mood;
        });
        journalEntries.forEach(entry => {
            const dateKey = new Date(entry.date).toISOString().split('T')[0];
            moods[dateKey] = entry.mood;
        });
        return moods;
    }, [moodLogs, journalEntries]);

    const changeMonth = (offset: number) => {
        setViewDate(prevDate => {
            const newDate = new Date(prevDate);
            newDate.setDate(1); // Avoids issues with month-end dates
            newDate.setMonth(newDate.getMonth() + offset);
            return newDate;
        });
    };

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const monthName = viewDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const renderCalendar = () => {
        const days = [];
        const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
        dayHeaders.forEach(day => {
            days.push(<div key={day} className="font-bold text-[var(--text-secondary)] text-sm">{day}</div>);
        });

        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(<div key={`pad-${i}`}></div>);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const mood = combinedMoods[dateKey];
            const isToday = new Date().toISOString().split('T')[0] === dateKey;

            days.push(
                <div key={day} className="p-1 flex flex-col items-center justify-start h-16">
                    <span className={`w-8 h-8 flex items-center justify-center rounded-full ${isToday ? 'bg-[var(--accent-primary)] text-[var(--text-on-accent)]' : ''}`}>
                        {day}
                    </span>
                    {mood && (
                        <span 
                            className={`mt-1 w-3 h-3 rounded-full ${moodToColor[mood]}`}
                            title={`Mood: ${mood}`}
                        ></span>
                    )}
                </div>
            );
        }
        return days;
    };

    return (
        <div className="bg-[var(--bg-surface)] p-6 rounded-2xl shadow-lg">
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => changeMonth(-1)} className="font-bold text-2xl p-2">&lt;</button>
                <h2 className="text-xl font-bold">{monthName}</h2>
                <button onClick={() => changeMonth(1)} className="font-bold text-2xl p-2">&gt;</button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
                {renderCalendar()}
            </div>
        </div>
    );
};

const MoodHistory: React.FC = () => {
    const { moodLogs, journalEntries } = useAppContext();
    const { t } = useTranslation();
    const [insight, setInsight] = useState<string | null>(null);
    const [isLoadingInsight, setIsLoadingInsight] = useState(false);

    const handleGetInsight = async () => {
        setIsLoadingInsight(true);
        const analysis = await getAIAnalysis(journalEntries, moodLogs);
        if (analysis) {
            setInsight(analysis.insight);
        } else {
            setInsight("Sorry, couldn't get an insight right now. Please try again later.");
        }
        setIsLoadingInsight(false);
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">{t('mood_history_title')}</h1>

            <div className="bg-[var(--bg-surface)] p-6 rounded-2xl shadow-lg">
                <h2 className="text-xl font-bold mb-4">{t('mood_history_chart_title')}</h2>
                <MoodTrendChart />
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                 <MoodCalendar />
                 <div className="bg-orange-100 dark:bg-orange-900/50 p-6 rounded-2xl shadow-lg flex flex-col">
                    <h2 className="text-xl font-bold mb-4 text-orange-800 dark:text-orange-200">{t('mood_history_insight_title')}</h2>
                    <div className="flex-grow">
                        {isLoadingInsight ? (
                            <p className="text-orange-700 dark:text-orange-300">{t('mood_history_insight_loading')}</p>
                        ) : insight ? (
                            <p className="text-orange-700 dark:text-orange-300">{insight}</p>
                        ) : (
                            <p className="text-orange-700 dark:text-orange-300 mb-4">{t('mood_history_insight_prompt')}</p>
                        )}
                    </div>
                    {!insight && (
                        <button 
                            onClick={handleGetInsight} 
                            className="mt-4 bg-orange-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-orange-600 transition disabled:bg-orange-300"
                            disabled={isLoadingInsight || (moodLogs.length === 0 && journalEntries.length === 0)}
                        >
                            {isLoadingInsight ? t('mood_history_insight_button_loading') : t('mood_history_insight_button')}
                        </button>
                    )}
                 </div>
            </div>

        </div>
    );
};

export default MoodHistory;