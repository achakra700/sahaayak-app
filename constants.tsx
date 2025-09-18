import React from 'react';
import { Persona, Mood, Quote, WellnessJourney, CommunityCircle } from './types';

export const languageOptions = {
    en: { name: "English", icon: "🇬🇧" },
    hi: { name: "हिंदी", icon: "🇮🇳" },
    bn: { name: "বাংলা", icon: "🇧🇩" },
};

export const avatarOptions: { id: string; icon: string; }[] = [
    { id: 'butterfly', icon: '🦋' },
    { id: 'flower', icon: '🌸' },
    { id: 'sparkles', icon: '✨' },
    { id: 'sapling', icon: '🌱' },
    { id: 'headphones', icon: '🎧' },
    { id: 'panda', icon: '🐼' },
    { id: 'star', icon: '🌟' },
    { id: 'heart', icon: '💖' },
];

const commonPromptInstructions = `
You are “Sahaayak” — an empathetic mental wellness companion for Indian youth.
- Always respond in a supportive, warm, and non-judgmental tone.
- Never diagnose or prescribe medication.
- Encourage self-reflection, coping strategies, and positive reinforcement.
- Your responses should be culturally sensitive. You can use simple Hindi/Bengali phrases if you detect the user is using them (e.g., "That's a great point, bilkul!").
- Example helpful interactions: If a user feels stressed, suggest a short breathing exercise. If they feel down, suggest a small positive action like noting one good thing.
- If a user expresses stress or asks for relaxation, you can suggest a calming music playlist. To do this, you MUST format your response as follows: [PLAYLIST:Playlist Title|https://playlist.url]. For example: [PLAYLIST:Calming Acoustic Music|https://www.youtube.com/watch?v=some-video-id]. Do not include any other text in the response if you are sending a playlist.
- At the end of your response, if it makes sense to suggest next steps, provide up to 3 short (1-3 word) quick replies for the user. Format them on a new line like this: [QUICK_REPLIES:Reply 1|Reply 2|Reply 3]. Do not include this if your response already contains a playlist or an affirmation.
- CRITICAL SAFETY RULE: If a user ever expresses feelings of hopelessness, talks about ending their life, or mentions self-harm, you must gently and immediately encourage them to seek help from a trusted person or a professional helpline. For example, say: "It sounds like you are going through a lot. It is very brave of you to share. Please know that help is available, and you don't have to go through this alone. It might be helpful to talk to a trusted friend, family member, or a professional. You can find resources in the Emergency Support section of this app."
`;

export const personaOptions: Record<Persona, {id: Persona, icon: string, prompt: string}> = {
    empathetic: {
        id: 'empathetic',
        icon: '🤗',
        prompt: `Your core persona is an Empathetic Listener. Your tone is warm, supportive, and non-judgmental. You validate the user's feelings and offer a safe space to talk. Respond with care, positivity, and confidentiality. ${commonPromptInstructions}`
    },
    coach: {
        id: 'coach',
        icon: '💪',
        prompt: `Your core persona is a motivational Coach. Your tone is encouraging, positive, and action-oriented. You help users set goals, build healthy habits, and find solutions. Focus on practical steps and celebrating small wins. ${commonPromptInstructions}`
    },
    calm: {
        id: 'calm',
        icon: '🧘',
        prompt: `Your core persona is a Calming Mindfulness Guide. Your tone is serene, gentle, and patient. You guide users through mindfulness exercises, grounding techniques, and moments of quiet reflection. Your primary goal is to help the user find calm and presence. Avoid complex jargon and focus on simple, accessible wellness practices. ${commonPromptInstructions}`
    },
    mindful: {
        id: 'mindful',
        icon: '🧘‍♀️',
        prompt: `Your core persona is a Mindful Mentor. Your tone is exceptionally calm, gentle, and non-judgmental. You guide users to focus on the present moment using simple mindfulness techniques, sensory awareness, and body scan meditations. Speak in short, simple sentences. Encourage acceptance and observation of thoughts without getting caught in them. ${commonPromptInstructions}`
    },
    energetic: {
        id: 'energetic',
        icon: '⚡️',
        prompt: `Your core persona is an Energetic Motivator. Your tone is upbeat, positive, and full of encouraging words and emojis. You are like a cheerleader, celebrating every small step the user takes. You help them break down goals into fun challenges and hype them up. Use vibrant language and focus on action and building confidence. ${commonPromptInstructions}`
    }
};

export const moodOptions: Mood[] = ['😔', '😐', '🙂', '😃', '😍'];

export const moodContextActivities: { id: string; icon: string; key: string }[] = [
    { id: 'exercise', icon: '🏃', key: 'activity_exercise' },
    { id: 'socializing', icon: '💬', key: 'activity_socializing' },
    { id: 'work', icon: '💼', key: 'activity_work' },
    { id: 'rest', icon: '😴', key: 'activity_rest' },
    { id: 'hobbies', icon: '🎨', key: 'activity_hobbies' },
    { id: 'eating', icon: '🍽️', key: 'activity_eating' },
];

export const moodContextPeople: { id: string; icon: string; key: string }[] = [
    { id: 'family', icon: '👨‍👩‍👧', key: 'people_family' },
    { id: 'friends', icon: '🧑‍🤝‍🧑', key: 'people_friends' },
    { id: 'partner', icon: '❤️', key: 'people_partner' },
    { id: 'colleagues', icon: '🧑‍💼', key: 'people_colleagues' },
    { id: 'alone', icon: '👤', key: 'people_alone' },
];

export const motivationalQuotes: Quote[] = [
    { text: "You have to grow from the inside out. None can teach you, none can make you spiritual. There is no other teacher but your own soul.", author: "Swami Vivekananda" },
    { text: "We should not give up and we should not allow the problem to defeat us. Creativity is the key to success in the future, and primary education is where teachers can bring creativity in children at that level.", author: "A.P.J. Abdul Kalam" },
    { text: "The highest education is that which does not merely give us information but makes our life in harmony with all existence.", author: "Rabindranath Tagore" },
    { text: "Arise, awake, and stop not till the goal is reached.", author: "Swami Vivekananda" },
    { text: "Do not take rest after your first victory because if you fail in second, more lips are waiting to say that your first victory was just luck.", author: "A.P.J. Abdul Kalam" },
    { text: "Faith is the bird that feels the light and sings when the dawn is still dark.", author: "Rabindranath Tagore" },
    { text: "Take up one idea. Make that one idea your life... This is the way to success.", author: "Swami Vivekananda" },
    { text: "Dream, dream, dream. Dreams transform into thoughts and thoughts result in action.", author: "A.P.J. Abdul Kalam" },
    { text: "You cannot cross the sea merely by standing and staring at the water.", author: "Rabindranath Tagore" },
    { text: "Anything that makes you weak - physically, intellectually and spiritually, reject it as poison.", author: "Swami Vivekananda" },
    { text: "If you want to shine like a sun, first burn like a sun.", author: "A.P.J. Abdul Kalam" },
    { text: "Let your life lightly dance on the edges of Time like dew on the tip of a leaf.", author: "Rabindranath Tagore" }
];

export const selfCareIdeas: { text: string; icon: string }[] = [
    { text: "Drink a full glass of water", icon: "💧" },
    { text: "Stretch your body for 2 minutes", icon: "🙆" },
    { text: "Step outside and take 5 deep breaths", icon: "🌬️" },
    { text: "Think of one small thing you're grateful for", icon: "😊" },
    { text: "Listen to one favorite song that boosts your mood", icon: "🎵" },
    { text: "Tidy up one small area around you for a clear mind", icon: "🧹" },
    { text: "Smile at yourself in the mirror", icon: "🙂" },
    { text: "Write down one thing you are looking forward to", icon: "📝" },
    { text: "Do a quick 1-minute meditation or focus on your breath", icon: "🧘" },
    { text: "Gently roll your neck and shoulders to release tension", icon: "💆" },
    { text: "Look out a window and name 5 things you see", icon: "🪟" },
    { text: "Think of a happy memory for 30 seconds", icon: "💭" },
    { text: "Sip a warm, comforting drink like tea or coffee", icon: "☕" },
    { text: "Unclench your jaw and relax your face muscles", icon: "😌" },
    { text: "Say one kind thing to yourself, out loud if you can", icon: "❤️" },
    { text: "Watch a funny short video and allow yourself to laugh", icon: "😂" },
    { text: "Doodle or sketch on a piece of paper for a minute", icon: "✍️" },
    { text: "Stand up, walk around the room, and get your blood flowing", icon: "🚶" },
    { text: "Compliment yourself on one thing you did well today", icon: "✨" },
    { text: "Hug a pillow or a soft blanket for comfort", icon: "🤗" },
    { text: "Splash some cool water on your face", icon: "💦" },
    { text: "Look at a photo that brings you joy", icon: "🖼️" },
    { text: "Write down a worry and then set it aside", icon: "📓" },
    { text: "Name three things you like about yourself", icon: "👍" },
    { text: "Plan a small treat for yourself for later today", icon: "🎁" },
    { text: "Light a candle or use a calming scent diffuser", icon: "🕯️" },
    { text: "Read one page from a book you enjoy", icon: "📖" },
    { text: "Close your eyes and simply listen to the sounds around you", icon: "👂" },
    { text: "Give your hands a gentle massage with lotion", icon: "🧴" }
];

export const affirmationKeys: string[] = [
    "affirmation_1",
    "affirmation_2",
    "affirmation_3",
    "affirmation_4",
    "affirmation_5",
    "affirmation_6",
    "affirmation_7"
];

export const wellnessFactKeys: string[] = [
    "wellness_fact_1",
    "wellness_fact_2",
    "wellness_fact_3",
    "wellness_fact_4",
    "wellness_fact_5",
    "wellness_fact_6"
];

export const wellnessJourneys: WellnessJourney[] = [
    {
        id: 'mindfulness_journey',
        titleKey: 'journey_mindfulness_title',
        descriptionKey: 'journey_mindfulness_desc',
        icon: '🧘',
        days: [
            {
                day: 1,
                titleKey: 'journey_mindfulness_day1_title',
                tasks: [
                    { id: 'm_d1_t1', type: 'read', titleKey: 'task_mindfulness_intro_title', contentKey: 'task_mindfulness_intro_content' },
                    { id: 'm_d1_t2', type: 'exercise', titleKey: 'task_box_breathing_title', contentKey: '/exercises' },
                    { id: 'm_d1_t3', type: 'journal', titleKey: 'task_gratitude_journal_title', contentKey: 'task_gratitude_journal_prompt' }
                ]
            },
            {
                day: 2,
                titleKey: 'journey_mindfulness_day2_title',
                tasks: [
                    { id: 'm_d2_t1', type: 'read', titleKey: 'task_mindful_observation_title', contentKey: 'task_mindful_observation_content' },
                    { id: 'm_d2_t2', type: 'exercise', titleKey: 'task_grounding_title', contentKey: '/exercises' },
                    { id: 'm_d2_t3', type: 'journal', titleKey: 'task_sensory_journal_title', contentKey: 'task_sensory_journal_prompt' }
                ]
            },
            {
                day: 3,
                titleKey: 'journey_mindfulness_day3_title',
                tasks: [
                    { id: 'm_d3_t1', type: 'read', titleKey: 'task_mindful_listening_title', contentKey: 'task_mindful_listening_content' },
                    { id: 'm_d3_t2', type: 'exercise', titleKey: 'task_affirmations_title', contentKey: '/exercises' },
                    { id: 'm_d3_t3', type: 'journal', titleKey: 'task_listening_journal_title', contentKey: 'task_listening_journal_prompt' }
                ]
            },
            {
                day: 4,
                titleKey: 'journey_mindfulness_day4_title',
                tasks: [
                    { id: 'm_d4_t1', type: 'read', titleKey: 'task_mindful_eating_title', contentKey: 'task_mindful_eating_content' },
                    { id: 'm_d4_t2', type: 'exercise', titleKey: 'task_thought_tracker_title', contentKey: '/exercises' },
                    { id: 'm_d4_t3', type: 'journal', titleKey: 'task_mindful_eating_journal_title', contentKey: 'task_mindful_eating_journal_prompt' }
                ]
            },
            {
                day: 5,
                titleKey: 'journey_mindfulness_day5_title',
                tasks: [
                    { id: 'm_d5_t1', type: 'read', titleKey: 'task_mindful_walking_title', contentKey: 'task_mindful_walking_content' },
                    { id: 'm_d5_t2', type: 'exercise', titleKey: 'task_breathing_title', contentKey: '/exercises' },
                    { id: 'm_d5_t3', type: 'journal', titleKey: 'task_mindful_walking_journal_title', contentKey: 'task_mindful_walking_prompt' }
                ]
            },
            {
                day: 6,
                titleKey: 'journey_mindfulness_day6_title',
                tasks: [
                    { id: 'm_d6_t1', type: 'read', titleKey: 'task_difficult_thoughts_title', contentKey: 'task_difficult_thoughts_content' },
                    { id: 'm_d6_t2', type: 'exercise', titleKey: 'task_meditation_title', contentKey: '/exercises' },
                    { id: 'm_d6_t3', type: 'journal', titleKey: 'task_thought_observation_journal_title', contentKey: 'task_thought_observation_journal_prompt' }
                ]
            },
            {
                day: 7,
                titleKey: 'journey_mindfulness_day7_title',
                tasks: [
                    { id: 'm_d7_t1', type: 'read', titleKey: 'task_integrating_mindfulness_title', contentKey: 'task_integrating_mindfulness_content' },
                    { id: 'm_d7_t2', type: 'exercise', titleKey: 'task_grounding_title', contentKey: '/exercises' },
                    { id: 'm_d7_t3', type: 'journal', titleKey: 'task_integration_journal_title', contentKey: 'task_integration_journal_prompt' }
                ]
            }
        ]
    },
    {
        id: 'exam_stress_journey',
        titleKey: 'journey_exam_stress_title',
        descriptionKey: 'journey_exam_stress_desc',
        icon: '✍️',
        days: [
            {
                day: 1,
                titleKey: 'journey_exam_stress_day1_title',
                tasks: [
                    { id: 'e_d1_t1', type: 'read', titleKey: 'task_understanding_stress_title', contentKey: 'task_understanding_stress_content' },
                    { id: 'e_d1_t2', type: 'journal', titleKey: 'task_stress_triggers_journal_title', contentKey: 'task_stress_triggers_journal_prompt' },
                    { id: 'e_d1_t3', type: 'exercise', titleKey: 'task_meditation_title', contentKey: '/exercises' }
                ]
            },
            {
                day: 2,
                titleKey: 'journey_exam_stress_day2_title',
                tasks: [
                    { id: 'e_d2_t1', type: 'read', titleKey: 'task_pomodoro_title', contentKey: 'task_pomodoro_content' },
                    { id: 'e_d2_t2', type: 'exercise', titleKey: 'task_breathing_title', contentKey: '/exercises' },
                    { id: 'e_d2_t3', type: 'journal', titleKey: 'task_study_plan_journal_title', contentKey: 'task_study_plan_journal_prompt' }
                ]
            },
            {
                day: 3,
                titleKey: 'journey_exam_stress_day3_title',
                tasks: [
                    { id: 'e_d3_t1', type: 'read', titleKey: 'task_breaks_title', contentKey: 'task_breaks_content' },
                    { id: 'e_d3_t2', type: 'exercise', titleKey: 'task_grounding_title', contentKey: '/exercises' },
                    { id: 'e_d3_t3', type: 'journal', titleKey: 'task_break_ideas_journal_title', contentKey: 'task_break_ideas_journal_prompt' }
                ]
            },
            {
                day: 4,
                titleKey: 'journey_exam_stress_day4_title',
                tasks: [
                    { id: 'e_d4_t1', type: 'read', titleKey: 'task_self_care_exam_title', contentKey: 'task_self_care_exam_content' },
                    { id: 'e_d4_t2', type: 'exercise', titleKey: 'task_affirmations_title', contentKey: '/exercises' },
                    { id: 'e_d4_t3', type: 'journal', titleKey: 'task_self_care_plan_journal_title', contentKey: 'task_self_care_plan_journal_prompt' }
                ]
            },
            {
                day: 5,
                titleKey: 'journey_exam_stress_day5_title',
                tasks: [
                    { id: 'e_d5_t1', type: 'read', titleKey: 'task_exam_day_tips_title', contentKey: 'task_exam_day_tips_content' },
                    { id: 'e_d5_t2', type: 'exercise', titleKey: 'task_meditation_title', contentKey: '/exercises' },
                    { id: 'e_d5_t3', type: 'journal', titleKey: 'task_post_exam_reflection_title', contentKey: 'task_post_exam_reflection_prompt' }
                ]
            }
        ]
    },
    {
        id: 'self_esteem_journey',
        titleKey: 'journey_self_esteem_title',
        descriptionKey: 'journey_self_esteem_desc',
        icon: '💖',
        days: [
            {
                day: 1, titleKey: 'journey_self_esteem_day1_title', tasks: [
                    { id: 'se_d1_t1', type: 'read', titleKey: 'task_self_compassion_title', contentKey: 'task_self_compassion_content' },
                    { id: 'se_d1_t2', type: 'journal', titleKey: 'task_strength_list_title', contentKey: 'task_strength_list_prompt' },
                    { id: 'se_d1_t3', type: 'exercise', titleKey: 'task_affirmations_title', contentKey: '/exercises' },
                ]
            },
            {
                day: 2, titleKey: 'journey_self_esteem_day2_title', tasks: [
                    { id: 'se_d2_t1', type: 'read', titleKey: 'task_negative_self_talk_title', contentKey: 'task_negative_self_talk_content' },
                    { id: 'se_d2_t2', type: 'exercise', titleKey: 'task_thought_tracker_title', contentKey: '/exercises' },
                    { id: 'se_d2_t3', type: 'journal', titleKey: 'task_reframe_thought_title', contentKey: 'task_reframe_thought_prompt' },
                ]
            },
            {
                day: 3, titleKey: 'journey_self_esteem_day3_title', tasks: [
                    { id: 'se_d3_t1', type: 'read', titleKey: 'task_celebrate_wins_title', contentKey: 'task_celebrate_wins_content' },
                    { id: 'se_d3_t2', type: 'journal', titleKey: 'task_small_win_journal_title', contentKey: 'task_small_win_journal_prompt' },
                    { id: 'se_d3_t3', type: 'exercise', titleKey: 'task_meditation_title', contentKey: '/exercises' },
                ]
            },
            {
                day: 4, titleKey: 'journey_self_esteem_day4_title', tasks: [
                    { id: 'se_d4_t1', type: 'read', titleKey: 'task_set_boundaries_title', contentKey: 'task_set_boundaries_content' },
                    { id: 'se_d4_t2', type: 'journal', titleKey: 'task_practice_saying_no_title', contentKey: 'task_practice_saying_no_prompt' },
                    { id: 'se_d4_t3', type: 'exercise', titleKey: 'task_grounding_title', contentKey: '/exercises' },
                ]
            },
            {
                day: 5, titleKey: 'journey_self_esteem_day5_title', tasks: [
                    { id: 'se_d5_t1', type: 'read', titleKey: 'task_embrace_imperfection_title', contentKey: 'task_embrace_imperfection_content' },
                    { id: 'se_d5_t2', type: 'journal', titleKey: 'task_self_acceptance_title', contentKey: 'task_self_acceptance_prompt' },
                    { id: 'se_d5_t3', type: 'exercise', titleKey: 'task_breathing_title', contentKey: '/exercises' },
                ]
            }
        ]
    },
    {
        id: 'digital_detox_journey',
        titleKey: 'journey_digital_detox_title',
        descriptionKey: 'journey_digital_detox_desc',
        icon: '📵',
        days: [
            {
                day: 1, titleKey: 'journey_digital_detox_day1_title', tasks: [
                    { id: 'dd_d1_t1', type: 'read', titleKey: 'task_awareness_of_use_title', contentKey: 'task_awareness_of_use_content' },
                    { id: 'dd_d1_t2', type: 'journal', titleKey: 'task_screentime_reflection_title', contentKey: 'task_screentime_reflection_prompt' },
                    { id: 'dd_d1_t3', type: 'exercise', titleKey: 'task_meditation_title', contentKey: '/exercises' },
                ]
            },
            {
                day: 2, titleKey: 'journey_digital_detox_day2_title', tasks: [
                    { id: 'dd_d2_t1', type: 'read', titleKey: 'task_no_notifications_title', contentKey: 'task_no_notifications_content' },
                    { id: 'dd_d2_t2', type: 'journal', titleKey: 'task_notification_impact_title', contentKey: 'task_notification_impact_prompt' },
                    { id: 'dd_d2_t3', type: 'exercise', titleKey: 'task_grounding_title', contentKey: '/exercises' },
                ]
            },
            {
                day: 3, titleKey: 'journey_digital_detox_day3_title', tasks: [
                    { id: 'dd_d3_t1', type: 'read', titleKey: 'task_tech_free_zones_title', contentKey: 'task_tech_free_zones_content' },
                    { id: 'dd_d3_t2', type: 'journal', titleKey: 'task_tech_free_meal_title', contentKey: 'task_tech_free_meal_prompt' },
                    { id: 'dd_d3_t3', type: 'exercise', titleKey: 'task_breathing_title', contentKey: '/exercises' },
                ]
            },
            {
                day: 4, titleKey: 'journey_digital_detox_day4_title', tasks: [
                    { id: 'dd_d4_t1', type: 'read', titleKey: 'task_mindful_scrolling_title', contentKey: 'task_mindful_scrolling_content' },
                    { id: 'dd_d4_t2', type: 'journal', titleKey: 'task_social_media_feelings_title', contentKey: 'task_social_media_feelings_prompt' },
                    { id: 'dd_d4_t3', type: 'exercise', titleKey: 'task_affirmations_title', contentKey: '/exercises' },
                ]
            },
            {
                day: 5, titleKey: 'journey_digital_detox_day5_title', tasks: [
                    { id: 'dd_d5_t1', type: 'read', titleKey: 'task_reconnect_offline_title', contentKey: 'task_reconnect_offline_content' },
                    { id: 'dd_d5_t2', type: 'journal', titleKey: 'task_offline_hobby_title', contentKey: 'task_offline_hobby_prompt' },
                    { id: 'dd_d5_t3', type: 'exercise', titleKey: 'task_bodyscan_title', contentKey: '/exercises' },
                ]
            }
        ]
    },
    {
        id: 'anxiety_journey',
        titleKey: 'journey_anxiety_title',
        descriptionKey: 'journey_anxiety_desc',
        icon: '🌬️',
        days: [
            {
                day: 1, titleKey: 'journey_anxiety_day1_title', tasks: [
                    { id: 'a_d1_t1', type: 'read', titleKey: 'task_anxiety_is_normal_title', contentKey: 'task_anxiety_is_normal_content' },
                    { id: 'a_d1_t2', type: 'journal', titleKey: 'task_anxiety_symptoms_title', contentKey: 'task_anxiety_symptoms_prompt' },
                    { id: 'a_d1_t3', type: 'exercise', titleKey: 'task_breathing_title', contentKey: '/exercises' },
                ]
            },
            {
                day: 2, titleKey: 'journey_anxiety_day2_title', tasks: [
                    { id: 'a_d2_t1', type: 'read', titleKey: 'task_rain_method_title', contentKey: 'task_rain_method_content' },
                    { id: 'a_d2_t2', type: 'journal', titleKey: 'task_practice_rain_title', contentKey: 'task_practice_rain_prompt' },
                    { id: 'a_d2_t3', type: 'exercise', titleKey: 'task_meditation_title', contentKey: '/exercises' },
                ]
            },
            {
                day: 3, titleKey: 'journey_anxiety_day3_title', tasks: [
                    { id: 'a_d3_t1', type: 'read', titleKey: 'task_worry_tree_title', contentKey: 'task_worry_tree_content' },
                    { id: 'a_d3_t2', type: 'journal', titleKey: 'task_use_worry_tree_title', contentKey: 'task_use_worry_tree_prompt' },
                    { id: 'a_d3_t3', type: 'exercise', titleKey: 'task_grounding_title', contentKey: '/exercises' },
                ]
            },
            {
                day: 4, titleKey: 'journey_anxiety_day4_title', tasks: [
                    { id: 'a_d4_t1', type: 'read', titleKey: 'task_behavioral_activation_title', contentKey: 'task_behavioral_activation_content' },
                    { id: 'a_d4_t2', type: 'journal', titleKey: 'task_small_action_title', contentKey: 'task_small_action_prompt' },
                    { id: 'a_d4_t3', type: 'exercise', titleKey: 'task_affirmations_title', contentKey: '/exercises' },
                ]
            },
            {
                day: 5, titleKey: 'journey_anxiety_day5_title', tasks: [
                    { id: 'a_d5_t1', type: 'read', titleKey: 'task_progress_not_perfection_title', contentKey: 'task_progress_not_perfection_content' },
                    { id: 'a_d5_t2', type: 'journal', titleKey: 'task_toolkit_summary_title', contentKey: 'task_toolkit_summary_prompt' },
                    { id: 'a_d5_t3', type: 'exercise', titleKey: 'task_pmr_title', contentKey: '/exercises' },
                ]
            }
        ]
    }
];

export const communityCircles: CommunityCircle[] = [
    {
        id: 'university_life',
        titleKey: 'circle_university_life_title',
        descriptionKey: 'circle_university_life_desc',
        icon: '🎓',
    },
    {
        id: 'creative_passions',
        titleKey: 'circle_creative_passions_title',
        descriptionKey: 'circle_creative_passions_desc',
        icon: '🎨',
    }
];

export const badgeDetails: Record<string, { icon: string; nameKey: string; descKey: string; }> = {
    'first_journal': { icon: '🌱', nameKey: 'badge_first_journal_name', descKey: 'badge_first_journal_desc' },
    'journal_3_day': { icon: '✍️', nameKey: 'badge_journal_3_day_name', descKey: 'badge_journal_3_day_desc' },
    'journal_7_day': { icon: '✨', nameKey: 'badge_journal_7_day_name', descKey: 'badge_journal_7_day_desc' },
    'first_mood': { icon: '😊', nameKey: 'badge_first_mood_name', descKey: 'badge_first_mood_desc' },
    'mood_3_day': { icon: '📈', nameKey: 'badge_mood_3_day_name', descKey: 'badge_mood_3_day_desc' },
    'mood_7_day': { icon: '🌟', nameKey: 'badge_mood_7_day_name', descKey: 'badge_mood_7_day_desc' },
    'mindfulness_journey_complete': { icon: '🧘', nameKey: 'badge_journey_mindfulness_complete_name', descKey: 'badge_journey_mindfulness_complete_desc' },
    'exam_stress_journey_complete': { icon: '✍️', nameKey: 'badge_journey_exam_stress_complete_name', descKey: 'badge_journey_exam_stress_complete_desc' },
    'self_esteem_journey_complete': { icon: '💖', nameKey: 'badge_journey_self_esteem_complete_name', descKey: 'badge_journey_self_esteem_complete_desc' },
    'digital_detox_journey_complete': { icon: '📵', nameKey: 'badge_journey_digital_detox_complete_name', descKey: 'badge_journey_digital_detox_complete_desc' },
    'anxiety_journey_complete': { icon: '🌬️', nameKey: 'badge_journey_anxiety_complete_name', descKey: 'badge_journey_anxiety_complete_desc' },
};


export const EmergencyBannerIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-red-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export const ChatIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
);

export const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
);

export const MicIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
);

export const StopIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M6 6h12v12H6z" />
    </svg>
);

export const EmojiIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export const PhoneIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
);

export const PanicIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.636 18.364a9 9 0 010-12.728m2.828 9.9a5 5 0 010-7.072" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a.75.75 0 100-1.5.75.75 0 000 1.5z" />
        <path fillRule="evenodd" d="M12 5.25a1.5 1.5 0 011.5 1.5v6a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 011.5-1.5z" clipRule="evenodd" />
    </svg>
);

export const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

export const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

export const MusicIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 6l12-3" />
    </svg>
);

export const CommunityIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.124-1.282-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.124-1.282.356-1.857m0 0a3.004 3.004 0 015.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

export const AddIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
);

export const EditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" />
    </svg>
);

export const DeleteIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

export const EyeIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
      <path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a.75.75 0 010-1.113zM12.001 18a5.25 5.25 0 100-10.5 5.25 5.25 0 000 10.5z" clipRule="evenodd" />
    </svg>
);
  
export const EyeOffIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M3.53 2.47a.75.75 0 00-1.06 1.06l18 18a.75.75 0 101.06-1.06l-18-18zM22.676 12.553a11.249 11.249 0 01-2.631 4.31l-3.099-3.099a5.25 5.25 0 00-6.71-6.71L7.759 4.577a11.217 11.217 0 014.242-.827c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113z" />
      <path d="M15.75 12c0 .18-.013.357-.037.53l-1.684-1.684a2.25 2.25 0 00-3.08-3.08l-1.684-1.684A5.25 5.25 0 0012 6.75a5.25 5.25 0 00-5.25 5.25c0 .18.013.357.037.53l-1.684-1.684a2.25 2.25 0 00-3.08-3.08l-1.684-1.684A5.25 5.25 0 0012 6.75a5.25 5.25 0 00-5.25 5.25c0 .18.013.357.037.53l-1.684-1.684A2.25 2.25 0 004.5 12.25a2.25 2.25 0 00-2.25-2.25" />
      <path d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c.99 0 1.953.138 2.863.395L12 6.75a5.25 5.25 0 00-5.25 5.25c0 .18.013.357.037.53l-1.928-1.928A11.25 11.25 0 001.323 12.553a.75.75 0 010-1.113z" />
    </svg>
);

export const HeartIcon = ({ filled = false, className = "h-5 w-5" }: { filled?: boolean, className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.5}>
        <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
    </svg>
);