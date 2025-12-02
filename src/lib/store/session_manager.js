/**
 * Simple in-memory session manager.
 * In a real app, this would use a database or Redis.
 */
const sessions = new Map();

class SessionManager {
    createSession(userId) {
        const session = {
            userId,
            currentChallengeId: null,
            attempts: [], // { challengeId, flag, timestamp, correct }
            hintsUsed: [], // { challengeId, hintIndex }
            skillProfile: {
                web: 0,
                crypto: 0,
                forensics: 0
            },
            startTime: Date.now()
        };
        sessions.set(userId, session);
        return session;
    }

    getSession(userId) {
        return sessions.get(userId);
    }

    updateSession(userId, updates) {
        const session = this.getSession(userId);
        if (session) {
            Object.assign(session, updates);
            sessions.set(userId, session);
        }
        return session;
    }
}

export const sessionManager = new SessionManager();
