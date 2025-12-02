import BaseAgent from './base_agent';
import { challengeStore } from '../store/challenge_store';
import aiChallengeAgent from './ai_challenge_agent';

class ChallengeGenerator extends BaseAgent {
    constructor() {
        super('ChallengeGenerator', 'Content Creator');
    }

    async execute(context) {
        // Context: { difficultyLevel, solvedChallengeIds }
        let { difficultyLevel = 'Easy', solvedChallengeIds = [] } = context;

        // Progression is now handled by MetaAgent.
        // We simply generate/fetch a challenge for the requested difficultyLevel.

        // 1. Check for existing unsolved challenges in the DB first
        const allChallenges = challengeStore.getAll();
        const candidates = allChallenges.filter(c =>
            c.difficulty === difficultyLevel && !solvedChallengeIds.includes(c.id)
        );

        if (candidates.length > 0) {
            // Pick a random challenge from the available pool
            const randomIndex = Math.floor(Math.random() * candidates.length);
            return candidates[randomIndex];
        }

        // 2. If no existing challenges are available, generate a new one via AI
        try {
            console.log(`No ${difficultyLevel} challenges found in DB. Generating new one...`);
            const aiChallenge = await aiChallengeAgent.execute({ difficultyLevel });
            if (aiChallenge) {
                // Add to store so it can be retrieved later
                challengeStore.add(aiChallenge);
                return aiChallenge;
            }
        } catch (e) {
            console.error("AI Generation failed", e);
        }

        return null; // No challenges available and AI failed
    }
}

export default new ChallengeGenerator();
