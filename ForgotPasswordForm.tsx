import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../services/firebase';

interface ForgotPasswordFormProps {
    onSwitchToLogin: () => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onSwitchToLogin }) => {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState<'form' | 'success'>('form');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            await sendPasswordResetEmail(auth, email);
            setStep('success');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (step === 'success') {
        return (
            <div className="text-center space-y-4 animate-fade-in">
                <div className="text-5xl">💌</div>
                <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                    {t('forgot_password_success_title')}
                </h2>
                <p className="text-[var(--text-secondary)]">
                    {t('forgot_password_success_subtitle', { email })}
                </p>
                <button 
                    onClick={onSwitchToLogin}
                    className="w-full bg-gradient-to-r from-sky-500 to-indigo-500 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:opacity-90 transition"
                >
                    {t('back_to_login')}
                </button>
            </div>
        );
    }
    
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center md:text-left text-[var(--text-primary)]">
                {t('forgot_password_title')}
            </h2>
             <p className="text-sm text-center md:text-left text-[var(--text-secondary)]">
                {t('forgot_password_subtitle')}
            </p>
            {error && <p className="text-sm text-center text-red-500 bg-red-100 p-2 rounded-md">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--text-secondary)]">✉️</span>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t('email_or_phone_placeholder')}
                        className="w-full pl-10 pr-4 py-3 bg-[var(--bg-surface)]/50 text-[var(--text-primary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] transition"
                        required
                    />
                </div>
                
                <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-sky-500 to-indigo-500 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:opacity-90 transition transform hover:scale-105 disabled:opacity-50">
                    {isLoading ? 'Sending...' : t('send_reset_link_button')}
                </button>
            </form>

            <p className="text-sm text-center">
                <button type="button" onClick={onSwitchToLogin} className="font-semibold text-[var(--text-accent)] hover:underline">
                    {t('back_to_login')}
                </button>
            </p>
        </div>
    );
};
export default ForgotPasswordForm;