import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import { useAppContext } from '../context/AppContext';
import { Persona, Language, ChatFontSize, Theme, DashboardLayout, QuietHours } from '../types';
import { personaOptions, languageOptions } from '../constants';
import { TFunction } from 'i18next';

interface SettingsSectionProps {
    title: string;
    children: React.ReactNode;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ title, children }) => (
    <div className="bg-[var(--bg-surface)] p-6 rounded-2xl shadow-lg">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        {children}
    </div>
);

const ToggleSwitch: React.FC<{ enabled: boolean; onChange: (enabled: boolean) => void }> = ({ enabled, onChange }) => (
    <button
        onClick={() => onChange(!enabled)}
        className={`${enabled ? 'bg-[var(--accent-primary)]' : 'bg-[var(--bg-muted)]'} relative inline-flex items-center h-6 rounded-full w-11 transition-colors flex-shrink-0`}
        aria-checked={enabled}
        role="switch"
    >
        <span
            className={`${enabled ? 'translate-x-6' : 'translate-x-1'} inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}
        />
    </button>
);

const ConfirmationModal: React.FC<{
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    t: TFunction;
}> = ({ title, message, onConfirm, onCancel, t }) => (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
        <div className="bg-[var(--bg-surface)] rounded-2xl p-6 sm:p-8 max-w-sm text-center shadow-2xl">
            <h2 id="confirm-title" className="text-xl font-bold text-[var(--text-primary)] mb-4">{title}</h2>
            <p className="text-[var(--text-secondary)] mb-6">{message}</p>
            <div className="flex gap-4 justify-center">
                <button onClick={onCancel} className="w-full bg-[var(--bg-muted)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-primary)] font-bold py-2 px-6 rounded-lg transition">{t('cancel_button')}</button>
                <button onClick={onConfirm} className="w-full bg-[var(--danger-primary)] hover:bg-[var(--danger-secondary)] text-white font-bold py-2 px-6 rounded-lg transition">{t('delete_button')}</button>
            </div>
        </div>
    </div>
);


const ThemeButton: React.FC<{ name: Theme; currentTheme: Theme; setTheme: (theme: Theme) => void; t: TFunction }> = ({ name, currentTheme, setTheme, t }) => {
    const colors: Record<Theme, string[]> = {
        light: ['#f8fafc', '#3b82f6', '#1e293b'],
        dark: ['#0f172a', '#3b82f6', '#f1f5f9'],
        warm: ['#fcf8f2', '#ff8a65', '#5d4037'],
        cool: ['#f0f9ff', '#22d3ee', '#083344'],
    };
    const isActive = name === currentTheme;
    const { triggerHapticFeedback } = useAppContext();

    return (
        <button
            onClick={() => { setTheme(name); triggerHapticFeedback('light'); }}
            className={`p-3 rounded-lg text-left transition-all duration-200 border-2 ${isActive ? 'border-[var(--accent-primary)] bg-[var(--bg-muted)]' : 'border-transparent bg-[var(--bg-muted)] hover:bg-[var(--bg-surface-hover)]'}`}
        >
            <div className="flex items-center justify-between">
                <span className="font-semibold text-sm capitalize text-[var(--text-primary)]">{t(`theme_${name}`)}</span>
                <div className="flex -space-x-1">
                    {colors[name].map(color => (
                        <div key={color} className="w-4 h-4 rounded-full border-2 border-[var(--bg-surface)]" style={{ backgroundColor: color }} />
                    ))}
                </div>
            </div>
        </button>
    );
};

const FeedbackModal: React.FC<{
    onClose: () => void;
    t: TFunction;
}> = ({ onClose, t }) => {
    const [type, setType] = useState('general');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;
        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            console.log({ type, message });
            setIsSubmitting(false);
            setIsSuccess(true);
            setTimeout(() => onClose(), 2000); // Close after 2 seconds
        }, 1000);
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-[var(--bg-surface)] rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-2xl text-[var(--text-secondary)]">&times;</button>
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">{t('feedback_modal_title')}</h2>
                {isSuccess ? (
                    <div className="text-center py-8">
                        <p className="text-2xl mb-4">🎉</p>
                        <p className="text-lg font-semibold text-green-600">{t('feedback_success_message')}</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="font-semibold text-sm text-[var(--text-secondary)]">{t('feedback_type_label')}</label>
                            <select value={type} onChange={e => setType(e.target.value)} className="w-full p-3 mt-1 bg-[var(--bg-muted)] rounded-lg border border-[var(--border-primary)]">
                                <option value="general">{t('feedback_type_general')}</option>
                                <option value="bug">{t('feedback_type_bug')}</option>
                                <option value="feature">{t('feedback_type_feature')}</option>
                            </select>
                        </div>
                        <div>
                            <label className="font-semibold text-sm text-[var(--text-secondary)]">{t('feedback_message_label')}</label>
                            <textarea value={message} onChange={e => setMessage(e.target.value)} rows={5} placeholder={t('feedback_message_placeholder')} className="w-full p-3 mt-1 bg-[var(--bg-muted)] rounded-lg border border-[var(--border-primary)]" required />
                        </div>
                        <button type="submit" disabled={isSubmitting} className="w-full bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-[var(--text-on-accent)] font-bold py-3 px-6 rounded-lg transition disabled:opacity-50">
                            {isSubmitting ? t('feedback_submitting_button') : t('feedback_submit_button')}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

const PrivacyPolicyModal: React.FC<{
    onClose: () => void;
    t: TFunction;
}> = ({ onClose, t }) => (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in">
        <div className="bg-[var(--bg-surface)] rounded-2xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl relative max-h-[80vh] flex flex-col">
            <button onClick={onClose} className="absolute top-4 right-4 text-2xl text-[var(--text-secondary)]">&times;</button>
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4 flex-shrink-0">{t('privacy_policy_modal_title')}</h2>
            <div className="overflow-y-auto space-y-4 text-[var(--text-secondary)] pr-4">
                <p>{t('privacy_policy_content_p1')}</p>
                <h3 className="font-bold text-[var(--text-primary)] pt-2">{t('privacy_policy_subtitle_collection')}</h3>
                <p>{t('privacy_policy_content_p2')}</p>
                <h3 className="font-bold text-[var(--text-primary)] pt-2">{t('privacy_policy_subtitle_anonymous')}</h3>
                <p>{t('privacy_policy_content_p3')}</p>
                 <h3 className="font-bold text-[var(--text-primary)] pt-2">{t('privacy_policy_subtitle_ai')}</h3>
                <p>{t('privacy_policy_content_p4')}</p>
                 <h3 className="font-bold text-[var(--text-primary)] pt-2">{t('privacy_policy_subtitle_security')}</h3>
                <p>{t('privacy_policy_content_p5')}</p>
                 <h3 className="font-bold text-[var(--text-primary)] pt-2">{t('privacy_policy_subtitle_changes')}</h3>
                <p>{t('privacy_policy_content_p6')}</p>
            </div>
        </div>
    </div>
);


const Settings: React.FC = () => {
    const { 
        theme, setTheme, 
        user,
        selectedPersona, setPersona,
        language, setLanguage,
        chatFontSize, setChatFontSize,
        triggerHapticFeedback,
        moodReminderEnabled, setMoodReminderEnabled,
        journalPromptReminderEnabled, setJournalPromptReminderEnabled,
        dynamicPersonaEnabled, setDynamicPersonaEnabled,
        dashboardLayout, setDashboardLayout,
        quietHours, setQuietHours,
        exportUserData, clearAllUserData,
    } = useAppContext();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
    const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
    const [isClearDataModalOpen, setIsClearDataModalOpen] = useState(false);

    const handleLogout = async () => {
        await signOut(auth);
        // The onAuthStateChanged listener in App.tsx will handle navigation
    };
    
    const moveColumn = (index: number, direction: 'up' | 'down') => {
        const newLayout = [...dashboardLayout];
        const item = newLayout.splice(index, 1)[0];
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        newLayout.splice(newIndex, 0, item);
        setDashboardLayout(newLayout);
        triggerHapticFeedback('light');
    };

    const handleQuietHoursChange = (field: 'start' | 'end' | 'enabled', value: string | boolean) => {
        setQuietHours({ ...quietHours, [field]: value });
    };

    const columnNames: Record<typeof dashboardLayout[number], string> = {
        mind: t('dashboard_column_mind'),
        growth: t('dashboard_column_growth'),
        inspiration: t('dashboard_column_inspiration'),
    };

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            {isClearDataModalOpen && <ConfirmationModal 
                title={t('clear_data_confirm_title')}
                message={t('clear_data_confirm_text')}
                onConfirm={() => {
                    setIsClearDataModalOpen(false);
                    clearAllUserData();
                }}
                onCancel={() => setIsClearDataModalOpen(false)}
                t={t}
            />}
            {isFeedbackModalOpen && <FeedbackModal onClose={() => setIsFeedbackModalOpen(false)} t={t} />}
            {isPrivacyModalOpen && <PrivacyPolicyModal onClose={() => setIsPrivacyModalOpen(false)} t={t} />}

            <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">{t('settings_title')}</h1>

            <SettingsSection title={t('settings_section_appearance')}>
                 <div className="flex justify-between items-center mb-4">
                    <span className="font-semibold">{t('language')}</span>
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
                </div>
                <div className="space-y-2 mb-4">
                    <span className="font-semibold">{t('theme')}</span>
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <ThemeButton name="light" currentTheme={theme} setTheme={setTheme} t={t} />
                        <ThemeButton name="dark" currentTheme={theme} setTheme={setTheme} t={t} />
                        <ThemeButton name="warm" currentTheme={theme} setTheme={setTheme} t={t} />
                        <ThemeButton name="cool" currentTheme={theme} setTheme={setTheme} t={t} />
                    </div>
                </div>
                <div className="flex justify-between items-center">
                    <span className="font-semibold">{t('settings_chat_font_size')}</span>
                    <div className="flex items-center space-x-2 bg-[var(--bg-muted)] p-1 rounded-full">
                        <button onClick={() => { setChatFontSize('sm'); triggerHapticFeedback('light'); }} className={`px-4 py-1 rounded-full ${chatFontSize === 'sm' ? 'bg-[var(--bg-surface)] shadow' : ''}`}>{t('font_size_small')}</button>
                        <button onClick={() => { setChatFontSize('base'); triggerHapticFeedback('light'); }} className={`px-4 py-1 rounded-full ${chatFontSize === 'base' ? 'bg-[var(--bg-surface)] shadow' : ''}`}>{t('font_size_medium')}</button>
                        <button onClick={() => { setChatFontSize('lg'); triggerHapticFeedback('light'); }} className={`px-4 py-1 rounded-full ${chatFontSize === 'lg' ? 'bg-[var(--bg-surface)] shadow' : ''}`}>{t('font_size_large')}</button>
                    </div>
                </div>
            </SettingsSection>
            
            <SettingsSection title={t('settings_section_dashboard_prefs')}>
                <p className="text-sm text-[var(--text-secondary)] mb-4">{t('dashboard_prefs_desc')}</p>
                <div className="space-y-2">
                    {dashboardLayout.map((key, index) => (
                        <div key={key} className="flex items-center justify-between bg-[var(--bg-muted)] p-3 rounded-lg">
                            <span className="font-semibold">{columnNames[key]}</span>
                            <div className="flex gap-2">
                                <button onClick={() => moveColumn(index, 'up')} disabled={index === 0} className="disabled:opacity-30">▲</button>
                                <button onClick={() => moveColumn(index, 'down')} disabled={index === dashboardLayout.length - 1} className="disabled:opacity-30">▼</button>
                            </div>
                        </div>
                    ))}
                </div>
            </SettingsSection>


            <SettingsSection title={t('settings_section_notifications')}>
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <p className="font-semibold">{t('notifications_mood_reminder_label')}</p>
                        <p className="text-sm text-[var(--text-secondary)]">{t('notifications_mood_reminder_desc')}</p>
                    </div>
                    <ToggleSwitch
                        enabled={moodReminderEnabled}
                        onChange={setMoodReminderEnabled}
                    />
                </div>
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <p className="font-semibold">{t('notifications_journal_prompt_label')}</p>
                        <p className="text-sm text-[var(--text-secondary)]">{t('notifications_journal_prompt_desc')}</p>
                    </div>
                    <ToggleSwitch
                        enabled={journalPromptReminderEnabled}
                        onChange={setJournalPromptReminderEnabled}
                    />
                </div>
                <div className="flex justify-between items-start pt-4 border-t border-[var(--border-secondary)]">
                    <div>
                        <p className="font-semibold">{t('notifications_quiet_hours_label')}</p>
                        <p className="text-sm text-[var(--text-secondary)]">{t('notifications_quiet_hours_desc')}</p>
                    </div>
                     <ToggleSwitch
                        enabled={quietHours.enabled}
                        onChange={(val) => handleQuietHoursChange('enabled', val)}
                    />
                </div>
                {quietHours.enabled && (
                    <div className="flex gap-4 mt-4 animate-fade-in">
                        <div className="flex-1">
                            <label className="text-sm font-semibold">{t('quiet_hours_start')}</label>
                            <input type="time" value={quietHours.start} onChange={(e) => handleQuietHoursChange('start', e.target.value)} className="w-full p-2 mt-1 bg-[var(--bg-muted)] rounded-lg border border-[var(--border-primary)]" />
                        </div>
                         <div className="flex-1">
                            <label className="text-sm font-semibold">{t('quiet_hours_end')}</label>
                            <input type="time" value={quietHours.end} onChange={(e) => handleQuietHoursChange('end', e.target.value)} className="w-full p-2 mt-1 bg-[var(--bg-muted)] rounded-lg border border-[var(--border-primary)]" />
                        </div>
                    </div>
                )}
                {typeof Notification !== 'undefined' && Notification.permission === 'denied' && (
                    <p className="mt-4 text-sm text-[var(--danger-text)]">{t('notification_permission_denied')}</p>
                )}
            </SettingsSection>

            <SettingsSection title={t('settings_section_persona')}>
                <p className="text-sm text-[var(--text-secondary)] mb-4">{t('persona_prompt')}</p>
                <div className="flex justify-between items-start mb-6 p-4 bg-[var(--bg-subtle)] rounded-lg">
                    <div>
                        <p className="font-semibold">{t('settings_section_persona_dynamic_label')}</p>
                        <p className="text-sm text-[var(--text-secondary)]">{t('settings_section_persona_dynamic_desc')}</p>
                    </div>
                    <ToggleSwitch
                        enabled={dynamicPersonaEnabled}
                        onChange={setDynamicPersonaEnabled}
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.values(personaOptions).map(persona => (
                        <button 
                            key={persona.id} 
                            onClick={() => { setPersona(persona.id); triggerHapticFeedback('light'); }} 
                            className={`p-4 rounded-lg text-left transition-all duration-200 border-2 ${selectedPersona === persona.id ? 'border-[var(--accent-primary)] bg-[var(--bg-subtle)]' : 'border-transparent bg-[var(--bg-muted)] hover:bg-[var(--bg-surface-hover)]'}`}
                        >
                            <div className="text-3xl mb-2">{persona.icon}</div>
                            <h3 className="font-bold text-[var(--text-primary)]">{t(`persona_${persona.id}_name`)}</h3>
                            <p className="text-xs text-[var(--text-secondary)] mt-1">{t(`persona_${persona.id}_desc`)}</p>
                        </button>
                   ))}
                </div>
            </SettingsSection>
            
            <SettingsSection title={t('settings_section_data_privacy')}>
                <div className="space-y-4">
                    <div>
                        <button onClick={exportUserData} className="font-semibold text-[var(--text-accent)] hover:underline">{t('data_privacy_export_button')}</button>
                        <p className="text-sm text-[var(--text-secondary)]">{t('data_privacy_export_desc')}</p>
                    </div>
                    <div className="pt-4 border-t border-[var(--border-secondary)]">
                         <button onClick={() => setIsClearDataModalOpen(true)} className="font-semibold text-[var(--danger-secondary)] hover:underline">{t('data_privacy_clear_button')}</button>
                        <p className="text-sm text-[var(--text-secondary)]">{t('data_privacy_clear_desc')}</p>
                    </div>
                </div>
            </SettingsSection>

            <SettingsSection title={t('settings_section_account')}>
                <div className="space-y-3">
                    <p><span className="font-semibold">{t('account_name')}:</span> {user?.name}</p>
                    <p><span className="font-semibold">{t('account_email')}:</span> {user?.email || 'N/A'}</p>
                    {!user?.isAnonymous && <button className="text-[var(--text-accent)] font-semibold">{t('edit_account_info')}</button>}
                </div>
                <hr className="my-4 border-[var(--border-primary)]" />
                <button 
                    onClick={handleLogout}
                    className="w-full sm:w-auto bg-[var(--danger-primary)] hover:bg-[var(--danger-secondary)] text-white font-bold py-2 px-4 rounded-md transition"
                >
                    {t('logout')}
                </button>
            </SettingsSection>
            
            <SettingsSection title={t('settings_section_about')}>
                <p className="text-[var(--text-secondary)]">{t('about_version')}</p>
                <p className="text-[var(--text-secondary)] mt-2">{t('about_disclaimer')}</p>
                 <div className="mt-4 space-x-4">
                    <button onClick={() => setIsFeedbackModalOpen(true)} className="text-[var(--text-accent)] font-semibold hover:underline">{t('feedback_link')}</button>
                    <button onClick={() => setIsPrivacyModalOpen(true)} className="text-[var(--text-accent)] font-semibold hover:underline">{t('privacy_policy_link')}</button>
                </div>
            </SettingsSection>

            <footer className="text-center text-sm text-[var(--text-secondary)] mt-8">
                {t('footer_made_in_india')}
            </footer>
        </div>
    );
};

export default Settings;