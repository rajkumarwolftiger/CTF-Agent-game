'use server';

import { userStore } from '@/lib/store/user_store';

export async function loginUser(username) {
    return userStore.login(username);
}

export async function getUser(username) {
    return userStore.getUser(username);
}

export async function getLeaderboard() {
    return userStore.getAllUsers();
}

export async function updateScore(username, points, challengeId) {
    return userStore.updateScore(username, points, challengeId);
}

export async function addBadge(username, badge) {
    return userStore.addBadge(username, badge);
}

import challengeGenerator from '@/lib/agents/challenge_generator';

export async function generateChallengeAction(context) {
    const challenge = await challengeGenerator.execute(context);
    return challenge;
}

import hintAgent from '@/lib/agents/hint_agent';
import evaluatorAgent from '@/lib/agents/evaluator_agent';
import metaAgent from '@/lib/agents/meta_agent';

export async function getHintAction(context) {
    return hintAgent.execute(context);
}

export async function evaluateFlagAction(context) {
    return evaluatorAgent.execute(context);
}

export async function getMetaDecisionAction(context) {
    return metaAgent.execute(context);
}
