import { MoodLog, JournalEntry, ChatMessage, EmergencyContact, Streak, Badge, JourneyProgress, CirclePost, CircleComment, Intention, User, EmergencyLog, AIPersonalization } from '../types';
import { firestore } from './firebase';
import {
    collection, doc, getDoc, setDoc, addDoc, getDocs, updateDoc, deleteDoc, query, orderBy, serverTimestamp, writeBatch, collectionGroup
} from 'firebase/firestore';


// --- Firebase Firestore Interaction Layer ---

// --- User Profile Management ---
export const db = {
    async createUserProfile(user: User): Promise<void> {
        const userRef = doc(firestore, 'users', user.uid);
        await setDoc(userRef, {
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            isAnonymous: user.isAnonymous,
            createdAt: serverTimestamp(),
        });
    },

    async getUserProfile(uid: string): Promise<User | null> {
        const userRef = doc(firestore, 'users', uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
            return { uid, ...docSnap.data() } as User;
        }
        return null;
    },

    // --- Data Fetchers (Read operations) ---

    async getMoodLogs(userId: string): Promise<MoodLog[]> {
        const q = query(collection(firestore, `users/${userId}/moodLogs`), orderBy('date', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as MoodLog[];
    },
    async getJournalEntries(userId: string): Promise<JournalEntry[]> {
        const q = query(collection(firestore, `users/${userId}/journalEntries`), orderBy('date', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as JournalEntry[];
    },
    async getChatMessages(userId: string): Promise<ChatMessage[]> {
         const q = query(collection(firestore, `users/${userId}/chatHistory`), orderBy('timestamp', 'asc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ChatMessage[];
    },
    async getEmergencyContacts(userId: string): Promise<EmergencyContact[]> {
        const snapshot = await getDocs(collection(firestore, `users/${userId}/emergencyContacts`));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as EmergencyContact[];
    },
    async getEmergencyLogs(userId: string): Promise<EmergencyLog[]> {
         const q = query(collection(firestore, `users/${userId}/emergencyLogs`), orderBy('timestamp', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as EmergencyLog[];
    },
    async getStreaks(userId: string): Promise<Streak[]> {
        const docRef = doc(firestore, `users/${userId}/gamification/streaks`);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? docSnap.data().streaks : [];
    },
    async getBadges(userId: string): Promise<Badge[]> {
        const docRef = doc(firestore, `users/${userId}/gamification/badges`);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? docSnap.data().badges : [];
    },
    async getJourneyProgress(userId: string): Promise<Record<string, JourneyProgress>> {
        const snapshot = await getDocs(collection(firestore, `users/${userId}/journeyProgress`));
        const progress: Record<string, JourneyProgress> = {};
        snapshot.forEach(doc => {
            progress[doc.id] = doc.data() as JourneyProgress;
        });
        return progress;
    },
    // FIX: Added missing getAIPersonalization method.
    async getAIPersonalization(userId: string): Promise<AIPersonalization | null> {
        const docRef = doc(firestore, `users/${userId}/app_data/aiPersonalization`);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? docSnap.data() as AIPersonalization : null;
    },
    async getPosts(): Promise<CirclePost[]> {
        const q = query(collection(firestore, 'community_posts'), orderBy('timestamp', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as CirclePost[];
    },
    async getComments(): Promise<CircleComment[]> {
        const snapshot = await getDocs(collectionGroup(firestore, 'comments'));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as CircleComment[];
    },
    async getIntentions(userId: string): Promise<Intention[]> {
        const snapshot = await getDocs(collection(firestore, `users/${userId}/intentions`));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Intention[];
    },
   
    // --- Data Writers (Create, Update, Delete) ---

    async addMoodLog(userId: string, data: Omit<MoodLog, 'id'>): Promise<MoodLog> {
        const docRef = await addDoc(collection(firestore, `users/${userId}/moodLogs`), data);
        return { id: docRef.id, ...data };
    },
    async addJournalEntry(userId: string, data: Omit<JournalEntry, 'id'>): Promise<JournalEntry> {
        const docRef = await addDoc(collection(firestore, `users/${userId}/journalEntries`), data);
        return { id: docRef.id, ...data };
    },
     async saveChatMessages(userId: string, messages: ChatMessage[]): Promise<void> {
        // This is inefficient but necessary to match the old logic.
        // A better approach would be to only add the new message.
        const batch = writeBatch(firestore);
        const collectionRef = collection(firestore, `users/${userId}/chatHistory`);
        messages.forEach(msg => {
            const docRef = doc(collectionRef, msg.id);
            batch.set(docRef, msg);
        });
        await batch.commit();
    },
    async addChatMessage(userId: string, message: ChatMessage): Promise<void> {
        await setDoc(doc(firestore, `users/${userId}/chatHistory`, message.id), message);
    },
    async addEmergencyContact(userId: string, data: Omit<EmergencyContact, 'id'>): Promise<EmergencyContact> {
        const docRef = await addDoc(collection(firestore, `users/${userId}/emergencyContacts`), data);
        return { id: docRef.id, ...data };
    },
     async updateEmergencyContact(userId: string, contact: EmergencyContact): Promise<void> {
        await setDoc(doc(firestore, `users/${userId}/emergencyContacts`, contact.id), contact);
    },
    async deleteEmergencyContact(userId: string, contactId: string): Promise<void> {
        await deleteDoc(doc(firestore, `users/${userId}/emergencyContacts`, contactId));
    },
     async logEmergencyAction(userId: string, data: Omit<EmergencyLog, 'id'>): Promise<void> {
        await addDoc(collection(firestore, `users/${userId}/emergencyLogs`), data);
    },
    async saveStreaks(userId: string, data: Streak[]): Promise<void> {
        await setDoc(doc(firestore, `users/${userId}/gamification/streaks`), { streaks: data });
    },
    async saveBadges(userId: string, data: Badge[]): Promise<void> {
        await setDoc(doc(firestore, `users/${userId}/gamification/badges`), { badges: data });
    },
    async saveJourneyProgress(userId: string, journeyId: string, data: JourneyProgress): Promise<void> {
        await setDoc(doc(firestore, `users/${userId}/journeyProgress`, journeyId), data);
    },
    async addPost(data: Omit<CirclePost, 'id'>): Promise<CirclePost> {
        const docRef = await addDoc(collection(firestore, 'community_posts'), data);
        return { id: docRef.id, ...data };
    },
    async updatePost(data: CirclePost): Promise<void> {
        await updateDoc(doc(firestore, 'community_posts', data.id), { likes: data.likes });
    },
    async addComment(data: Omit<CircleComment, 'id'>): Promise<CircleComment> {
        const docRef = await addDoc(collection(firestore, `community_posts/${data.postId}/comments`), data);
        return { id: docRef.id, ...data };
    },
     async updateComment(data: CircleComment): Promise<void> {
        await updateDoc(doc(firestore, `community_posts/${data.postId}/comments`, data.id), { likes: data.likes });
    },
    async addIntention(userId: string, data: Omit<Intention, 'id'>): Promise<Intention> {
        const docRef = await addDoc(collection(firestore, `users/${userId}/intentions`), data);
        return { id: docRef.id, ...data };
    },
    async updateIntention(userId: string, data: Intention): Promise<void> {
        await updateDoc(doc(firestore, `users/${userId}/intentions`, data.id), { completedDates: data.completedDates });
    },
    async deleteIntention(userId: string, intentionId: string): Promise<void> {
        await deleteDoc(doc(firestore, `users/${userId}/intentions`, intentionId));
    },

    // FIX: Add missing batch save methods to match usage in AppContext.tsx
    async saveMoodLogs(userId: string, logs: MoodLog[]): Promise<void> {
        const batch = writeBatch(firestore);
        const collectionRef = collection(firestore, `users/${userId}/moodLogs`);
        logs.forEach(log => {
            const docRef = doc(collectionRef, log.id);
            batch.set(docRef, log);
        });
        await batch.commit();
    },
    async saveJournalEntries(userId: string, entries: JournalEntry[]): Promise<void> {
        const batch = writeBatch(firestore);
        const collectionRef = collection(firestore, `users/${userId}/journalEntries`);
        entries.forEach(entry => {
            const docRef = doc(collectionRef, entry.id);
            batch.set(docRef, entry);
        });
        await batch.commit();
    },
    async saveEmergencyContacts(userId: string, contacts: EmergencyContact[]): Promise<void> {
        const batch = writeBatch(firestore);
        const collectionRef = collection(firestore, `users/${userId}/emergencyContacts`);
        // First delete existing ones to handle removals
        const snapshot = await getDocs(collectionRef);
        snapshot.docs.forEach(doc => batch.delete(doc.ref));
        // Then add current ones
        contacts.forEach(contact => {
            const docRef = doc(collectionRef, contact.id);
            batch.set(docRef, contact);
        });
        await batch.commit();
    },
    async saveEmergencyLogs(userId: string, logs: EmergencyLog[]): Promise<void> {
        const batch = writeBatch(firestore);
        const collectionRef = collection(firestore, `users/${userId}/emergencyLogs`);
        logs.forEach(log => {
            const docRef = doc(collectionRef, log.id);
            batch.set(docRef, log);
        });
        await batch.commit();
    },
    async savePosts(posts: CirclePost[]): Promise<void> {
        const batch = writeBatch(firestore);
        const collectionRef = collection(firestore, 'community_posts');
        posts.forEach(post => {
            const docRef = doc(collectionRef, post.id);
            batch.set(docRef, post);
        });
        await batch.commit();
    },
    async saveComments(comments: CircleComment[]): Promise<void> {
        const batch = writeBatch(firestore);
        comments.forEach(comment => {
            const docRef = doc(firestore, `community_posts/${comment.postId}/comments`, comment.id);
            batch.set(docRef, comment);
        });
        await batch.commit();
    },
    async saveIntentions(userId: string, intentions: Intention[]): Promise<void> {
        const batch = writeBatch(firestore);
        const collectionRef = collection(firestore, `users/${userId}/intentions`);
        const snapshot = await getDocs(collectionRef);
        snapshot.docs.forEach(doc => batch.delete(doc.ref));
        intentions.forEach(intention => {
            const docRef = doc(collectionRef, intention.id);
            batch.set(docRef, intention);
        });
        await batch.commit();
    },
    
    // Clear user data is not a single operation in Firestore, this would be a cloud function.
    // For the client, we just sign out.
    clearUserData: async (userId: string) => {
        // This is a complex operation, best handled by a Firebase Cloud Function.
        // For client-side, we'll just log out, which clears the state.
        console.warn(`Clearing user data for ${userId} should be handled by a backend function for security and completeness.`);
    },
};
