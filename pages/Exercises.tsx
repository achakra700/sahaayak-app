import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { affirmationKeys } from '../constants';
import { useAppContext } from '../context/AppContext';

const BreathingExercise: React.FC = () => {
    const { t } = useTranslation();
    const { triggerHapticFeedback } = useAppContext();
    type Phase = 'initial' | 'ready' | 'inhale' | 'hold' | 'exhale';
    const [phase, setPhase] = useState<Phase>('initial');
    const [isActive, setIsActive] = useState(false);

    // Defines the properties for each phase of the breathing cycle
    const phaseConfig: Record<Phase, { textKey: string; scale: string; durationMs: number; nextPhase: Phase }> = {
        initial: { textKey: 'breathing_initial_prompt', scale: 'scale-100', durationMs: 0, nextPhase: 'ready' },
        ready: { textKey: 'breathing_ready', scale: 'scale-100', durationMs: 2000, nextPhase: 'inhale' },
        inhale: { textKey: 'breathing_inhale', scale: 'scale-150', durationMs: 4000, nextPhase: 'hold' },
        hold: { textKey: 'breathing_hold', scale: 'scale-150', durationMs: 4000, nextPhase: 'exhale' },
        exhale: { textKey: 'breathing_exhale', scale: 'scale-100', durationMs: 6000, nextPhase: 'inhale' },
    };

    useEffect(() => {
        if (!isActive || phase === 'initial') {
            return;
        }

        const { durationMs, nextPhase } = phaseConfig[phase];
        if (durationMs === 0) return;

        // Automatically transition to the next phase after the current phase's duration
        const timer = setTimeout(() => {
            setPhase(nextPhase);
        }, durationMs);

        return () => clearTimeout(timer); // Cleanup timer on component unmount or phase change
    }, [phase, isActive]);

    const handleToggle = () => {
        triggerHapticFeedback('medium');
        if (isActive) {
            setIsActive(false);
            setPhase('initial');
        } else {
            setIsActive(true);
            setPhase('ready');
        }
    };
    
    const { textKey, scale } = phaseConfig[phase];
    // The transition duration should match the phase duration for a smooth visual guide
    const transitionDuration = phase === 'inhale' ? 4000 : (phase === 'exhale' ? 6000 : 1500);

    return (
        <div className="text-center p-6 flex flex-col items-center justify-center h-80">
            <div className="flex-grow flex items-center justify-center w-full">
                <div 
                    className={`w-48 h-48 bg-sky-200 dark:bg-sky-800 rounded-full flex items-center justify-center transition-transform ease-in-out ${scale}`}
                    style={{ transitionDuration: `${transitionDuration}ms` }}
                >
                    <p className="text-sky-800 dark:text-sky-200 font-semibold text-xl text-center px-4">
                        {t(textKey)}
                    </p>
                </div>
            </div>
            <button
                onClick={handleToggle}
                className={`mt-4 w-3/4 sm:w-auto px-8 py-3 font-bold text-white rounded-full shadow-lg transition-all transform hover:scale-105 ${isActive ? 'bg-[var(--danger-secondary)] hover:bg-[var(--danger-primary)]' : 'bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)]'}`}
            >
                {isActive ? t('breathing_stop') : t('breathing_start')}
            </button>
        </div>
    );
};

const GroundingExercise: React.FC = () => {
    const { t } = useTranslation();
    const { triggerHapticFeedback } = useAppContext();
    const steps = [
        t('grounding_step1'),
        t('grounding_step2'),
        t('grounding_step3'),
        t('grounding_step4'),
        t('grounding_step5'),
    ];
    const [currentStep, setCurrentStep] = useState(0);

    return (
        <div className="p-6">
            <h3 className="text-lg font-semibold text-center mb-4">5-4-3-2-1 Grounding Technique</h3>
            <div className="bg-[var(--bg-muted)] p-6 rounded-lg min-h-[100px] flex items-center justify-center text-center">
                <p className="text-xl">{steps[currentStep]}</p>
            </div>
            <div className="flex justify-between mt-4">
                <button 
                    onClick={() => {
                        setCurrentStep(s => Math.max(0, s - 1));
                        triggerHapticFeedback('light');
                    }} 
                    disabled={currentStep === 0}
                    className="px-4 py-2 bg-[var(--bg-muted)] rounded disabled:opacity-50">
                    {t('prev')}
                </button>
                <button 
                    onClick={() => {
                        setCurrentStep(s => Math.min(steps.length - 1, s + 1));
                        triggerHapticFeedback('light');
                    }} 
                    disabled={currentStep === steps.length - 1}
                    className="px-4 py-2 bg-[var(--accent-primary)] text-[var(--text-on-accent)] rounded disabled:opacity-50">
                    {t('next')}
                </button>
            </div>
        </div>
    );
}

const AffirmationsCarousel: React.FC = () => {
    const { t } = useTranslation();
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleNext = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % affirmationKeys.length);
    };

    const handlePrev = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + affirmationKeys.length) % affirmationKeys.length);
    };

    return (
        <div className="relative flex flex-col items-center justify-center h-64 p-6 bg-gradient-to-br from-purple-100 to-indigo-200 dark:from-purple-900/50 dark:to-indigo-900/50">
            <p className="text-center text-2xl font-semibold text-gray-800 dark:text-gray-200">
                "{t(affirmationKeys[currentIndex])}"
            </p>
            <div className="absolute bottom-4 flex justify-center w-full space-x-8">
                <button onClick={handlePrev} className="text-3xl text-gray-600 dark:text-gray-300 hover:scale-125 transition-transform">‹</button>
                <button onClick={handleNext} className="text-3xl text-gray-600 dark:text-gray-300 hover:scale-125 transition-transform">›</button>
            </div>
        </div>
    );
};

const ThoughtTracker: React.FC = () => {
    const { t } = useTranslation();
    const { triggerHapticFeedback } = useAppContext();
    const [step, setStep] = useState(1);
    const [negativeThought, setNegativeThought] = useState('');
    const [challenge, setChallenge] = useState('');
    const [reframe, setReframe] = useState('');

    const reset = () => {
        setStep(1);
        setNegativeThought('');
        setChallenge('');
        setReframe('');
    };

    return (
        <div className="p-6">
            {step === 1 && (
                <div>
                    <h3 className="font-bold text-lg mb-2">{t('thought_tracker_step1_title')}</h3>
                    <p className="text-sm text-[var(--text-secondary)] mb-4">{t('thought_tracker_step1_prompt')}</p>
                    <textarea value={negativeThought} onChange={e => setNegativeThought(e.target.value)} rows={3} className="w-full p-2 bg-[var(--bg-muted)] rounded-md border border-[var(--border-primary)]" />
                    <button onClick={() => { setStep(2); triggerHapticFeedback('light'); }} disabled={!negativeThought} className="mt-4 w-full bg-[var(--accent-primary)] text-[var(--text-on-accent)] font-bold py-2 rounded-md disabled:opacity-50">{t('next')}</button>
                </div>
            )}
            {step === 2 && (
                <div>
                    <h3 className="font-bold text-lg mb-2">{t('thought_tracker_step2_title')}</h3>
                    <p className="text-sm text-[var(--text-secondary)] mb-4">{t('thought_tracker_step2_prompt')}</p>
                    <div className="p-3 mb-4 border-l-4 border-red-400 bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200">"{negativeThought}"</div>
                    <textarea value={challenge} onChange={e => setChallenge(e.target.value)} rows={3} className="w-full p-2 bg-[var(--bg-muted)] rounded-md border border-[var(--border-primary)]" />
                    <div className="flex gap-4 mt-4">
                        <button onClick={() => setStep(1)} className="w-full bg-[var(--bg-muted)] font-bold py-2 rounded-md">{t('back')}</button>
                        <button onClick={() => { setStep(3); triggerHapticFeedback('light'); }} disabled={!challenge} className="w-full bg-[var(--accent-primary)] text-[var(--text-on-accent)] font-bold py-2 rounded-md disabled:opacity-50">{t('next')}</button>
                    </div>
                </div>
            )}
             {step === 3 && (
                <div>
                    <h3 className="font-bold text-lg mb-2">{t('thought_tracker_step3_title')}</h3>
                    <p className="text-sm text-[var(--text-secondary)] mb-4">{t('thought_tracker_step3_prompt')}</p>
                    <textarea value={reframe} onChange={e => setReframe(e.target.value)} rows={3} className="w-full p-2 bg-[var(--bg-muted)] rounded-md border border-[var(--border-primary)]" />
                    <div className="flex gap-4 mt-4">
                        <button onClick={() => setStep(2)} className="w-full bg-[var(--bg-muted)] font-bold py-2 rounded-md">{t('back')}</button>
                        <button onClick={() => { setStep(4); triggerHapticFeedback('medium'); }} disabled={!reframe} className="w-full bg-green-500 text-white font-bold py-2 rounded-md disabled:opacity-50">{t('thought_tracker_complete')}</button>
                    </div>
                </div>
            )}
             {step === 4 && (
                <div className="text-center">
                    <h3 className="font-bold text-lg text-green-600 dark:text-green-400">{t('thought_tracker_done_title')}</h3>
                    <p className="mt-2 text-[var(--text-primary)]">{t('thought_tracker_done_subtitle')}</p>
                    <div className="mt-4 text-left p-3 bg-green-50 dark:bg-green-900/30 rounded-md">
                        <p className="font-semibold text-green-800 dark:text-green-200">{t('thought_tracker_new_thought')}</p>
                        <p>"{reframe}"</p>
                    </div>
                    <button onClick={reset} className="mt-6 w-full bg-[var(--accent-primary)] text-[var(--text-on-accent)] font-bold py-2 rounded-md">{t('thought_tracker_start_again')}</button>
                </div>
            )}
        </div>
    );
};

const GuidedMeditation: React.FC = () => {
    const { t } = useTranslation();
    const { triggerHapticFeedback } = useAppContext();
    const audioRef = useRef<HTMLAudioElement>(null);
    
    const meditationPhases = useRef([
        { titleKey: 'meditation_step_1_title', textKey: 'meditation_step_1_text', duration: 30 },
        { titleKey: 'meditation_step_2_title', textKey: 'meditation_step_2_text', duration: 60 },
        { titleKey: 'meditation_step_3_title', textKey: 'meditation_step_3_text', duration: 90 },
        { titleKey: 'meditation_step_4_title', textKey: 'meditation_step_4_text', duration: 60 },
        { titleKey: 'meditation_step_5_title', textKey: 'meditation_step_5_text', duration: 30 },
        { titleKey: 'meditation_step_6_title', textKey: 'meditation_step_6_text', duration: 30 },
    ]).current;

    const totalDuration = meditationPhases.reduce((sum, phase) => sum + phase.duration, 0);

    const [isActive, setIsActive] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [volume, setVolume] = useState(0.7);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval> | null = null;
        if (isActive && !isPaused) {
            interval = setInterval(() => {
                setTimeElapsed(prev => {
                    if (prev + 1 >= totalDuration) {
                        setIsActive(false);
                        if (audioRef.current) audioRef.current.pause();
                        return totalDuration;
                    }
                    return prev + 1;
                });
            }, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isActive, isPaused, totalDuration]);
    
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    const getCurrentPhase = () => {
        let elapsed = 0;
        for (let i = 0; i < meditationPhases.length; i++) {
            elapsed += meditationPhases[i].duration;
            if (timeElapsed < elapsed) {
                return meditationPhases[i];
            }
        }
        return null;
    };

    const currentPhase = getCurrentPhase();
    const isComplete = !isActive && timeElapsed >= totalDuration;

    const handleStartPause = () => {
        triggerHapticFeedback('light');
        if (!isActive) { // Starting for the first time
            setIsActive(true);
            setIsPaused(false);
            audioRef.current?.play();
        } else { // Pausing or Resuming
            const newPausedState = !isPaused;
            setIsPaused(newPausedState);
            if (newPausedState) {
                audioRef.current?.pause();
            } else {
                audioRef.current?.play();
            }
        }
    };

    const handleReset = () => {
        triggerHapticFeedback('light');
        setIsActive(false);
        setIsPaused(false);
        setTimeElapsed(0);
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
    };
    
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    return (
        <div className="p-6 text-center flex flex-col items-center justify-between min-h-[24rem]">
             <audio ref={audioRef} src="https://cdn.pixabay.com/audio/2022/11/17/audio_8b24b22b6b.mp3" loop />
             <style>{`
                @keyframes gentle-pulse {
                    0%, 100% { transform: scale(1); opacity: 0.7; }
                    50% { transform: scale(1.05); opacity: 1; }
                }
                .pulse-animation {
                    animation: gentle-pulse 5s infinite ease-in-out;
                }
            `}</style>
            <div className="flex-grow flex flex-col items-center justify-center">
                <div className={`w-32 h-32 mb-4 rounded-full flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/50 ${isActive && !isPaused ? 'pulse-animation' : ''}`}>
                    <span className="text-5xl">🧘</span>
                </div>
                {isComplete ? (
                    <h3 className="font-bold text-xl text-green-600 dark:text-green-400">{t('meditation_complete')}</h3>
                ) : currentPhase ? (
                    <div>
                        <h3 className="font-bold text-lg text-[var(--text-primary)]">{t(currentPhase.titleKey)}</h3>
                        <p className="text-[var(--text-secondary)] mt-2">{t(currentPhase.textKey)}</p>
                    </div>
                ) : (
                    <p className="text-[var(--text-secondary)]">{t('meditation_initial_prompt')}</p>
                )}
            </div>

            <div className="w-full">
                <p className="text-2xl font-mono my-2 text-[var(--text-secondary)]">
                    {formatTime(totalDuration - timeElapsed)}
                </p>
                 <div className="w-full max-w-xs mx-auto my-4">
                    <div className="flex items-center justify-center gap-2 text-[var(--text-secondary)]">
                        <span className="text-xl">🔇</span>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={volume}
                            onChange={(e) => setVolume(parseFloat(e.target.value))}
                            className="w-full h-2 bg-[var(--bg-muted)] rounded-lg appearance-none cursor-pointer"
                            aria-label={t('volume_control_label')}
                        />
                        <span className="text-xl">🔊</span>
                    </div>
                </div>
                <div className="flex justify-center gap-4">
                    <button
                        onClick={handleStartPause}
                        disabled={isComplete}
                        className="px-8 py-3 font-bold text-[var(--text-on-accent)] rounded-full shadow-lg transition-all transform hover:scale-105 bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] disabled:bg-gray-400"
                    >
                        {!isActive ? t('meditation_start') : isPaused ? t('meditation_resume') : t('meditation_pause')}
                    </button>
                    {(isActive || isComplete) && (
                        <button
                            onClick={handleReset}
                            className="px-8 py-3 font-bold text-[var(--text-primary)] bg-[var(--bg-muted)] hover:bg-[var(--bg-surface-hover)] rounded-full shadow-lg transition-all"
                        >
                            {t('meditation_reset')}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

const ProgressiveMuscleRelaxation: React.FC = () => {
    const { t } = useTranslation();
    const { triggerHapticFeedback } = useAppContext();
    const steps = [
        { titleKey: 'pmr_step1_title', descKey: 'pmr_step1_desc' },
        { titleKey: 'pmr_step2_title', descKey: 'pmr_step2_desc' },
        { titleKey: 'pmr_step3_title', descKey: 'pmr_step3_desc' },
        { titleKey: 'pmr_step4_title', descKey: 'pmr_step4_desc' },
        { titleKey: 'pmr_step5_title', descKey: 'pmr_step5_desc' },
        { titleKey: 'pmr_step6_title', descKey: 'pmr_step6_desc' },
        { titleKey: 'pmr_step7_title', descKey: 'pmr_step7_desc' },
    ];
    const [currentStep, setCurrentStep] = useState(-1); // -1 for introduction

    const handleNext = () => {
        setCurrentStep(s => Math.min(steps.length - 1, s + 1));
        triggerHapticFeedback('light');
    };

    const handlePrev = () => {
        setCurrentStep(s => Math.max(-1, s - 1));
        triggerHapticFeedback('light');
    };

    return (
        <div className="p-6">
            <div className="bg-[var(--bg-muted)] p-6 rounded-lg min-h-[150px] flex flex-col items-center justify-center text-center">
                {currentStep === -1 ? (
                    <p>{t('pmr_intro_text')}</p>
                ) : (
                    <>
                        <h4 className="font-bold text-lg mb-2">{t(steps[currentStep].titleKey)}</h4>
                        <p className="whitespace-pre-wrap">{t(steps[currentStep].descKey)}</p>
                    </>
                )}
            </div>
            {currentStep === -1 ? (
                 <button onClick={handleNext} className="mt-4 w-full bg-[var(--accent-primary)] text-[var(--text-on-accent)] font-bold py-2 rounded-md">
                     {t('breathing_start')}
                 </button>
            ) : (
                <div className="flex justify-between mt-4">
                    <button onClick={handlePrev} className="px-4 py-2 bg-[var(--bg-muted)] rounded">
                        {t('prev')}
                    </button>
                    {currentStep < steps.length - 1 ? (
                         <button onClick={handleNext} className="px-4 py-2 bg-[var(--accent-primary)] text-[var(--text-on-accent)] rounded">
                            {t('next')}
                        </button>
                    ) : (
                        <button onClick={() => setCurrentStep(-1)} className="px-4 py-2 bg-green-500 text-white rounded">
                            {t('thought_tracker_start_again')}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

const MindfulBodyScan: React.FC = () => {
    const { t } = useTranslation();
    const { triggerHapticFeedback } = useAppContext();
    const steps = [
        { titleKey: 'bodyscan_step1_title', descKey: 'bodyscan_step1_desc' },
        { titleKey: 'bodyscan_step2_title', descKey: 'bodyscan_step2_desc' },
        { titleKey: 'bodyscan_step3_title', descKey: 'bodyscan_step3_desc' },
        { titleKey: 'bodyscan_step4_title', descKey: 'bodyscan_step4_desc' },
        { titleKey: 'bodyscan_step5_title', descKey: 'bodyscan_step5_desc' },
        { titleKey: 'bodyscan_step6_title', descKey: 'bodyscan_step6_desc' },
        { titleKey: 'bodyscan_step7_title', descKey: 'bodyscan_step7_desc' },
    ];
    const [currentStep, setCurrentStep] = useState(-1);

    const handleNext = () => {
        setCurrentStep(s => Math.min(steps.length - 1, s + 1));
        triggerHapticFeedback('light');
    };

    const handlePrev = () => {
        setCurrentStep(s => Math.max(-1, s - 1));
        triggerHapticFeedback('light');
    };

    return (
        <div className="p-6">
            <div className="bg-[var(--bg-muted)] p-6 rounded-lg min-h-[150px] flex flex-col items-center justify-center text-center">
                {currentStep === -1 ? (
                    <p>{t('bodyscan_intro_text')}</p>
                ) : (
                    <>
                        <h4 className="font-bold text-lg mb-2">{t(steps[currentStep].titleKey)}</h4>
                        <p className="whitespace-pre-wrap">{t(steps[currentStep].descKey)}</p>
                    </>
                )}
            </div>
            {currentStep === -1 ? (
                 <button onClick={handleNext} className="mt-4 w-full bg-[var(--accent-primary)] text-[var(--text-on-accent)] font-bold py-2 rounded-md">
                     {t('breathing_start')}
                 </button>
            ) : (
                <div className="flex justify-between mt-4">
                    <button onClick={handlePrev} className="px-4 py-2 bg-[var(--bg-muted)] rounded">
                        {t('prev')}
                    </button>
                    {currentStep < steps.length - 1 ? (
                         <button onClick={handleNext} className="px-4 py-2 bg-[var(--accent-primary)] text-[var(--text-on-accent)] rounded">
                            {t('next')}
                        </button>
                    ) : (
                        <button onClick={() => setCurrentStep(-1)} className="px-4 py-2 bg-green-500 text-white rounded">
                            {t('thought_tracker_start_again')}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};


const ExerciseCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-[var(--bg-surface)] rounded-2xl shadow-lg overflow-hidden">
        <h2 className="text-xl font-bold p-6 bg-[var(--bg-subtle)]">{title}</h2>
        <div className="p-0 sm:p-4">{children}</div>
    </div>
);


const Exercises: React.FC = () => {
    const { t } = useTranslation();
    return (
        <div className="space-y-8">
            <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">{t('exercises_title')}</h1>
            <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-8">
                <ExerciseCard title={t('exercise_breathing_title')}>
                    <BreathingExercise />
                </ExerciseCard>
                <ExerciseCard title={t('exercise_meditation_title')}>
                    <GuidedMeditation />
                </ExerciseCard>
                <ExerciseCard title={t('exercise_grounding_title')}>
                    <GroundingExercise />
                </ExerciseCard>
                 <ExerciseCard title={t('exercise_affirmations_title')}>
                    <AffirmationsCarousel />
                </ExerciseCard>
                 <ExerciseCard title={t('exercise_thoughts_title')}>
                    <ThoughtTracker />
                </ExerciseCard>
                <ExerciseCard title={t('exercise_pmr_title')}>
                    <ProgressiveMuscleRelaxation />
                </ExerciseCard>
                <ExerciseCard title={t('exercise_bodyscan_title')}>
                    <MindfulBodyScan />
                </ExerciseCard>
            </div>
        </div>
    );
};

export default Exercises;