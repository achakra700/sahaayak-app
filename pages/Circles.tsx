import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { communityCircles } from '../constants';

const Circles: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { posts } = useAppContext();

    return (
        <div className="space-y-8">
            <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">{t('circles_page_title')}</h1>
            <p className="text-lg text-[var(--text-secondary)]">{t('circles_page_subtitle')}</p>
            
            <div className="grid md:grid-cols-2 gap-8">
                {communityCircles.map(circle => {
                    const postCount = posts.filter(p => p.circleId === circle.id).length;
                    
                    return (
                        <div key={circle.id} className="bg-[var(--bg-surface)] p-6 rounded-2xl shadow-lg flex flex-col cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all" onClick={() => navigate(`/circles/${circle.id}`)}>
                            <div className="flex items-center mb-4">
                                <span className="text-4xl mr-4">{circle.icon}</span>
                                <div>
                                    <h2 className="text-xl font-bold">{t(circle.titleKey)}</h2>
                                    <p className="text-sm font-semibold text-[var(--text-secondary)]">{t('post_count_plural', { count: postCount })}</p>
                                </div>
                            </div>
                            <p className="text-[var(--text-secondary)] flex-grow mb-6">{t(circle.descriptionKey)}</p>
                             <span className="font-bold text-[var(--text-accent)] self-start">{t('circles_join_discussion')} &rarr;</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Circles;