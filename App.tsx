import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { AppProvider, useAppContext } from './context/AppContext';
import { auth } from './services/firebase';
import { db } from './services/database';
import Auth from './pages/Authentic';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import Exercises from './pages/Exercises';
import MoodHistory from './pages/MoodHistory';
import Journal from './pages/Journal';
import Emergency from './pages/Emergency';
import Settings from './pages/Settings';
import Journeys from './pages/Journeys';
import JourneyDetail from './pages/JourneyDetail';
import Circles from './pages/Circles';
import CircleDetail from './pages/CircleDetail';
import PostDetail from './pages/PostDetail';
import Intentions from './pages/Intentions';
import AuthenticatedLayout from './components/AuthenticatedLayout';

const NotificationScheduler: React.FC = () => {
    const { moodReminderEnabled, user, quietHours } = useAppContext();
    const { t } = useTranslation();

    useEffect(() => {
        if (!moodReminderEnabled || !user || typeof Notification === 'undefined' || Notification.permission !== 'granted') {
            return;
        }

        const isWithinQuietHours = () => {
            if (!quietHours.enabled) return false;
            const now = new Date();
            const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
            const { start, end } = quietHours;
        
            if (start > end) {
                return currentTime >= start || currentTime < end;
            } else {
                return currentTime >= start && currentTime < end;
            }
        };

        if (isWithinQuietHours()) return;

        // This is a conceptual implementation. Real-world scheduling is complex.
        // We'll simulate a check for this session.
        // A robust solution would use a service worker.
        
        console.log("Notification scheduler is active for this session.");

    }, [moodReminderEnabled, user, t, quietHours]);

    return null;
};


const AppRoutes: React.FC = () => {
    const { isAuthenticated, theme, login, logout, user } = useAppContext();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
            if (firebaseUser) {
                let userProfile = await db.getUserProfile(firebaseUser.uid);
                
                // If profile doesn't exist (e.g., anonymous user first time), create a basic one
                if (!userProfile) {
                    const basicProfile = {
                        uid: firebaseUser.uid,
                        name: firebaseUser.displayName || (firebaseUser.isAnonymous ? 'Guest' : 'New User'),
                        email: firebaseUser.email,
                        isAnonymous: firebaseUser.isAnonymous,
                        avatar: '✨'
                    };
                    await db.createUserProfile(basicProfile);
                    userProfile = basicProfile;
                }

                if (!user || user.uid !== userProfile.uid) {
                    login(userProfile);
                }

            } else {
                logout();
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [login, logout, user]);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);
    
    if (isLoading) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }

    return (
        <div className="bg-[var(--bg-secondary)] text-[var(--text-primary)] min-h-screen">
            {isAuthenticated && <NotificationScheduler />}
            <Routes>
                <Route path="/" element={!isAuthenticated ? <Navigate to="/auth" /> : <Navigate to="/dashboard" />} />
                
                <Route path="/auth" element={!isAuthenticated ? <Auth /> : <Navigate to="/dashboard" />} />
                
                {isAuthenticated ? (
                    <Route element={<AuthenticatedLayout />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/exercises" element={<Exercises />} />
                        <Route path="/journeys" element={<Journeys />} />
                        <Route path="/journeys/:journeyId" element={<JourneyDetail />} />
                        <Route path="/circles" element={<Circles />} />
                        <Route path="/circles/:circleId" element={<CircleDetail />} />
                        <Route path="/posts/:postId" element={<PostDetail />} />
                        <Route path="/mood-history" element={<MoodHistory />} />
                        <Route path="/journal" element={<Journal />} />
                        <Route path="/intentions" element={<Intentions />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/emergency" element={<Emergency />} />
                    </Route>
                ) : <Route path="/*" element={<Navigate to="/auth" />} /> }
                
                <Route path="/chat" element={isAuthenticated ? <Chat /> : <Navigate to="/auth" />} />
                
                <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/auth"} />} />
            </Routes>
        </div>
    );
}

const App: React.FC = () => {
  return (
    <AppProvider>
        <HashRouter>
            <AppRoutes />
        </HashRouter>
    </AppProvider>
  );
};

export default App;