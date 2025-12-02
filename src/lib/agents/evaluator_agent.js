import BaseAgent from './base_agent';
import { challengeStore } from '../store/challenge_store';

class EvaluatorAgent extends BaseAgent {
    constructor() {
        super('EvaluatorAgent', 'Judge');
    }

    async execute(context) {
        // Context: { challengeId, userFlag }
        const { challengeId, userFlag } = context;
        const challenge = challengeStore.getById(challengeId);

        if (!challenge) {
            return { error: 'Challenge not found' };
        }

        const isCorrect = userFlag.trim() === challenge.flag;

        if (isCorrect) {
            return {
                correct: true,
                message: 'Correct! Well done.',
                explanation: challenge.explanation
            };
        } else {
            return {
                correct: false,
                message: 'Incorrect flag. Keep trying!',
                explanation: null
            };
        }
    }
}

export default new EvaluatorAgent();
