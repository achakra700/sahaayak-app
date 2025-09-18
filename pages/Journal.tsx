import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mood, JournalEntry } from '../types';
import { moodOptions, PhoneIcon, MicIcon, StopIcon } from '../constants';
import { useAppContext } from '../context/AppContext';
import { getAIAnalysis } from '../services/geminiService';

// SpeechRecognition API type definitions
interface SpeechRecognition {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onend: () => void;
    onerror: (event: any) => void;
    onresult: (event: any) => void;
    start: () => void;
    stop: () => void;
}
declare global {
    interface Window {
      SpeechRecognition: new () => SpeechRecognition;
      webkitSpeechRecognition: new () => SpeechRecognition;
    }
}

const Journal: React.FC = () => {
    const { journalEntries, addJournalEntry, moodLogs, updateJournalingStreak, triggerHapticFeedback, language } = useAppContext();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [content, setContent] = useState('');
    const [selectedMood, setSelectedMood] = useState<Mood>('😐');
    const [isSaving, setIsSaving] = useState(false);
    const [showCrisisModal, setShowCrisisModal] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const contentBeforeRecording = useRef('');

    const handleSave = async () => {
        if (content.trim() === '') {
            alert("Please write something before saving.");
            return;
        }
        
        setIsSaving(true);

        const newEntry: JournalEntry = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            prompt: t('journal_prompt'),
            content: content,
            mood: selectedMood,
        };

        addJournalEntry(newEntry);
        updateJournalingStreak();
        triggerHapticFeedback('medium');

        const analysis = await getAIAnalysis([newEntry, ...journalEntries], moodLogs);

        setIsSaving(false);
        setContent('');
        setSelectedMood('😐');
        
        if (analysis && (analysis.crisisLevel === 'low' || analysis.crisisLevel === 'high')) {
            setShowCrisisModal(true);
        } else {
             // Silently save without alert
        }
    };

    const handleToggleRecording = useCallback(() => {
        if (isRecording) {
            recognitionRef.current?.stop();
            return;
        }

        const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognitionAPI) {
            alert(t('journal_voice_unsupported'));
            return;
        }
        
        triggerHapticFeedback('medium');
        const recognition = new SpeechRecognitionAPI();
        recognitionRef.current = recognition;
        contentBeforeRecording.current = content.trim() ? content.trim() + ' ' : '';

        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = language === 'hi' ? 'hi-IN' : language === 'bn' ? 'bn-BD' : 'en-US';

        recognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript + '. ';
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }
            setContent(contentBeforeRecording.current + finalTranscript + interimTranscript);
        };

        recognition.onend = () => {
            setIsRecording(false);
            recognitionRef.current = null;
        };
        
        recognition.onerror = (event) => {
            console.error("Speech recognition error", event.error);
            setIsRecording(false);
        };
        
        recognition.start();
        setIsRecording(true);

    }, [isRecording, language, content, triggerHapticFeedback, t]);

    useEffect(() => {
        return () => {
            recognitionRef.current?.stop();
        };
    }, []);
    
    const formatDate = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    }
    
    const CrisisModal = () => (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-[var(--bg-surface)] rounded-2xl p-6 sm:p-8 max-w-md text-center shadow-2xl">
                <h2 className="text-2xl font-bold text-[var(--danger-secondary)] mb-4">{t('crisis_modal_title')}</h2>
                <p className="text-[var(--text-primary)] mb-4">{t('crisis_modal_text')}</p>
                <div className="text-left bg-blue-50 dark:bg-blue-900/40 p-4 rounded-lg mb-6">
                    <h3 className="font-bold text-blue-800 dark:text-blue-200">{t('emergency_feeling_unsafe_title')}</h3>
                    <p className="text-sm text-blue-700 dark:text-blue-300">{t('crisis_modal_grounding_suggestion')}</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button onClick={() => navigate('/emergency', { state: { fromDistress: true } })} className="w-full sm:w-auto bg-[var(--danger-primary)] hover:bg-[var(--danger-secondary)] text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2">
                        <PhoneIcon /> {t('crisis_modal_get_help')}
                    </button>
                    <button onClick={() => setShowCrisisModal(false)} className="w-full sm:w-auto bg-[var(--bg-muted)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-primary)] font-bold py-3 px-6 rounded-lg transition">{t('crisis_modal_close')}</button>
                </div>
            </div>
        </div>
    );

    return (
        <>
        {showCrisisModal && <CrisisModal />}
        <div className="grid lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-6">
                 <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">{t('journal_title')}</h1>
                <div className="bg-[var(--bg-surface)] p-6 rounded-2xl shadow-lg">
                    <label htmlFor="journal" className="block text-lg font-semibold text-[var(--text-secondary)] mb-2">{t('journal_prompt')}</label>
                    <textarea 
                        id="journal"
                        rows={12}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className={`w-full p-4 bg-[var(--bg-muted)] rounded-lg border border-[var(--border-primary)] focus:ring-2 focus:ring-[var(--accent-primary)] focus:outline-none transition ${isRecording ? 'animate-flashing-border-blue' : ''}`}
                        placeholder={t('journal_placeholder')}
                        disabled={isSaving}
                    />
                </div>
                 <div className="bg-[var(--bg-surface)] p-6 rounded-2xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                         <label className="block text-lg font-semibold text-[var(--text-secondary)] mb-2">{t('journal_tag_mood')}</label>
                         <div className="flex items-center space-x-2">
                            {moodOptions.map(mood => (
                                <button
                                    key={mood}
                                    onClick={() => {
                                        setSelectedMood(mood);
                                        triggerHapticFeedback('light');
                                    }}
                                    className={`text-3xl p-2 rounded-full transition-transform transform hover:scale-125 ${selectedMood === mood ? 'bg-blue-200 dark:bg-blue-800 scale-125' : ''}`}
                                >
                                    {mood}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleToggleRecording}
                            disabled={isSaving}
                            className={`w-14 h-14 flex items-center justify-center rounded-full text-white shadow-md transition-colors ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-sky-500 hover:bg-sky-600'}`}
                            aria-label={t(isRecording ? 'journal_record_stop' : 'journal_record_start')}
                        >
                            {isRecording ? <StopIcon /> : <MicIcon />}
                        </button>
                        <button 
                            onClick={handleSave} 
                            disabled={isSaving}
                            className="w-full sm:w-auto bg-[var(--accent-primary)] text-[var(--text-on-accent)] font-bold py-3 px-8 rounded-lg shadow-md hover:bg-[var(--accent-primary-hover)] transition disabled:opacity-50"
                        >
                            {isSaving ? t('journal_saving_button') : t('journal_save_button')}
                        </button>
                    </div>
                 </div>
            </div>
            <div className="lg:col-span-1 space-y-4">
                 <h2 className="text-2xl font-bold text-[var(--text-primary)]">{t('journal_recent_entries')}</h2>
                 {journalEntries.length > 0 ? (
                    journalEntries.slice(0, 5).map(entry => (
                         <div key={entry.id} className="bg-[var(--bg-surface)] p-4 rounded-xl shadow-lg">
                             <div className="flex justify-between items-center mb-2">
                                 <p className="text-sm font-semibold text-[var(--text-secondary)]">{formatDate(entry.date)}</p>
                                 <p className="text-2xl">{entry.mood}</p>
                             </div>
                             <p className="text-[var(--text-primary)] truncate">{entry.content}</p>
                         </div>
                    ))
                 ) : (
                    <p className="text-[var(--text-secondary)]">{t('journal_no_entries')}</p>
                 )}
                 {journalEntries.length > 5 && (
                    <button className="w-full text-center py-2 text-[var(--text-accent)] font-semibold">{t('journal_view_all')}</button>
                 )}
            </div>
        </div>
        </>
    );
};

export default Journal;