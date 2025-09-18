import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

export const initializeI18n = async () => {
    try {
        const [en, hi, bn] = await Promise.all([
            fetch('./locales/en/translation.json').then(res => res.json()),
            fetch('./locales/hi/translation.json').then(res => res.json()),
            fetch('./locales/bn/translation.json').then(res => res.json())
        ]);

        const resources = {
            en: { translation: en },
            hi: { translation: hi },
            bn: { translation: bn }
        };

        return i18n
            .use(LanguageDetector)
            .use(initReactI18next)
            .init({
                resources,
                fallbackLng: 'en',
                detection: {
                    order: ['localStorage', 'navigator'],
                    caches: ['localStorage'],
                },
                interpolation: {
                    escapeValue: false,
                },
            });
    } catch (error) {
        console.error("Fatal: Failed to load translation files. The application cannot start.", error);
        // Fallback to a minimal English resource to prevent a total crash.
        const fallbackResources = {
            en: {
                translation: {
                    "login_title": "Welcome",
                    "loading_error": "Error loading application language."
                }
            }
        };
        return i18n
            .use(initReactI18next)
            .init({
                resources: fallbackResources,
                lng: 'en',
                fallbackLng: 'en',
                interpolation: {
                    escapeValue: false,
                }
            });
    }
};

export default i18n;