import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../context/AppContext';
import { HeartIcon } from '../constants';

const PostDetail: React.FC = () => {
    const { postId } = useParams<{ postId: string }>();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { posts, comments, addComment, triggerHapticFeedback, user, togglePostLike, toggleCommentLike } = useAppContext();

    const [commentContent, setCommentContent] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const post = posts.find(p => p.id === postId);
    const relevantComments = comments
        .filter(c => c.postId === postId)
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    const userId = user?.isAnonymous ? 'guest' : user?.email;

    if (!post) {
        return (
            <div className="text-center p-8">
                <h1 className="text-2xl font-bold">Post not found</h1>
                <button onClick={() => navigate(-1)} className="mt-4 bg-[var(--accent-primary)] text-[var(--text-on-accent)] font-bold py-2 px-6 rounded-lg">
                    Go Back
                </button>
            </div>
        );
    }
    
    const timeAgo = (date: string) => {
        const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";
        return "Just now";
    };

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentContent.trim()) return;

        setIsSubmitting(true);
        setError('');
        const result = await addComment({ postId: post.id, content: commentContent });

        if (result.success) {
            triggerHapticFeedback('light');
            setCommentContent('');
        } else {
            setError(t('comment_form_error_moderation', { reason: result.message }));
        }
        setIsSubmitting(false);
    };

    const hasUserLikedPost = userId ? post.likes.includes(userId) : false;
    
    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-[var(--bg-surface)] p-6 rounded-2xl shadow-lg">
                <p className="text-sm text-[var(--text-secondary)]">Posted by <b>{post.authorName}</b> &middot; {timeAgo(post.timestamp)}</p>
                <h1 className="text-3xl font-bold text-[var(--text-primary)] my-3">{post.title}</h1>
                <p className="text-[var(--text-primary)] whitespace-pre-wrap leading-relaxed">{post.content}</p>
                <div className="mt-6 pt-4 border-t border-[var(--border-primary)] flex items-center gap-4">
                    <button
                        onClick={() => togglePostLike(post.id)}
                        className={`flex items-center gap-1.5 text-sm font-semibold rounded-full px-3 py-1.5 transition-colors ${hasUserLikedPost ? 'bg-red-100 text-red-600' : 'bg-[var(--bg-muted)] hover:bg-[var(--bg-surface-hover)]'}`}
                    >
                        <HeartIcon filled={hasUserLikedPost} className={`h-5 w-5 ${hasUserLikedPost ? 'text-red-500' : 'text-[var(--text-secondary)]'}`} />
                        {t(hasUserLikedPost ? 'unlike_button' : 'like_button')}
                    </button>
                    <span className="text-sm text-[var(--text-secondary)]">{t('likes_count_plural', { count: post.likes.length })}</span>
                </div>
            </div>

            <div className="bg-[var(--bg-surface)] p-6 rounded-2xl shadow-lg">
                <h2 className="text-xl font-bold mb-4">{t('post_comments_title')} ({relevantComments.length})</h2>
                
                <form onSubmit={handleAddComment} className="mb-6">
                    <textarea
                        value={commentContent}
                        onChange={e => setCommentContent(e.target.value)}
                        rows={3}
                        placeholder={t('comment_form_placeholder')}
                        className="w-full p-3 bg-[var(--bg-muted)] rounded-lg border border-[var(--border-primary)] focus:ring-2 focus:ring-[var(--accent-primary)] focus:outline-none"
                        required
                    />
                     {error && <p className="text-sm text-[var(--danger-text)] mt-2">{error}</p>}
                    <button type="submit" disabled={isSubmitting} className="mt-2 bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-[var(--text-on-accent)] font-bold py-2 px-5 rounded-lg transition disabled:opacity-50">
                        {isSubmitting ? t('comment_form_submitting') : t('comment_form_submit')}
                    </button>
                </form>

                <div className="space-y-4">
                    {relevantComments.length > 0 ? (
                        relevantComments.map(comment => {
                            const hasUserLikedComment = userId ? comment.likes.includes(userId) : false;
                            return (
                                <div key={comment.id} className="p-4 bg-[var(--bg-subtle)] rounded-lg flex items-start gap-4">
                                    <div className="w-10 h-10 mt-1 rounded-full bg-[var(--bg-muted)] flex items-center justify-center font-bold text-[var(--text-secondary)] flex-shrink-0">
                                        {comment.authorName.charAt(0)}
                                    </div>
                                    <div className="flex-grow">
                                        <p className="text-sm">
                                            <b className="text-[var(--text-primary)]">{comment.authorName}</b>
                                            <span className="text-[var(--text-secondary)]"> &middot; {timeAgo(comment.timestamp)}</span>
                                        </p>
                                        <p className="mt-1 text-[var(--text-primary)]">{comment.content}</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <button onClick={() => toggleCommentLike(comment.id)} className={`flex items-center gap-1 text-xs p-1 rounded-full ${hasUserLikedComment ? 'text-red-600' : 'text-[var(--text-secondary)] hover:text-red-500'}`}>
                                                <HeartIcon filled={hasUserLikedComment} className={`h-4 w-4 ${hasUserLikedComment ? 'text-red-500' : ''}`} />
                                            </button>
                                            <span className="text-xs text-[var(--text-secondary)]">{comment.likes.length > 0 ? comment.likes.length : ''}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <p className="text-[var(--text-secondary)] text-center py-4">{t('comments_empty')}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PostDetail;