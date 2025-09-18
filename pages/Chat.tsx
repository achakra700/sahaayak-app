import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChatMessage, Persona } from '../types';
import { getAIChatResponse, analyzeChatMessageForCrisis } from '../services/geminiService';
import { SendIcon, MicIcon, StopIcon, PhoneIcon, SearchIcon, CloseIcon, MusicIcon, personaOptions } from '../constants';
import { useAppContext } from '../context/AppContext';

// SpeechRecognition API type definitions
interface SpeechRecognition {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onend: () => void;
    onerror: (event: any) => void;
    onresult: (event: any) => void;
    start: () => void;
    stop: () => void;
}
declare global {
    interface Window {
      SpeechRecognition: new () => SpeechRecognition;
      webkitSpeechRecognition: new () => SpeechRecognition;
    }
}

// ====================================================================================
// Sub-components for Chat UI
// ====================================================================================

const HighlightedText: React.FC<{ text: string; highlight: string }> = ({ text, highlight }) => {
    if (!highlight.trim()) {
        return <>{text}</>;
    }
    const regex = new RegExp(`(${highlight.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);

    return (
        <>
            {parts.map((part, i) =>
                regex.test(part) ? (
                    <mark key={i} className="bg-yellow-300 dark:bg-yellow-500 text-black rounded px-0.5">
                        {part}
                    </mark>
                ) : (
                    part
                )
            )}
        </>
    );
};


const BotAvatar: React.FC<{ persona?: Persona }> = ({ persona }) => {
    const personaIcon = persona ? personaOptions[persona]?.icon : '✨';
    const personaName = persona ? personaOptions[persona]?.id : 'AI';
    
    return (
        <div title={personaName} className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--bg-secondary)] to-[var(--bg-muted)] flex items-center justify-center text-xl text-[var(--text-accent)] shadow-md flex-shrink-0">
            {personaIcon}
        </div>
    );
};

const UserAvatar: React.FC<{ avatar?: string, name?: string }> = ({ avatar, name }) => (
    <div className="w-10 h-10 rounded-full bg-[var(--bg-muted)] flex items-center justify-center font-bold text-[var(--text-secondary)] shadow-md flex-shrink-0">
        {avatar || name?.charAt(0).toUpperCase() || 'G'}
    </div>
);

const TypingIndicator: React.FC = () => (
    <div className="flex items-end space-x-3 self-start animate-fade-in">
        <BotAvatar />
        <div className="bg-[var(--bg-surface)] rounded-2xl rounded-bl-none p-4 shadow-lg">
            <div className="typing-indicator flex items-center space-x-1.5">
                <span className="w-2 h-2 bg-[var(--text-secondary)] rounded-full"></span>
                <span className="w-2 h-2 bg-[var(--text-secondary)] rounded-full"></span>
                <span className="w-2 h-2 bg-[var(--text-secondary)] rounded-full"></span>
            </div>
        </div>
    </div>
);

const AffirmationCard: React.FC<{ text: string, searchQuery?: string }> = ({ text, searchQuery = '' }) => {
    const { t } = useTranslation();
    return (
        <div className="w-full my-2">
            <div className="bg-gradient-to-r from-green-300 via-teal-400 to-blue-500 p-4 rounded-xl shadow-lg text-white animate-fade-in">
                <p className="font-bold text-lg mb-1">{t('affirmation_daily_title')}</p>
                <p className="italic">"<HighlightedText text={text} highlight={searchQuery} />"</p>
            </div>
        </div>
    );
};

const PlaylistCard: React.FC<{ title: string; url: string; searchQuery?: string }> = ({ title, url, searchQuery = '' }) => {
    const { t } = useTranslation();
    return (
        <div className="bg-[var(--bg-surface)] p-4 rounded-2xl rounded-bl-none shadow-md border border-[var(--border-primary)] animate-fade-in w-full">
            <div className="flex items-center mb-3">
                <div className="w-10 h-10 rounded-full bg-green-200 dark:bg-green-800 flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="text-2xl">🎧</span>
                </div>
                <div>
                    <p className="font-bold text-[var(--text-primary)]"><HighlightedText text={title} highlight={searchQuery} /></p>
                    <p className="text-sm text-[var(--text-secondary)]">{t('playlist_suggested')}</p>
                </div>
            </div>
            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
                <MusicIcon />
                {t('playlist_listen_now')}
            </a>
        </div>
    );
};

const formatTimestamp = (isoString: string) => {
    if (!isoString) return '';
    const messageDate = new Date(isoString);
    const today = new Date();

    const isToday = messageDate.getDate() === today.getDate() &&
                    messageDate.getMonth() === today.getMonth() &&
                    messageDate.getFullYear() === today.getFullYear();

    if (isToday) {
        return messageDate.toLocaleTimeString(undefined, {
            hour: 'numeric',
            minute: '2-digit',
        });
    }

    return messageDate.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: messageDate.getFullYear() === today.getFullYear() ? undefined : 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
};

const ChatBubble: React.FC<{ message: ChatMessage; userAvatar?: string, userName?: string, searchQuery?: string }> = ({ message, userAvatar, userName, searchQuery = '' }) => {
    const { t } = useTranslation();
    const isUser = message.sender === 'user';
    // The initial message (id: '1') has a key that needs translation.
    const messageText = message.id === '1' ? t(message.text) : message.text;


    if (message.text.startsWith('[AFFIRMATION]')) {
        const affirmationText = message.text.replace('[AFFIRMATION]', '').trim();
        return <AffirmationCard text={affirmationText} searchQuery={searchQuery} />;
    }

    const playlistMatch = message.text.match(/^\[PLAYLIST:(.+)\|(.+)\]$/);
    if (playlistMatch && !isUser) {
        const [, title, url] = playlistMatch;
        return (
            <div className="flex items-end gap-3 w-full flex-row animate-fade-in">
                <BotAvatar persona={message.persona} />
                <div className="max-w-xs md:max-w-md lg:max-w-lg">
                    <PlaylistCard title={title} url={url} searchQuery={searchQuery} />
                </div>
                <div className="flex-grow"></div>
            </div>
        );
    }

    return (
        <div className={`flex flex-col w-full ${isUser ? 'items-end' : 'items-start'} animate-fade-in`}>
            <div className={`flex items-end gap-3 w-full ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                {isUser ? <UserAvatar avatar={userAvatar} name={userName} /> : <BotAvatar persona={message.persona} />}
                <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl shadow-lg ${isUser ? 'bg-gradient-to-br from-[var(--accent-primary)] to-sky-400 text-white rounded-br-none' : 'bg-[var(--bg-surface)] text-[var(--text-primary)] rounded-bl-none'}`}>
                    <p className="text-base break-words">
                        <HighlightedText text={messageText} highlight={searchQuery} />
                    </p>
                </div>
                 <div className="flex-grow"></div>
            </div>
             {message.id !== '1' && message.timestamp && (
                <p className={`text-xs text-[var(--text-secondary)] mt-1.5 ${isUser ? 'mr-14' : 'ml-14'}`}>
                    {formatTimestamp(message.timestamp)}
                </p>
            )}
        </div>
    );
};

const QuickReplyChip: React.FC<{ text: string; onClick: () => void }> = ({ text, onClick }) => (
    <button
        onClick={onClick}
        className="px-4 py-2 bg-[var(--glass-bg)] backdrop-blur-sm border border-[var(--glass-border-color)] text-[var(--text-accent)] rounded-full font-semibold text-sm hover:bg-[var(--bg-surface-hover)] transition-colors shadow-md"
    >
        {text}
    </button>
);

// ====================================================================================
// Main Chat Component
// ====================================================================================

const Chat: React.FC = () => {
    const { user, selectedPersona, chatMessages, addChatMessage, setChatMessages, triggerHapticFeedback, language, dynamicPersonaEnabled, chatFontSize } = useAppContext();
    const { t } = useTranslation();
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showCrisisModal, setShowCrisisModal] = useState(false);
    const [showDistressBanner, setShowDistressBanner] = useState(false);
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const debounceTimeoutRef = useRef<number | null>(null);
    const navigate = useNavigate();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [chatMessages, isLoading]);
    
    const submitMessage = useCallback(async (text: string) => {
        if (text.trim() === '' || isLoading) return;

        triggerHapticFeedback('light');
        
        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            text: text,
            sender: 'user',
            timestamp: new Date().toISOString(),
        };

        // Replace the entire chat history to remove old quick replies and add the new user message.
        const updatedMessages = [...chatMessages.map(m => ({...m, quickReplies: []})), userMessage];
        setChatMessages(updatedMessages);

        setIsLoading(true);

        const aiResponse = await getAIChatResponse(text, updatedMessages, selectedPersona, dynamicPersonaEnabled);
        
        if (aiResponse.text === '[CRISIS_RESPONSE]') {
            setShowCrisisModal(true);
            setIsLoading(false);
            return;
        }

        const aiMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            text: aiResponse.text,
            sender: 'ai',
            timestamp: new Date().toISOString(),
            quickReplies: aiResponse.quickReplies,
            persona: aiResponse.persona,
        };

        addChatMessage(aiMessage); // Append the new AI message
        setIsLoading(false);

    }, [isLoading, chatMessages, selectedPersona, addChatMessage, setChatMessages, triggerHapticFeedback, dynamicPersonaEnabled]);

    const handleSendMessage = () => {
        submitMessage(inputValue);
        setInputValue('');
    };

    const handleQuickReply = (text: string) => {
        submitMessage(text);
    };
    
    const handleToggleRecording = useCallback(() => {
        if (isRecording) {
            recognitionRef.current?.stop();
            // onend will set isRecording to false
            return;
        }

        const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognitionAPI) {
            alert("Speech recognition is not supported in this browser.");
            return;
        }

        triggerHapticFeedback('medium');
        const recognition = new SpeechRecognitionAPI();
        recognitionRef.current = recognition;

        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = language === 'hi' ? 'hi-IN' : language === 'bn' ? 'bn-BD' : 'en-US';
        
        const initialText = inputValue.trim() ? inputValue.trim() + ' ' : '';

        recognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }
            setInputValue(initialText + finalTranscript + interimTranscript);
        };
        
        recognition.onerror = (event) => {
            console.error("Speech recognition error", event.error);
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            setIsRecording(false);
        };

        recognition.onend = () => {
            setIsRecording(false);
            recognitionRef.current = null;
        };

        recognition.start();
        setIsRecording(true);

    }, [isRecording, language, inputValue, triggerHapticFeedback]);


    useEffect(() => {
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    useEffect(() => {
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }

        if (inputValue.trim().length < 15) {
            if (showDistressBanner) setShowDistressBanner(false);
            return;
        }

        debounceTimeoutRef.current = window.setTimeout(async () => {
            if (messagesContainerRef.current) { 
                const crisisLevel = await analyzeChatMessageForCrisis(inputValue);
                if (crisisLevel === 'high') {
                    setShowDistressBanner(true);
                }
            }
        }, 1500);

        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    }, [inputValue, showDistressBanner]);

    const filteredMessages = useMemo(() => {
        if (!searchQuery.trim()) {
            return chatMessages;
        }
        return chatMessages.filter(msg =>
            msg.text.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [chatMessages, searchQuery]);


    const lastMessage = chatMessages[chatMessages.length - 1];
    
    const CrisisModal = () => (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-[var(--bg-surface)] rounded-2xl p-6 sm:p-8 max-w-md text-center shadow-2xl">
                <h2 className="text-2xl font-bold text-[var(--danger-secondary)] mb-4">{t('crisis_modal_chat_title')}</h2>
                <p className="text-[var(--text-primary)] mb-4">{t('crisis_modal_chat_text')}</p>
                <div className="text-left bg-blue-50 dark:bg-blue-900/40 p-4 rounded-lg mb-6">
                    <h3 className="font-bold text-blue-800 dark:text-blue-200">{t('emergency_feeling_unsafe_title')}</h3>
                    <p className="text-sm text-blue-700 dark:text-blue-300">{t('crisis_modal_grounding_suggestion')}</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button onClick={() => navigate('/emergency', { state: { fromDistress: true } })} className="w-full sm:w-auto bg-[var(--danger-primary)] hover:bg-[var(--danger-secondary)] text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2">
                        <PhoneIcon /> {t('crisis_modal_get_help')}
                    </button>
                    <button onClick={() => setShowCrisisModal(false)} className="w-full sm:w-auto bg-[var(--bg-muted)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-primary)] font-bold py-3 px-6 rounded-lg transition">{t('crisis_modal_close')}</button>
                </div>
            </div>
        </div>
    );
    
    const DistressBanner = () => {
        const navigate = useNavigate();
        const { t } = useTranslation();
        return (
            <div className="p-3 bg-[var(--danger-surface)] border-t border-[var(--danger-primary)] animate-fade-in z-10">
                <div className="flex items-center justify-between max-w-4xl mx-auto gap-4">
                    <p className="text-sm text-[var(--danger-text)] font-semibold">
                        <span className="font-bold mr-2">!</span>
                        {t('distress_banner_text')}
                    </p>
                    <button 
                        onClick={() => navigate('/emergency')}
                        className="bg-[var(--danger-secondary)] hover:bg-[var(--danger-primary)] text-white font-bold py-2 px-4 rounded-lg text-sm flex-shrink-0"
                    >
                        {t('distress_banner_button')}
                    </button>
                </div>
            </div>
        );
    };


    return (
        <div className={`h-screen w-screen flex flex-col bg-[var(--bg-primary)] overflow-hidden ${chatFontSize === 'sm' ? 'text-sm' : chatFontSize === 'lg' ? 'text-lg' : 'text-base'}`}>
            {showCrisisModal && <CrisisModal />}
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--gradient-start)] via-[var(--gradient-via)] to-[var(--gradient-end)] opacity-70"></div>
            
            <header className="relative glassmorphism p-3 flex items-center justify-between z-10 text-[var(--text-primary)] shadow-md flex-shrink-0">
                <button onClick={() => navigate(-1)} className="font-semibold text-lg p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 flex-shrink-0">&larr;</button>
                
                {isSearchVisible ? (
                    <div className="flex-grow mx-2">
                        <input
                            type="search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={t('chat_search_placeholder')}
                            className="w-full px-4 py-2 bg-[var(--bg-surface)]/50 rounded-full focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)] text-sm"
                            autoFocus
                        />
                    </div>
                ) : (
                    <div className="text-center mx-2">
                        <h1 className="text-xl font-bold">Sahaayak 🤝</h1>
                    </div>
                )}
                
                <button 
                    onClick={() => {
                        setIsSearchVisible(!isSearchVisible);
                        if (isSearchVisible) setSearchQuery('');
                    }}
                    className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 flex-shrink-0"
                    aria-label={isSearchVisible ? t('chat_search_close') : t('chat_search_open')}
                >
                   {isSearchVisible ? <CloseIcon /> : <SearchIcon />}
                </button>
            </header>
            
            <main ref={messagesContainerRef} className="chat-container flex-1 overflow-y-auto p-4 md:p-6">
                <div className="flex flex-col space-y-8">
                    {filteredMessages.length > 0 ? (
                        filteredMessages.map(msg => (
                            <ChatBubble key={msg.id} message={msg} userAvatar={user?.avatar} userName={user?.name} searchQuery={searchQuery} />
                        ))
                    ) : (
                        searchQuery ? (
                            <div className="text-center text-[var(--text-secondary)] py-10">
                                <p>{t('chat_no_results', { query: searchQuery })}</p>
                            </div>
                        ) : (
                             <div className="text-center text-[var(--text-secondary)] py-10">
                                <p>{t('chat_no_history')}</p>
                            </div>
                        )
                    )}
                    {isLoading && !searchQuery && <TypingIndicator />}
                    <div ref={messagesEndRef} />
                </div>
            </main>

            {lastMessage?.sender === 'ai' && lastMessage.quickReplies && lastMessage.quickReplies.length > 0 && !isLoading && !isSearchVisible && (
                <div className="p-4 pt-0 flex flex-wrap gap-2 justify-center z-10">
                    {lastMessage.quickReplies.map(reply => {
                        const translatedReply = t(reply);
                        return (
                           <QuickReplyChip key={reply} text={translatedReply} onClick={() => handleQuickReply(translatedReply)} />
                        );
                    })}
                </div>
            )}
            
            {showDistressBanner && <DistressBanner />}

            <footer className="relative glassmorphism p-3 border-t border-white/20 dark:border-black/20 z-10">
                <div className="flex items-center space-x-3">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder={t('chat_feeling_placeholder')}
                        className="flex-1 px-5 py-3 bg-[var(--bg-surface)]/80 rounded-full focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] text-[var(--text-primary)] placeholder-[var(--text-secondary)]"
                        disabled={isLoading}
                    />
                    <button 
                        onClick={handleToggleRecording} 
                        className={`p-3 rounded-full transition-colors ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'text-[var(--text-secondary)] hover:bg-black/10 dark:hover:bg-white/10'}`}
                        aria-label="Toggle voice recording"
                    >
                       {isRecording ? <StopIcon /> : <MicIcon />}
                    </button>
                    <button
                        onClick={handleSendMessage}
                        disabled={isLoading || !inputValue.trim()}
                        className="p-3 bg-[var(--accent-primary)] text-white rounded-full hover:bg-[var(--accent-primary-hover)] disabled:bg-blue-300 disabled:cursor-not-allowed transition-transform transform hover:scale-110"
                        aria-label="Send message"
                    >
                        <SendIcon />
                    </button>
                </div>
            </footer>

            <button
                onClick={() => navigate('/emergency')}
                className="absolute bottom-24 right-4 bg-[var(--danger-surface)] text-[var(--danger-text)] text-2xl rounded-full w-12 h-12 flex items-center justify-center shadow-xl transition-transform transform hover:scale-110 z-20 border border-[var(--danger-primary)]"
                aria-label={t('emergency_call_helpline')}
            >
                🆘
            </button>
        </div>
    );
};

export default Chat;