import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInAnonymously } from 'firebase/auth';
import { auth } from '../../services/firebase';
import { db } from '../../services/database';
import { useAppContext } from '../../context/AppContext';
import { User, Persona } from '../../types';
import { languageOptions, avatarOptions, personaOptions } from '../../constants';
import Confetti from '../ui/Confetti';

interface SignupWizardProps {
    onSwitchToLogin: () => void;
}

const SignupWizard: React.FC<SignupWizardProps> = ({ onSwitchToLogin }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { setLanguage, setPersona: setGlobalPersona } = useAppContext();
    
    const [step, setStep] = useState(1);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        avatar: '',
        persona: 'empathetic' as Persona,
        email: '',
        password: '',
    });
    
    const totalSteps = 4;

    const handleNextStep = () => setStep(prev => Math.min(prev + 1, totalSteps + 1));
    const handlePrevStep = () => setStep(prev => Math.max(prev - 1, 1));

    const handleLanguageSelect = (langCode: string) => {
        setLanguage(langCode as 'en' | 'hi' | 'bn');
        handleNextStep();
    };

    const handleSignup = async (isAnonymous: boolean) => {
        setIsLoading(true);
        setError('');
        setGlobalPersona(formData.persona);
        
        try {
            if (isAnonymous) {
                const userCredential = await signInAnonymously(auth);
                const newUser: User = {
                    uid: userCredential.user.uid,
                    name: formData.name || 'Guest',
                    email: null,
                    avatar: formData.avatar || '✨',
                    isAnonymous: true,
                };
                await db.createUserProfile(newUser);
            } else {
                const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
                const newUser: User = {
                    uid: userCredential.user.uid,
                    name: formData.name,
                    email: formData.email,
                    avatar: formData.avatar,
                    isAnonymous: false,
                };
                await db.createUserProfile(newUser);
            }
            setStep(5); // Success step
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const renderStep = () => {
        switch (step) {
            case 1: // Language Selection
                return (
                    <div className="text-center">
                        <h2 className="text-2xl font-bold mb-4">{t('signup_wizard_step1_title')}</h2>
                        <div className="grid grid-cols-1 gap-4">
                            {Object.entries(languageOptions).map(([code, { name, icon }]) => (
                                <button key={code} onClick={() => handleLanguageSelect(code)} className="w-full text-left p-4 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] rounded-lg text-lg font-semibold flex items-center transition">
                                    <span className="text-2xl mr-4">{icon}</span> {name}
                                </button>
                            ))}
                        </div>
                    </div>
                );
            case 2: // Nickname & Avatar
                return (
                    <div>
                        <h2 className="text-2xl font-bold mb-2">{t('signup_wizard_step2_title')}</h2>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            placeholder={t('signup_wizard_nickname_placeholder')}
                            className="w-full p-3 bg-[var(--bg-surface)]/50 border border-[var(--border-primary)] rounded-lg mb-4"
                        />
                        <h3 className="font-semibold mb-2">{t('signup_wizard_avatar_prompt')}</h3>
                        <div className="grid grid-cols-4 gap-4 mb-4">
                            {avatarOptions.map(avatar => (
                                <button key={avatar.id} onClick={() => setFormData({ ...formData, avatar: avatar.icon })} className={`text-4xl p-3 rounded-full transition-transform transform hover:scale-110 ${formData.avatar === avatar.icon ? 'bg-blue-200 dark:bg-blue-800 scale-110' : 'bg-[var(--bg-muted)]'}`}>
                                    {avatar.icon}
                                </button>
                            ))}
                        </div>
                        <button onClick={handleNextStep} disabled={!formData.name || !formData.avatar} className="w-full bg-gradient-to-r from-sky-500 to-indigo-500 text-white font-bold py-3 rounded-lg disabled:opacity-50">
                            {t('next')}
                        </button>
                    </div>
                );
            case 3: // Persona Selection
                return (
                    <div>
                        <h2 className="text-2xl font-bold mb-2">{t('signup_wizard_step3_title')}</h2>
                        <p className="text-sm text-[var(--text-secondary)] mb-4">{t('signup_wizard_step3_subtitle')}</p>
                        <div className="space-y-3">
                            {Object.values(personaOptions).map(p => (
                                <button key={p.id} onClick={() => { setFormData({ ...formData, persona: p.id }); handleNextStep(); }} className={`w-full text-left p-3 border-2 rounded-lg transition ${formData.persona === p.id ? 'border-[var(--accent-primary)] bg-[var(--bg-subtle)]' : 'border-transparent bg-[var(--bg-muted)] hover:bg-[var(--bg-surface-hover)]'}`}>
                                    <span className="text-2xl mr-2">{p.icon}</span>
                                    <span className="font-bold">{t(`persona_${p.id}_name`)}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                );
            case 4: // Credentials
                return (
                     <div>
                        <h2 className="text-2xl font-bold mb-2">{t('signup_wizard_step4_title')}</h2>
                        <p className="text-sm text-[var(--text-secondary)] mb-4">{t('signup_wizard_step4_subtitle')}</p>
                        {error && <p className="text-sm text-center text-red-500 bg-red-100 p-2 rounded-md mb-3">{error}</p>}
                        <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder={t('email_or_phone_placeholder')} className="w-full p-3 bg-[var(--bg-surface)]/50 border border-[var(--border-primary)] rounded-lg mb-3" />
                        <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder={t('password_placeholder')} className="w-full p-3 bg-[var(--bg-surface)]/50 border border-[var(--border-primary)] rounded-lg mb-4" />
                        <button onClick={() => handleSignup(false)} disabled={!formData.email || !formData.password || isLoading} className="w-full bg-gradient-to-r from-sky-500 to-indigo-500 text-white font-bold py-3 rounded-lg disabled:opacity-50">
                             {isLoading ? 'Creating...' : t('create_account_button')}
                        </button>
                        <div className="relative my-4">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[var(--border-primary)]"></div></div>
                            <div className="relative flex justify-center text-sm"><span className="px-2 bg-[var(--bg-primary)] text-[var(--text-secondary)]">{t('or_divider')}</span></div>
                        </div>
                        <button onClick={() => handleSignup(true)} disabled={isLoading} className="w-full bg-[var(--bg-muted)] text-[var(--text-primary)] font-bold py-3 rounded-lg disabled:opacity-50">
                            {isLoading ? 'Continuing...' : t('signup_wizard_anonymous_button')}
                        </button>
                    </div>
                );
            case 5: // Success
                return (
                    <div className="text-center space-y-4 animate-fade-in relative">
                        <Confetti />
                        <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                            {t('signup_success_title', { name: formData.name || 'Friend' })}
                        </h2>
                        <p className="text-[var(--text-secondary)]">{t('signup_success_subtitle')}</p>
                        <button onClick={() => navigate('/dashboard')} className="w-full bg-gradient-to-r from-sky-500 to-indigo-500 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:opacity-90 transition">
                            {t('go_to_dashboard')}
                        </button>
                    </div>
                );
            default:
                return null;
        }
    };
    
    return (
        <div className="space-y-4">
            {step <= totalSteps && (
                <>
                    <div className="mb-4">
                         <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full transition-all duration-500" style={{ width: `${((step - 1) / totalSteps) * 100}%` }}></div>
                        </div>
                        <p className="text-xs text-right text-[var(--text-secondary)] mt-1">{t('signup_wizard_progress', { step, total: totalSteps })}</p>
                    </div>
                    {renderStep()}
                </>
            )}
             {step > totalSteps && renderStep()}
            
            <p className="text-sm text-center text-[var(--text-secondary)] mt-4">
                {t('login_prompt')}
                <button onClick={onSwitchToLogin} className="font-semibold text-[var(--text-accent)] hover:underline ml-1">
                    {t('login_link')}
                </button>
            </p>
        </div>
    );
};
export default SignupWizard;