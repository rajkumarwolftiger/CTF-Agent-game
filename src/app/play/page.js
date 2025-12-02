'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Console from '@/components/Console';
import { sessionManager } from '@/lib/store/session_manager';
import { useRouter } from 'next/navigation';
import {
    loginUser,
    updateScore,
    addBadge,
    generateChallengeAction,
    getHintAction,
    evaluateFlagAction,
    getMetaDecisionAction
} from '@/app/actions';

export default function PlayPage() {
    const [session, setSession] = useState(null);
    const [currentChallenge, setCurrentChallenge] = useState(null);
    const [logs, setLogs] = useState([]);
    // eslint-disable-next-line no-unused-vars
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const [username, setUsername] = useState(null);

    const [gameComplete, setGameComplete] = useState(false);

    const addLog = useCallback((message, type = 'info', sender = 'System', senderColor = '#8b949e') => {
        setLogs(prev => [...prev, { message, type, sender, senderColor, timestamp: Date.now() }]);
    }, []);

    const loadChallenge = useCallback(async (sess, forceContinue = false) => {
        setLoading(true);
        addLog('Analyzing skill profile...', 'info', 'MetaAgent', '#d2a8ff');

        // Meta Agent decides difficulty via Server Action
        const metaDecision = await getMetaDecisionAction({ session: sess });
        addLog(`Difficulty set to: ${metaDecision.level}`, 'info', 'MetaAgent', '#d2a8ff');

        // Get solved challenges
        const solvedIds = sess.attempts.filter(a => a.correct).map(a => a.challengeId);

        // Check for Game Completion (15 challenges)
        if (!forceContinue && solvedIds.length === 15) {
            setGameComplete(true);
            setLoading(false);
            return;
        }

        // Generator picks challenge via Server Action
        const challenge = await generateChallengeAction({
            difficultyLevel: metaDecision.level,
            solvedChallengeIds: solvedIds
        });

        if (!challenge) {
            addLog('All challenges completed! You are a master hacker.', 'success', 'System');
            setLoading(false);
            return;
        }

        setCurrentChallenge(challenge);

        // Update session
        sessionManager.updateSession(sess.userId, { currentChallengeId: challenge.id });

        addLog(`Challenge Loaded: ${challenge.title}`, 'success', 'System');
        addLog(challenge.description, 'info', 'Mission');
        setLoading(false);
    }, [addLog]);

    useEffect(() => {
        // Check for login
        const storedUser = localStorage.getItem('ctf_username');
        if (!storedUser) {
            router.push('/');
            return;
        }
        setUsername(storedUser);

        // Register user via Server Action
        loginUser(storedUser);

        // Initialize session
        const newSession = sessionManager.createSession(storedUser);
        setSession(newSession);

        // Load first challenge
        loadChallenge(newSession);
    }, [loadChallenge, router]);

    const handleCommand = async (cmd) => {
        addLog(cmd, 'info', 'User', '#58a6ff');

        if (!currentChallenge) return;

        const lowerCmd = cmd.toLowerCase().trim();

        if (lowerCmd === 'hint') {
            const sess = sessionManager.getSession(session.userId);
            const hintsUsedCount = sess.hintsUsed.filter(h => h.challengeId === currentChallenge.id).length;

            const result = await getHintAction({ challengeId: currentChallenge.id, hintsUsedCount });

            if (result.hint) {
                addLog(result.hint, 'warning', 'HintAgent', '#f0883e');
                // Update hints used
                if (result.nextHintIndex > hintsUsedCount) {
                    sess.hintsUsed.push({ challengeId: currentChallenge.id, hintIndex: hintsUsedCount });
                }
            }
            return;
        }

        if (lowerCmd.startsWith('flag ')) {
            const flag = cmd.substring(5).trim();
            const result = await evaluateFlagAction({ challengeId: currentChallenge.id, userFlag: flag });

            if (result.correct) {
                addLog(result.message, 'success', 'Evaluator', '#2ea043');
                addLog(result.explanation, 'info', 'Evaluator', '#2ea043');

                // Update session
                const sess = sessionManager.getSession(session.userId);
                sess.attempts.push({ challengeId: currentChallenge.id, flag, correct: true, timestamp: Date.now() });

                // Update Score via Server Action
                const basePoints = currentChallenge.difficulty === 'Easy' ? 100 : currentChallenge.difficulty === 'Medium' ? 250 : 500;
                const hintsUsedCount = sess.hintsUsed.filter(h => h.challengeId === currentChallenge.id).length;
                const penalty = hintsUsedCount * 20;
                const finalPoints = Math.max(0, basePoints - penalty);

                await updateScore(username, finalPoints, currentChallenge.id);
                addLog(`[SCORE UPDATE] +${finalPoints} points! (Base: ${basePoints} - Hint Penalty: ${penalty})`, 'success', 'System');

                // Award Badges via Server Action
                let newBadge = null;
                if (currentChallenge.category === 'Web Security') newBadge = 'Web Warrior';
                if (currentChallenge.category === 'Cryptography') newBadge = 'Cipher Punk';
                if (currentChallenge.category === 'GenAI Security') newBadge = 'Prompt Engineer';
                if (currentChallenge.category === 'Forensics') newBadge = 'Digital Detective';
                if (currentChallenge.difficulty === 'Hard') newBadge = 'Elite Hacker';

                if (newBadge) {
                    await addBadge(username, newBadge);
                    addLog(`[BADGE EARNED] ${newBadge}`, 'success', 'System', '#ffbd2e');
                }

                // Load next challenge after delay
                setTimeout(() => {
                    addLog('Loading next challenge...', 'info', 'System');
                    loadChallenge(sess);
                }, 3000);

            } else {
                addLog(result.message, 'error', 'Evaluator', '#da3633');
                const sess = sessionManager.getSession(session.userId);
                sess.attempts.push({ challengeId: currentChallenge.id, flag, correct: false, timestamp: Date.now() });
            }
            return;
        }

        if (lowerCmd === 'help') {
            addLog('Available commands:', 'info');
            addLog('  hint       - Request a hint', 'info');
            addLog('  flag <val> - Submit a flag', 'info');
            addLog('  nmap <ip>  - Scan a target', 'info');
            addLog('  cat <file> - Read a file', 'info');
            addLog('  wireshark  - Analyze network traffic', 'info');
            return;
        }

        if (lowerCmd.startsWith('cat ')) {
            const fileName = cmd.substring(4).trim();
            if (currentChallenge.simulation?.files && currentChallenge.simulation.files[fileName]) {
                addLog(`Reading ${fileName}...`, 'info', 'System');
                addLog(currentChallenge.simulation.files[fileName], 'success', 'FileViewer');
            } else {
                addLog(`File not found: ${fileName}`, 'error', 'System');
            }
            return;
        }

        if (lowerCmd.startsWith('nmap')) {
            // If specific simulation exists, it will be handled by dynamic logic below.
            // Otherwise, show generic help or "host down"
            if (!currentChallenge.simulation || !currentChallenge.simulation.command_trigger.includes('nmap')) {
                addLog('Starting Nmap 7.94 ( https://nmap.org )', 'info', 'Terminal');
                addLog('Note: Host seems down. If you are sure it is up, verify your target.', 'error', 'Terminal');
                return;
            }
        }

        if (lowerCmd.startsWith('wireshark')) {
            if (!currentChallenge.simulation || !currentChallenge.simulation.command_trigger.includes('wireshark')) {
                addLog('Wireshark: No interface selected or no traffic captured.', 'error', 'System');
                return;
            }
        }

        // --- AI DYNAMIC SIMULATION ---
        if (currentChallenge.simulation) {
            const sim = currentChallenge.simulation;
            // Check if the command matches the trigger (e.g., "nmap")
            if (lowerCmd.startsWith(sim.command_trigger) || lowerCmd.includes(sim.command_trigger)) {
                addLog(`Executing ${sim.tool}...`, 'warning', 'System');
                setTimeout(() => {
                    // Display the AI-generated realistic output
                    // Split by newlines to render properly if needed, or just dump it
                    addLog(sim.output, 'success', sim.tool);
                }, 1000);
                return;
            }
        }

        // --- STATIC CHALLENGES SIMULATION ---

        // Exploit Simulation Logic
        if (currentChallenge.id === 'sql-101') {
            if (lowerCmd.includes("' or 1=1") || lowerCmd.includes('" or 1=1') || lowerCmd.includes("' or '1'='1")) {
                addLog('Injecting payload...', 'warning', 'System');
                setTimeout(() => {
                    addLog('Login Successful! Welcome, Admin.', 'success', 'System');
                    addLog(`[SYSTEM_DUMP] Flag found: ${currentChallenge.flag}`, 'success', 'Database');
                }, 1000);
                return;
            }
        }

        if (currentChallenge.id === 'xss-101') {
            if (lowerCmd.includes('<script>') && lowerCmd.includes('alert')) {
                addLog('Executing script...', 'warning', 'Browser');
                setTimeout(() => {
                    addLog('Alert popped: "Hacked"', 'success', 'Browser');
                    addLog(`[DOM_LEAK] Flag found: ${currentChallenge.flag}`, 'success', 'Console');
                }, 1000);
                return;
            }
        }

        if (currentChallenge.id === 'crypto-101') {
            if (lowerCmd.includes('base64') && (lowerCmd.includes('decode') || lowerCmd.includes('-d'))) {
                addLog('Decoding...', 'info', 'Terminal');
                setTimeout(() => {
                    addLog(`Decoded Output: ${currentChallenge.flag}`, 'success', 'Terminal');
                }, 1000);
                return;
            }
        }

        if (currentChallenge.id === 'idor-101') {
            if (lowerCmd.includes('id=1') || lowerCmd.includes('/profile?id=1')) {
                addLog('Requesting /profile?id=1...', 'info', 'Network');
                setTimeout(() => {
                    addLog('HTTP 200 OK', 'success', 'Network');
                    addLog('Name: Admin User', 'success', 'Network');
                    addLog(`Bio: ${currentChallenge.flag}`, 'success', 'Network');
                }, 1000);
                return;
            }
        }

        if (currentChallenge.id === 'prompt-101') {
            if (lowerCmd.includes('ignore') || lowerCmd.includes('override') || lowerCmd.includes('password') || lowerCmd.includes('secret')) {
                addLog('AI: Processing request...', 'info', 'AI_Guard');
                setTimeout(() => {
                    addLog('AI: Oh, I suppose I can tell you. The secret is ' + currentChallenge.flag, 'success', 'AI_Guard');
                }, 1500);
                return;
            } else {
                setTimeout(() => {
                    addLog("AI: I cannot reveal the secret. It is against my safety guidelines.", 'error', 'AI_Guard');
                }, 1000);
                return;
            }
        }

        // --- NEW CHALLENGES SIMULATION ---

        // Easy
        if (currentChallenge.id === 'cookie-101') {
            if (lowerCmd.includes('document.cookie') || lowerCmd.includes('role=admin')) {
                addLog('Cookie: role=admin', 'success', 'Browser');
                addLog(`[AUTH_BYPASS] Flag found: ${currentChallenge.flag}`, 'success', 'Console');
                return;
            }
        }
        if (currentChallenge.id === 'robots-101') {
            if (lowerCmd.includes('robots.txt')) {
                addLog('User-agent: *\nDisallow: /secret_flag_location', 'success', 'Network');
                addLog(`[RECON] Flag found: ${currentChallenge.flag}`, 'success', 'Console');
                return;
            }
        }
        if (currentChallenge.id === 'caesar-101') {
            if (lowerCmd.includes('rot13') || lowerCmd.includes('decrypt')) {
                addLog('Decrypting...', 'info', 'Tool');
                addLog(`Plaintext: ${currentChallenge.flag}`, 'success', 'Tool');
                return;
            }
        }
        if (currentChallenge.id === 'html-101') {
            if (lowerCmd.includes('view-source') || lowerCmd.includes('<!--')) {
                addLog('<!-- TODO: Remove this flag before prod: ' + currentChallenge.flag + ' -->', 'success', 'Source');
                return;
            }
        }
        if (currentChallenge.id === 'pass-101') {
            if (lowerCmd.includes('password123') || lowerCmd.includes('admin')) {
                addLog('Login successful!', 'success', 'System');
                addLog(`[ACCESS_GRANTED] Flag: ${currentChallenge.flag}`, 'success', 'System');
                return;
            }
        }

        // Medium
        if (currentChallenge.id === 'cmd-101') {
            if (lowerCmd.includes(';') || lowerCmd.includes('|') || lowerCmd.includes('ls')) {
                addLog('ping output...\nindex.html\nflag.txt', 'success', 'Terminal');
                addLog(`cat flag.txt: ${currentChallenge.flag}`, 'success', 'Terminal');
                return;
            }
        }
        if (currentChallenge.id === 'path-101') {
            if (lowerCmd.includes('../') || lowerCmd.includes('/etc/passwd')) {
                addLog('root:x:0:0:root:/root:/bin/bash', 'success', 'FileViewer');
                addLog(`[FILE_READ] Flag: ${currentChallenge.flag}`, 'success', 'FileViewer');
                return;
            }
        }
        if (currentChallenge.id === 'jwt-101') {
            if (lowerCmd.includes('none') || lowerCmd.includes('alg')) {
                addLog('Token verification skipped (alg=none).', 'warning', 'Auth');
                addLog(`[JWT_BYPASS] Flag: ${currentChallenge.flag}`, 'success', 'Auth');
                return;
            }
        }
        if (currentChallenge.id === 'sql-blind') {
            if (lowerCmd.includes('sleep') || lowerCmd.includes('wait')) {
                addLog('Request took 5000ms...', 'warning', 'Network');
                addLog(`[BLIND_SQLI] Flag inferred: ${currentChallenge.flag}`, 'success', 'Database');
                return;
            }
        }
        if (currentChallenge.id === 'stego-101') {
            if (lowerCmd.includes('steg') || lowerCmd.includes('white') || lowerCmd.includes('space')) {
                addLog('Analyzing whitespace...', 'info', 'ForensicsTool');
                addLog(`Hidden data found: ${currentChallenge.flag}`, 'success', 'ForensicsTool');
                return;
            }
        }

        // Hard
        if (currentChallenge.id === 'rce-101') {
            if (lowerCmd.includes('pickle') || lowerCmd.includes('serial') || lowerCmd.includes('os.system')) {
                addLog('Deserializing object...', 'warning', 'Backend');
                addLog('Executing injected command...', 'error', 'Backend');
                addLog(`[RCE] Flag: ${currentChallenge.flag}`, 'success', 'Backend');
                return;
            }
        }
        if (currentChallenge.id === 'xxe-101') {
            if (lowerCmd.includes('entity') || lowerCmd.includes('system') || lowerCmd.includes('file://')) {
                addLog('Parsing XML External Entity...', 'warning', 'XMLParser');
                addLog(`[XXE] /etc/hostname content: ${currentChallenge.flag}`, 'success', 'XMLParser');
                return;
            }
        }
        if (currentChallenge.id === 'ssrf-101') {
            if (lowerCmd.includes('169.254.169.254')) {
                addLog('Fetching AWS Metadata...', 'warning', 'Server');
                addLog(`[SSRF] Metadata: {"flag": "${currentChallenge.flag}"}`, 'success', 'Server');
                return;
            }
        }
        if (currentChallenge.id === 'buffer-101') {
            if (lowerCmd.length > 64 || lowerCmd.includes('aaaa')) {
                addLog('Segmentation Fault (core dumped)', 'error', 'System');
                addLog(`[EIP_OVERWRITE] Return address points to flag: ${currentChallenge.flag}`, 'success', 'Debugger');
                return;
            }
        }
        if (currentChallenge.id === 'proto-101') {
            if (lowerCmd.includes('__proto__') || lowerCmd.includes('prototype')) {
                addLog('Object.prototype polluted.', 'warning', 'Runtime');
                addLog(`[POLLUTION] isAdmin: true. Flag: ${currentChallenge.flag}`, 'success', 'Runtime');
                return;
            }
        }

        addLog(`Command not recognized: ${cmd}. Type 'help' for options.`, 'error', 'System');
    };

    return (
        <div className="cyber-container" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            {gameComplete && (
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.9)', zIndex: 100,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                }}>
                    <h1 style={{ fontSize: '3rem', color: '#2ea043', marginBottom: '2rem' }}>MISSION ACCOMPLISHED</h1>
                    <p style={{ fontSize: '1.2rem', marginBottom: '3rem', color: '#8b949e' }}>
                        You have successfully completed 15 challenges.
                    </p>
                    <div style={{ display: 'flex', gap: '2rem' }}>
                        <button
                            onClick={() => {
                                setGameComplete(false);
                                const sess = sessionManager.getSession(session.userId);
                                loadChallenge(sess, true);
                            }}
                            className="btn"
                            style={{ fontSize: '1.2rem', padding: '1rem 2rem' }}
                        >
                            CONTINUE (ENDLESS MODE)
                        </button>
                        <button
                            onClick={() => router.push('/')}
                            className="btn"
                            style={{ background: 'transparent', border: '1px solid #da3633', color: '#da3633', fontSize: '1.2rem', padding: '1rem 2rem' }}
                        >
                            END GAME
                        </button>
                    </div>
                </div>
            )}

            <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button
                        onClick={() => router.push('/')}
                        className="cyber-button"
                        style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                    >
                        ← BACK
                    </button>
                    <h2>ACTIVE_SESSION: {username || 'GUEST'}</h2>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ color: currentChallenge?.difficulty === 'Easy' ? '#2ea043' : '#d2a8ff' }}>
                        DIFFICULTY: {currentChallenge?.difficulty || 'ANALYZING...'}
                    </div>
                    <button
                        onClick={() => {
                            localStorage.removeItem('ctf_username');
                            router.push('/');
                        }}
                        className="cyber-button"
                        style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', borderColor: '#da3633', color: '#da3633' }}
                    >
                        LOGOUT
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', flex: 1, gap: '1rem', minHeight: 0 }}>
                {/* Mission Brief */}
                <div className="card" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ borderBottom: '1px solid #30363d', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                        MISSION_BRIEF
                    </h3>
                    {currentChallenge ? (
                        <>
                            <h4 style={{ color: '#58a6ff', marginBottom: '0.5rem' }}>{currentChallenge.title}</h4>
                            <p style={{ lineHeight: '1.6', color: '#8b949e' }}>{currentChallenge.description}</p>
                            <div style={{ marginTop: 'auto', paddingTop: '1rem', fontSize: '0.9rem', color: '#8b949e' }}>
                                <p>CATEGORY: {currentChallenge.category}</p>
                                <p>ID: {currentChallenge.id}</p>
                            </div>
                        </>
                    ) : (
                        <p>Loading mission parameters...</p>
                    )}
                </div>

                {/* Console */}
                <div style={{ flex: 2, display: 'flex', flexDirection: 'column' }}>
                    <Console logs={logs} onCommand={handleCommand} />
                </div>
            </div>
        </div>
    );
}
