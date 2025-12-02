import BaseAgent from './base_agent';
import { challengeStore } from '../store/challenge_store';

class MetaAgent extends BaseAgent {
    constructor() {
        super('MetaAgent', 'Game Master');
    }

    async execute(context) {
        // Context: { session }
        // Logic: Analyze performance and adjust difficulty.
        const { session } = context;
        if (!session) return { action: 'MAINTAIN_DIFFICULTY', level: 'Easy' };

        const solvedAttempts = session.attempts.filter(a => a.correct);
        const solvedIds = solvedAttempts.map(a => a.challengeId);

        // Get all challenges to check difficulty
        const allChallenges = challengeStore.getAll();

        // Filter solved challenges
        const solvedChallenges = allChallenges.filter(c => solvedIds.includes(c.id));

        const easySolved = solvedChallenges.filter(c => c.difficulty === 'Easy').length;
        const mediumSolved = solvedChallenges.filter(c => c.difficulty === 'Medium').length;

        let level = 'Easy';
        // User Requirement: 5 Easy -> Medium -> Hard
        if (easySolved >= 5) {
            if (mediumSolved >= 5) {
                level = 'Hard';
            } else {
                level = 'Medium';
            }
        }

        return { action: 'SET_DIFFICULTY', level };
    }
}

export default new MetaAgent();
