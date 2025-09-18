import { GoogleGenAI, Chat, GenerateContentResponse, Type } from "@google/genai";
import { ChatMessage, JournalEntry, MoodLog, AIAnalysis, Persona, ProactiveSuggestion, JourneyProgress } from '../types';
import { personaOptions, wellnessJourneys } from '../constants';

// IMPORTANT: This service requires the @google/genai package to be installed.
// It also requires the API_KEY environment variable to be set.

const apiKey = typeof process !== 'undefined' && process.env ? process.env.API_KEY : undefined;

let ai: GoogleGenAI | null = null;
if (apiKey) {
    ai = new GoogleGenAI({ apiKey });
} else {
    console.warn("API_KEY environment variable not found. Gemini API will be mocked.");
}

const chats = new Map<Persona, Chat>();

const getChatInstance = (persona: Persona): Chat | null => {
    if (!ai) return null;
    if (chats.has(persona)) {
        return chats.get(persona)!;
    }
    const newChat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: personaOptions[persona].prompt,
        },
    });
    chats.set(persona, newChat);
    return newChat;
};

export const analyzeChatMessageForCrisis = async (message: string): Promise<'high' | 'low' | 'none'> => {
    if (!ai) {
        // Enhanced mock logic for local testing
        const highCrisisKeywords = [
            'kill myself', 'end my life', 'self-harm', 'hopeless', 'can\'t go on', 
            'ending it', 'want to die', 'suicide', 'hurt myself', 'no reason to live'
        ];
        const lowCrisisKeywords = [
            'lonely', 'worthless', 'anxious', 'depressed', 'crying', 'overwhelmed',
            'stressed out', 'can\'t sleep', 'feeling down', 'panic attack'
        ];

        const lowerMessage = message.toLowerCase();

        if (highCrisisKeywords.some(keyword => lowerMessage.includes(keyword))) {
            return 'high';
        }
        if (lowCrisisKeywords.some(keyword => lowerMessage.includes(keyword))) {
            return 'low';
        }
        return 'none';
    }

    try {
        const prompt = `
            You are a highly sensitive and empathetic crisis detection model for a youth mental wellness app. 
            Your sole task is to analyze the user's message for signs of distress and classify it into one of three levels. 
            Be cautious and prioritize user safety.

            Definitions and examples:
            - 'high': Urgent crisis. The user expresses direct or strong indirect suicidal thoughts, plans for self-harm, or overwhelming hopelessness.
              Examples: "I want to end my life", "I can't do this anymore, I'm going to hurt myself", "Life isn't worth living", "Everything is black, there's no way out".

            - 'low': Non-urgent but significant distress. The user expresses feelings of sadness, anxiety, stress, loneliness, or moderate hopelessness, but without immediate intent for self-harm.
              Examples: "I feel so lonely all the time", "I'm failing all my exams and I feel worthless", "I can't stop worrying", "I've been crying for days".

            - 'none': No detectable distress. General conversation, questions, or positive emotions.
              Examples: "Hi, how are you?", "Thanks for the tip!", "What is mindfulness?", "I had a great day today."

            User Message: "${message}"

            Analyze the message carefully and respond with ONLY ONE WORD: 'high', 'low', or 'none'.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                temperature: 0.1,
                topK: 1
            }
        });

        const result = response.text.trim().toLowerCase();
        if (result.includes('high')) return 'high';
        if (result.includes('low')) return 'low';
        return 'none';

    } catch (error) {
        console.error("Error analyzing chat message for crisis:", error);
        return 'none'; // Default to safe if API fails
    }
};

const determineEffectivePersona = async (message: string, defaultPersona: Persona): Promise<Persona> => {
    if (!ai) {
        // Mock logic for local testing without API key
        if (message.toLowerCase().includes('anxious') || message.toLowerCase().includes('stressed')) return 'calm';
        if (message.toLowerCase().includes('sad') || message.toLowerCase().includes('depressed')) return 'empathetic';
        if (message.toLowerCase().includes('motivate') || message.toLowerCase().includes('procrastinating')) return 'coach';
        return defaultPersona;
    }

    try {
        const prompt = `Analyze the user's message from a mental wellness chat. Which of these personas is most appropriate for a response: 
- 'empathetic': For expressing sadness, loss, or deep feelings.
- 'coach': For seeking motivation, goals, or solutions.
- 'calm': For anxiety, stress, panic, or feeling overwhelmed.
- 'energetic': For excitement, sharing good news, or needing a hype-up.
- 'mindful': For wanting to ground, reflect, or be present.
- 'default': For neutral, general chat, greetings, or questions.

User Message: "${message}"

Respond with ONLY ONE of these words: empathetic, coach, calm, energetic, mindful, default.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: { temperature: 0.1, topK: 1 }
        });

        const result = response.text.trim().toLowerCase();
        
        const validPersonas: Persona[] = ['empathetic', 'coach', 'calm', 'mindful', 'energetic'];
        if (validPersonas.includes(result as Persona)) {
            return result as Persona;
        }

        return defaultPersona;

    } catch (error) {
        console.error("Error determining effective persona:", error);
        return defaultPersona; // Fallback to default on API error
    }
};

export const getAIChatResponse = async (
    message: string, 
    history: ChatMessage[], 
    defaultPersona: Persona,
    isDynamicPersonaEnabled: boolean
): Promise<{ text: string; quickReplies: string[]; persona: Persona }> => {
    const crisisLevel = await analyzeChatMessageForCrisis(message);

    if (crisisLevel === 'high') {
        return { text: "[CRISIS_RESPONSE]", quickReplies: [], persona: 'empathetic' };
    }
    
    let effectivePersona = defaultPersona;
    if (isDynamicPersonaEnabled) {
        effectivePersona = await determineEffectivePersona(message, defaultPersona);
    }
    
    const chat = getChatInstance(effectivePersona);
    if (!chat) {
        // Mock response if API key is not available
        return new Promise(resolve => {
            setTimeout(() => {
                 const random = Math.random();
                 if (random > 0.8) {
                    resolve({ text: "[AFFIRMATION] You are resilient and can get through this.", quickReplies: [], persona: 'empathetic' });
                 } else if (random > 0.6) {
                    resolve({ text: "[PLAYLIST:Calming Acoustic Guitar|https://www.youtube.com/watch?v=5qap5aO4i9A]", quickReplies: [], persona: 'calm' });
                 } else {
                    resolve({ text: "Thank you for sharing. I'm here to listen. Remember to be kind to yourself.", quickReplies: ["Tell me more", "Thanks", "Okay"], persona: 'empathetic' });
                }
            }, 1000);
        });
    }

    try {
        const result: GenerateContentResponse = await chat.sendMessage({ message });
        let responseText = result.text;
        let quickReplies: string[] = [];
        
        const quickReplyRegex = /\[QUICK_REPLIES:(.*?)\]/s;
        const match = responseText.match(quickReplyRegex);

        if (match && match[1]) {
            quickReplies = match[1].split('|').map(reply => reply.trim()).filter(Boolean);
            responseText = responseText.replace(quickReplyRegex, '').trim();
        }

        return { text: responseText, quickReplies, persona: effectivePersona };
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return { text: "I'm sorry, I'm having a little trouble connecting right now. Let's try again in a moment.", quickReplies: [], persona: defaultPersona };
    }
};


export const getAIAnalysis = async (journalEntries: JournalEntry[], moodLogs: MoodLog[]): Promise<AIAnalysis | null> => {
    if (!ai) {
        console.warn("AI service not initialized. Returning mock analysis.");
        await new Promise(resolve => setTimeout(resolve, 1500));
        const lastEntry = journalEntries.length > 0 ? journalEntries[0].content.toLowerCase() : '';
        if (lastEntry.includes('hopeless') || lastEntry.includes('can\'t go on') || lastEntry.includes('ending it')) {
            return {
                insight: "It sounds like you are going through a very difficult time. It's brave of you to share this.",
                crisisLevel: 'high'
            };
        }
        return {
            insight: "You've been journaling consistently. Keep it up! It's a great way to process your thoughts and feelings.",
            crisisLevel: 'none'
        };
    }

    try {
        const prompt = `
            Analyze the following user data from a mental wellness app for an Indian youth user.
            Provide a gentle, non-clinical, and supportive insight based on their recent mood logs and journal entries.
            Also, assess the crisis level based on the content.
            - 'none': No immediate concern.
            - 'low': Shows signs of distress, could use support.
            - 'high': Shows signs of severe distress, self-harm, or hopelessness. Requires immediate suggestion to seek help.
            
            Mood Logs (last 14 days):
            ${JSON.stringify(moodLogs.slice(0, 14))}

            Journal Entries (last 5):
            ${JSON.stringify(journalEntries.slice(0, 5).map(e => ({ date: e.date, mood: e.mood, content: e.content })))}
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        insight: {
                            type: Type.STRING,
                            description: "A gentle, non-clinical, and supportive insight based on the user's data."
                        },
                        crisisLevel: {
                            type: Type.STRING,
                            description: "Crisis level: 'none', 'low', or 'high'."
                        }
                    },
                    required: ["insight", "crisisLevel"]
                },
            }
        });

        const jsonString = response.text;
        const result = JSON.parse(jsonString);

        if (result && typeof result.insight === 'string' && ['none', 'low', 'high'].includes(result.crisisLevel)) {
             return result as AIAnalysis;
        }
        
        console.error("AI analysis response has invalid format:", result);
        return null;

    } catch (error) {
        console.error("Error getting AI analysis:", error);
        return null;
    }
};

export const getProactiveSuggestion = async (
    moodLogs: MoodLog[], 
    journalEntries: JournalEntry[], 
    journeyProgress: Record<string, JourneyProgress>
): Promise<ProactiveSuggestion | null> => {
    if (!ai) {
        // Mock response
        await new Promise(resolve => setTimeout(resolve, 1000));
        return {
            suggestion: "Remember to take a moment for yourself today. A little self-care can make a big difference!",
            actionText: "Try a breathing exercise",
            actionLink: "/exercises"
        };
    }

    // Find active journey details
    const activeJourneyId = Object.keys(journeyProgress).find(id => {
        const journey = wellnessJourneys.find(j => j.id === id);
        const progress = journeyProgress[id];
        return journey && progress && progress.currentDay <= journey.days.length;
    });

    let activeJourneyInfo = null;
    if (activeJourneyId) {
        const journey = wellnessJourneys.find(j => j.id === activeJourneyId);
        const progress = journeyProgress[activeJourneyId];
        if (journey && progress) {
            activeJourneyInfo = {
                titleKey: journey.titleKey,
                currentDay: progress.currentDay
            };
        }
    }
    
    try {
        const prompt = `
            You are Sahaayak, a gentle and proactive wellness companion for Indian youth. Your goal is to provide ONE timely, supportive, and actionable suggestion based on the user's recent activity.
            Be empathetic, concise, and encouraging. Never be clinical or alarming.

            Analyze this user data:
            - Last 7 Mood Logs (1=sad, 5=happy): ${JSON.stringify(moodLogs.slice(0, 7).map(l => ({ mood: l.mood, date: l.date })))}
            - Last 3 Journal Entry themes (do not quote): ${JSON.stringify(journalEntries.slice(0, 3).map(e => e.content))}
            - Active Wellness Journey: ${JSON.stringify(activeJourneyInfo)}

            Based on the data, identify a pattern and generate a suggestion.
            - If moods are consistently low (1 or 2), suggest a calming exercise.
            - If a journal mentions stress/anxiety, suggest a relevant tool or journey.
            - If they are on a journey, offer encouragement related to that journey's theme.
            - If data is sparse or positive, offer a general wellness tip or encouragement.

            Respond in JSON format with this exact schema:
            {
              "suggestion": "A short, empathetic, and encouraging sentence (max 25 words).",
              "actionText": "(Optional) A short call-to-action for a button (e.g., 'Try this exercise', 'Start this journey').",
              "actionLink": "(Optional) The in-app link for the action (e.g., '/exercises', '/journeys/exam_stress_journey')."
            }

            Example for low mood:
            { "suggestion": "I noticed you've been feeling a bit down. A short breathing exercise might help find a moment of calm.", "actionText": "Try 2-min Breathing", "actionLink": "/exercises" }
            
            Example for general wellness:
            { "suggestion": "Remember to take a moment for yourself today. A little self-care can make a big difference!", "actionText": "Get a self-care idea", "actionLink": "/dashboard" }
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        suggestion: { type: Type.STRING },
                        actionText: { type: Type.STRING },
                        actionLink: { type: Type.STRING }
                    },
                    required: ["suggestion"]
                },
                temperature: 0.7
            }
        });

        const jsonString = response.text;
        const result = JSON.parse(jsonString);

        if (result && typeof result.suggestion === 'string') {
             return result as ProactiveSuggestion;
        }
        
        console.error("Proactive suggestion response has invalid format:", result);
        return null;

    } catch (error) {
        console.error("Error getting proactive suggestion:", error);
        return null;
    }
};


export const getDailyJournalPrompt = async (): Promise<string> => {
    if (!ai) {
        return "What is one small thing that brought you a moment of peace today?";
    }
    try {
        const prompt = "Generate a single, gentle, and reflective journal prompt for a young person using a mental wellness app. The prompt should encourage self-reflection on feelings, experiences, or gratitude. Keep it under 25 words. Do not ask about trauma or deeply negative experiences. Make it inspiring and simple.";
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        const text = response.text.trim().replace(/^"|"$/g, ''); // Remove surrounding quotes if any
        return text || "What's one small win you had today?";

    } catch (error) {
        console.error("Error generating journal prompt:", error);
        return "How are you truly feeling in this moment?";
    }
};

export const getGoalSuggestions = async (goal: string): Promise<string[]> => {
    if (!ai) {
        // Mock response for local testing without API key
        return new Promise(resolve => setTimeout(() => resolve([
            "Meditate for 5 minutes daily", 
            "Write down one thing you're grateful for each night", 
            "Go for a 15-minute walk without your phone",
            "Drink a full glass of water first thing in the morning"
        ]), 1000));
    }

    try {
        const prompt = `A user in a wellness app has this high-level goal: "${goal}". Break this down into 3-4 small, concrete, and actionable habits they can track daily or weekly. The habits should be simple and encouraging.`;
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        suggestions: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        }
                    },
                    required: ["suggestions"]
                },
            }
        });

        const result = JSON.parse(response.text);
        return result.suggestions || [];

    } catch (error) {
        console.error("Error getting goal suggestions:", error);
        return [];
    }
};


export const moderateContent = async (text: string): Promise<{ isSafe: boolean; reason?: string }> => {
    if (!ai) {
        // Mock logic for local testing without API key
        const blockedWords = ['kill', 'suicide', 'self-harm', 'hate', 'attack', 'idiot', 'stupid'];
        if (blockedWords.some(word => text.toLowerCase().includes(word))) {
            return { isSafe: false, reason: 'This content violates community guidelines regarding harmful language.' };
        }
        return { isSafe: true };
    }

    try {
        const prompt = `
            Analyze the following text from a youth mental wellness community forum for safety.
            The community is a supportive space. The text MUST NOT contain:
            - Harassment or bullying (e.g., insults, threats, targeting individuals).
            - Hate speech (e.g., attacks based on race, religion, gender, etc.).
            - Sexually explicit content.
            - Encouragement or glorification of self-harm or suicide.
            
            If the text is SAFE and appropriate, respond with: {"isSafe": true}.
            If the text is UNSAFE, respond with: {"isSafe": false, "reason": "A brief, user-friendly explanation."}.
            
            Example reasons for unsafe content:
            - "This content appears to be bullying or harassment."
            - "Content related to self-harm is not allowed in this supportive space."
            - "Please keep the conversation respectful and avoid personal attacks."
            - "Hate speech is not tolerated in this community."

            Text to analyze: "${text}"
        `;
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        isSafe: { type: Type.BOOLEAN },
                        reason: { type: Type.STRING }
                    },
                    required: ["isSafe"]
                },
                temperature: 0.1,
            }
        });
        
        const result = JSON.parse(response.text);
        
        if (typeof result.isSafe === 'boolean') {
            return result as { isSafe: boolean; reason?: string };
        }
        
        return { isSafe: false, reason: 'Could not verify content safety.' };

    } catch (error) {
        console.error("Error moderating content:", error);
        return { isSafe: false, reason: 'Error during moderation.' }; // Fail safe
    }
};
