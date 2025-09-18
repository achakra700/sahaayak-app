import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../services/firebase';
import { EyeIcon, EyeOffIcon } from '../../constants';

interface LoginFormProps {
    onSwitchToSignup: () => void;
    onSwitchToForgotPassword: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToSignup, onSwitchToForgotPassword }) => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center md:text-left text-[var(--text-primary)]">
                {t('login_welcome_back')}
            </h2>

            {error && <p className="text-sm text-center text-red-500 bg-red-100 p-2 rounded-md">{error}</p>}

            <form onSubmit={handleEmailLogin} className="space-y-4">
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--text-secondary)]">👤</span>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t('email_or_phone_placeholder')}
                        className="w-full pl-10 pr-4 py-3 bg-[var(--bg-surface)]/50 text-[var(--text-primary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] transition"
                        required
                    />
                </div>
                <div className="relative">
                     <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--text-secondary)]">🔒</span>
                    <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={t('password_placeholder')}
                        className="w-full pl-10 pr-10 py-3 bg-[var(--bg-surface)]/50 text-[var(--text-primary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] transition"
                        required
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-[var(--text-secondary)]">
                        {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                </div>
                <div className="text-right">
                    <button type="button" onClick={onSwitchToForgotPassword} className="text-sm font-medium text-[var(--text-accent)] hover:underline">{t('forgot_password')}</button>
                </div>
                <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-sky-500 to-indigo-500 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:opacity-90 transition transform hover:scale-105 disabled:opacity-50">
                    {isLoading ? 'Logging in...' : t('login_button')}
                </button>
            </form>

            <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[var(--border-primary)]"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-[var(--bg-primary)] text-[var(--text-secondary)]">{t('or_divider')}</span>
                </div>
            </div>
            
             <button disabled className="w-full flex items-center justify-center bg-white dark:bg-slate-200 text-gray-700 font-semibold py-3 px-4 rounded-lg shadow-sm border border-gray-300 dark:border-transparent hover:bg-gray-50 dark:hover:bg-slate-300 transition opacity-50 cursor-not-allowed">
                <svg className="w-5 h-5 mr-3" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path><path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"></path><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"></path><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C44.438 36.372 48 30.656 48 24c0-1.341-.138-2.65-.389-3.917z"></path></svg>
                {t('login_with_google')}
            </button>

            <p className="text-sm text-center text-[var(--text-secondary)]">
                {t('signup_prompt')}
                <button onClick={onSwitchToSignup} className="font-semibold text-[var(--text-accent)] hover:underline ml-1">
                    {t('signup_link')}
                </button>
            </p>
        </div>
    );
};
export default LoginForm;