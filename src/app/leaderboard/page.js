'use client';
import Link from 'next/link';
import { getLeaderboard } from '@/app/actions';
import { useEffect, useState } from 'react';

export default function Leaderboard() {
    const [leaders, setLeaders] = useState([]);

    useEffect(() => {
        // Fetch users from server action
        getLeaderboard().then(allUsers => {
            const rankedUsers = allUsers.map((u, index) => ({
                ...u,
                rank: index + 1
            }));
            setLeaders(rankedUsers);
        });
    }, []);

    return (
        <div className="cyber-container" style={{ textAlign: 'center', marginTop: '5vh' }}>
            <h1 style={{ fontSize: '3rem', marginBottom: '2rem', color: 'var(--accent-color)' }}>
                GLOBAL_LEADERBOARD
            </h1>

            <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-color)', color: '#8b949e' }}>
                            <th style={{ padding: '1rem' }}>RANK</th>
                            <th style={{ padding: '1rem' }}>OPERATIVE</th>
                            <th style={{ padding: '1rem' }}>SCORE</th>
                            <th style={{ padding: '1rem' }}>BADGES</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leaders.map((l) => (
                            <tr key={l.rank} style={{ borderBottom: '1px solid #30363d' }}>
                                <td style={{ padding: '1rem', color: l.rank === 1 ? '#ffbd2e' : 'inherit' }}>#{l.rank}</td>
                                <td style={{ padding: '1rem', fontWeight: 'bold' }}>{l.username}</td>
                                <td style={{ padding: '1rem', fontFamily: 'var(--font-mono)' }}>{l.score}</td>
                                <td style={{ padding: '1rem' }}>
                                    {l.badges.map(b => (
                                        <span key={b} style={{
                                            fontSize: '0.8rem',
                                            background: '#1f6feb',
                                            padding: '0.2rem 0.5rem',
                                            borderRadius: '10px',
                                            marginRight: '0.5rem'
                                        }}>
                                            {b}
                                        </span>
                                    ))}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div style={{ marginTop: '3rem' }}>
                <Link href="/" className="btn" style={{ background: 'transparent', border: '1px solid var(--text-color)' }}>
                    RETURN_TO_BASE
                </Link>
            </div>
        </div>
    );
}
