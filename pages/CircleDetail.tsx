import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../context/AppContext';
import { communityCircles, HeartIcon } from '../constants';
import { CirclePost } from '../types';

const NewPostModal: React.FC<{
    circleId: string;
    onClose: () => void;
}> = ({ circleId, onClose }) => {
    const { t } = useTranslation();
    const { addPost, triggerHapticFeedback } = useAppContext();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) {
            setError(t('post_form_error_empty'));
            return;
        }
        setIsSubmitting(true);
        setError('');
        const result = await addPost({ circleId, title, content });
        if (result.success) {
            triggerHapticFeedback('medium');
            onClose();
        } else {
            setError(t('post_form_error_moderation', { reason: result.message }));
        }
        setIsSubmitting(false);
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-[var(--bg-surface)] rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-2xl text-[var(--text-secondary)]">&times;</button>
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">{t('post_form_title')}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder={t('post_form_title_placeholder')}
                        className="w-full p-3 bg-[var(--bg-muted)] rounded-lg border border-[var(--border-primary)] focus:ring-2 focus:ring-[var(--accent-primary)] focus:outline-none"
                        maxLength={100}
                        required
                    />
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={6}
                        placeholder={t('post_form_content_placeholder')}
                        className="w-full p-3 bg-[var(--bg-muted)] rounded-lg border border-[var(--border-primary)] focus:ring-2 focus:ring-[var(--accent-primary)] focus:outline-none"
                        required
                    />
                    {error && <p className="text-sm text-[var(--danger-text)]">{error}</p>}
                    <button type="submit" disabled={isSubmitting} className="w-full bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-[var(--text-on-accent)] font-bold py-3 px-6 rounded-lg transition disabled:opacity-50">
                        {isSubmitting ? t('post_form_submitting') : t('post_form_submit')}
                    </button>
                </form>
            </div>
        </div>
    );
};


const PostCard: React.FC<{ post: CirclePost }> = ({ post }) => {
    const { t } = useTranslation();
    const { comments } = useAppContext();
    const commentCount = comments.filter(c => c.postId === post.id).length;
    
    return (
        <Link to={`/posts/${post.id}`} className="block bg-[var(--bg-surface)] p-5 rounded-xl shadow-md hover:shadow-lg transition-shadow hover:-translate-y-1">
            <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[var(--bg-muted)] flex items-center justify-center font-bold text-[var(--text-secondary)] flex-shrink-0">
                    {post.authorName.charAt(0)}
                </div>
                <div className="flex-grow">
                    <h3 className="font-bold text-lg text-[var(--text-primary)] mb-1">{post.title}</h3>
                     <p className="text-xs text-[var(--text-secondary)] mb-2">By <b>{post.authorName}</b></p>
                    <p className="text-[var(--text-primary)] text-sm line-clamp-2 mb-4">{post.content}</p>
                    <div className="flex items-center gap-6 text-sm text-[var(--text-secondary)]">
                        <div className="flex items-center gap-1.5">
                            <HeartIcon filled={post.likes.length > 0} className={`h-5 w-5 ${post.likes.length > 0 ? 'text-red-500' : ''}`} />
                            <span>{t('likes_count_plural', { count: post.likes.length })}</span>
                        </div>
                         <div className="flex items-center gap-1.5">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" /></svg>
                            <span>{t('comments_count_plural', { count: commentCount })}</span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
};

const CircleDetail: React.FC = () => {
    const { circleId } = useParams<{ circleId: string }>();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { posts } = useAppContext();

    const [isModalOpen, setIsModalOpen] = useState(false);

    const circle = communityCircles.find(c => c.id === circleId);
    if (!circle) {
        navigate('/circles');
        return null;
    }

    const relevantPosts = posts
        .filter(p => p.circleId === circleId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return (
        <div className="relative min-h-full">
            {isModalOpen && <NewPostModal circleId={circle.id} onClose={() => setIsModalOpen(false)} />}
            
            <div className="space-y-6 pb-24">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">{t(circle.titleKey)}</h1>
                        <p className="text-lg text-[var(--text-secondary)]">{t(circle.descriptionKey)}</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {relevantPosts.length > 0 ? (
                        relevantPosts.map(post => <PostCard key={post.id} post={post} />)
                    ) : (
                        <div className="text-center py-16 bg-[var(--bg-surface)] rounded-2xl">
                            <p className="text-lg text-[var(--text-secondary)]">{t('circle_posts_empty')}</p>
                        </div>
                    )}
                </div>
            </div>

             <button
                onClick={() => setIsModalOpen(true)}
                className="fixed bottom-8 right-8 bg-[var(--accent-primary)] text-[var(--text-on-accent)] w-16 h-16 rounded-full shadow-2xl flex items-center justify-center text-3xl font-light hover:bg-[var(--accent-primary-hover)] transition transform hover:scale-110"
                aria-label={t('circle_new_post_button')}
            >
                +
            </button>
        </div>
    );
};

export default CircleDetail;