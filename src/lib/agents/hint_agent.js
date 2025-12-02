import BaseAgent from './base_agent';
import { challengeStore } from '../store/challenge_store';

class HintAgent extends BaseAgent {
    constructor() {
        super('HintAgent', 'Mentor');
    }

    async execute(context) {
        // Context: { challengeId, hintsUsedCount }
        const { challengeId, hintsUsedCount = 0 } = context;
        const challenge = challengeStore.getById(challengeId);

        if (!challenge) {
            return { error: 'Challenge not found' };
        }

        if (hintsUsedCount < challenge.hints.length) {
            return {
                hint: challenge.hints[hintsUsedCount],
                nextHintIndex: hintsUsedCount + 1
            };
        } else {
            return {
                hint: "I've given you all the hints I have! Try reviewing the concepts.",
                nextHintIndex: hintsUsedCount
            };
        }
    }
}

export default new HintAgent();
