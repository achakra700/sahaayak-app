import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../context/AppContext';
import { Language } from '../types';
import { languageOptions } from '../constants';
import LoginForm from '../components/authentication/LoginForm';
import SignupWizard from '../components/authentication/SignupWizard';
import AuthIllustration from '../components/authentication/AuthIllustration';
import ForgotPasswordForm from '../components/authentication/ForgotPasswordForm';

const Auth: React.FC = () => {
    const { t } = useTranslation();
    const [view, setView] = useState<'login' | 'signup' | 'forgotPassword'>('login');
    const { language, setLanguage } = useAppContext();

    const renderView = () => {
        switch (view) {
            case 'signup':
                return <SignupWizard onSwitchToLogin={() => setView('login')} />;
            case 'forgotPassword':
                return <ForgotPasswordForm onSwitchToLogin={() => setView('login')} />;
            case 'login':
            default:
                return <LoginForm onSwitchToSignup={() => setView('signup')} onSwitchToForgotPassword={() => setView('forgotPassword')} />;
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[var(--gradient-start)] via-[var(--gradient-via)] to-[var(--gradient-end)] relative overflow-hidden">
            <div className="absolute top-4 right-4 z-20">
                <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as Language)}
                    className="bg-[var(--bg-surface)]/50 text-[var(--text-primary)] font-semibold py-2 pl-3 pr-8 rounded-full appearance-none border border-[var(--glass-border-color)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                    aria-label={t('language')}
                >
                    {Object.entries(languageOptions).map(([code, { name, icon }]) => (
                        <option key={code} value={code}>{icon} {name}</option>
                    ))}
                </select>
            </div>
            
            <div className="w-full max-w-4xl glassmorphism rounded-3xl shadow-2xl flex overflow-hidden">
                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                    <div className="mb-6 text-center md:text-left">
                        <h1 className="text-3xl font-bold text-[var(--text-primary)]">
                           {t('appName')}
                        </h1>
                        <p className="text-[var(--text-secondary)]">{t('tagline')}</p>
                    </div>
                     <div key={view} className="animate-fade-in">
                        {renderView()}
                    </div>
                </div>
                <div className="hidden md:flex w-1/2 bg-gradient-to-br from-sky-100 to-indigo-200 dark:from-slate-800 dark:to-indigo-900 items-center justify-center p-8">
                   <AuthIllustration />
                </div>
            </div>
        </div>
    );
};

export default Auth;