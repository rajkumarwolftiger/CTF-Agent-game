import db from '../db';

/**
 * User Store to manage registered users and their scores using SQLite.
 */
class UserStore {
    login(username) {
        const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
        let user = stmt.get(username);

        if (!user) {
            const insert = db.prepare('INSERT INTO users (username, score, badges, solved_challenges) VALUES (?, ?, ?, ?)');
            insert.run(username, 0, '[]', '[]');
            user = { username, score: 0, badges: [], solvedChallenges: [] };
        } else {
            // Parse JSON fields
            user.badges = JSON.parse(user.badges);
            user.solvedChallenges = JSON.parse(user.solved_challenges);
        }
        return user;
    }

    getUser(username) {
        const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
        const user = stmt.get(username);
        if (user) {
            user.badges = JSON.parse(user.badges);
            user.solvedChallenges = JSON.parse(user.solved_challenges);
        }
        return user;
    }

    getAllUsers() {
        const stmt = db.prepare('SELECT * FROM users ORDER BY score DESC');
        const users = stmt.all();
        return users.map(u => ({
            ...u,
            badges: JSON.parse(u.badges),
            solvedChallenges: JSON.parse(u.solved_challenges)
        }));
    }

    updateScore(username, points, challengeId) {
        const user = this.getUser(username);
        if (user && !user.solvedChallenges.includes(challengeId)) {
            user.score += points;
            user.solvedChallenges.push(challengeId);

            const update = db.prepare('UPDATE users SET score = ?, solved_challenges = ? WHERE username = ?');
            update.run(user.score, JSON.stringify(user.solvedChallenges), username);
            return true;
        }
        return false;
    }

    addBadge(username, badge) {
        const user = this.getUser(username);
        if (user && !user.badges.includes(badge)) {
            user.badges.push(badge);
            const update = db.prepare('UPDATE users SET badges = ? WHERE username = ?');
            update.run(JSON.stringify(user.badges), username);
        }
    }
}

// Singleton instance
export const userStore = new UserStore();
