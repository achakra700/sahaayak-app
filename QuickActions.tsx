import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const QuickActionsWidget: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return(
     <div className="grid grid-cols-3 gap-4 text-center">
        <button onClick={() => navigate('/exercises')} className="p-4 bg-teal-100 dark:bg-teal-900 rounded-lg font-semibold text-teal-800 dark:text-teal-200 hover:bg-teal-200 dark:hover:bg-teal-800 transition-colors">{t('action_calm_me')}</button>
        <button onClick={() => navigate('/journal')} className="p-4 bg-indigo-100 dark:bg-indigo-900 rounded-lg font-semibold text-indigo-800 dark:text-indigo-200 hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors">{t('action_plan_study')}</button>
        <button onClick={() => navigate('/chat')} className="p-4 bg-sky-100 dark:bg-sky-900 rounded-lg font-semibold text-sky-800 dark:text-sky-200 hover:bg-sky-200 dark:hover:bg-sky-800 transition-colors">{t('action_talk_now')}</button>
    </div>
    );
};

export default QuickActionsWidget;
