import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../context/AppContext';

const navLinks = [
    { to: '/dashboard', labelKey: 'nav_dashboard', icon: '🏠' },
    { to: '/chat', labelKey: 'nav_chat', icon: '🤝' },
    { to: '/journal', labelKey: 'nav_journal', icon: '✍️' },
    { to: '/exercises', labelKey: 'nav_exercises', icon: '🧘' },
    { to: '/mood-history', labelKey: 'nav_mood_history', icon: '📊' },
    { to: '/journeys', labelKey: 'nav_journeys', icon: '🌱' },
    { to: '/circles', labelKey: 'nav_community', icon: '💬' },
    { to: '/intentions', labelKey: 'nav_intentions', icon: '🎯' },
    { to: '/settings', labelKey: 'nav_settings', icon: '⚙️' },
    { to: '/emergency', labelKey: 'nav_emergency', icon: '🆘', isEmergency: true },
];

const AuthenticatedLayout: React.FC = () => {
    const { t } = useTranslation();
    const { user } = useAppContext();

    return (
        <div className="flex h-screen bg-[var(--bg-primary)]">
            <aside className="w-64 bg-[var(--bg-surface)] flex flex-col p-4 border-r border-[var(--border-primary)] shadow-lg">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-center text-[var(--text-primary)]">{t('appName')}</h1>
                </div>
                <nav className="flex-grow">
                    <ul>
                        {navLinks.map(link => (
                            <li key={link.to}>
                                <NavLink
                                    to={link.to}
                                    className={({ isActive }) =>
                                        `flex items-center p-3 my-1 rounded-lg transition-colors ${
                                            isActive
                                                ? 'bg-[var(--accent-primary)] text-[var(--text-on-accent)] font-bold'
                                                : `text-[var(--text-secondary)] hover:bg-[var(--bg-muted)] ${link.isEmergency ? 'text-[var(--danger-text)]' : ''}`
                                        }`
                                    }
                                >
                                    <span className="mr-3 text-xl">{link.icon}</span>
                                    {t(link.labelKey)}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>
                <div className="mt-auto">
                     <NavLink to="/settings" className="flex items-center p-3 rounded-lg hover:bg-[var(--bg-muted)]">
                        <div className="w-10 h-10 rounded-full bg-[var(--bg-muted)] flex items-center justify-center font-bold text-[var(--text-secondary)] flex-shrink-0">
                            {user?.avatar || user?.name?.charAt(0).toUpperCase() || 'G'}
                        </div>
                        <div className="ml-3">
                            <p className="font-bold text-[var(--text-primary)]">{user?.name || 'Guest'}</p>
                        </div>
                    </NavLink>
                </div>
            </aside>
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                <Outlet />
            </main>
        </div>
    );
};

export default AuthenticatedLayout;