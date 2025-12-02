'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [username, setUsername] = useState('');
  const router = useRouter();

  const handleInitialize = (e) => {
    e.preventDefault();
    if (username.trim()) {
      localStorage.setItem('ctf_username', username.trim());
      router.push('/play');
    } else {
      alert('Please identify yourself first.');
    }
  };

  return (
    <div className="cyber-container" style={{ textAlign: 'center', justifyContent: 'center', overflowY: 'auto' }}>

      <h1 style={{ fontSize: '4rem', marginBottom: '1rem', textShadow: '0 0 20px var(--accent-color)' }}>
        CYBER CTF AGENT
      </h1>
      <p style={{ fontSize: '1.5rem', marginBottom: '3rem', color: '#8b949e' }}>
        Master cybersecurity with AI-powered adaptive challenges.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>

        <input
          type="text"
          placeholder="ENTER CODENAME..."
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="cyber-input"
          style={{
            background: 'transparent',
            border: '1px solid var(--accent-color)',
            color: 'var(--accent-color)',
            padding: '1rem',
            fontSize: '1.2rem',
            width: '300px',
            textAlign: 'center',
            fontFamily: 'monospace'
          }}
        />

        <div style={{ display: 'flex', gap: '2rem' }}>
          <button onClick={handleInitialize} className="btn" style={{ fontSize: '1.2rem', padding: '1rem 2rem', cursor: 'pointer' }}>
            INITIALIZE_SESSION
          </button>
          <Link href="/leaderboard" className="btn" style={{ background: 'transparent', border: '1px solid var(--accent-color)', color: 'var(--accent-color)', fontSize: '1.2rem', padding: '1rem 2rem' }}>
            VIEW_LEADERBOARD
          </Link>
        </div>
      </div>

      <div style={{ marginTop: '5rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
        <div className="card">
          <h3>Adaptive AI</h3>
          <p>Challenges that evolve with your skill level.</p>
        </div>
        <div className="card">
          <h3>Interactive Hints</h3>
          <p>Get stuck? Our Hint Agent is here to guide you.</p>
        </div>
        <div className="card">
          <h3>Real-time Feedback</h3>
          <p>Instant evaluation and detailed explanations.</p>
        </div>
      </div>
    </div>
  );
}
