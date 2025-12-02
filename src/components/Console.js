'use client';
import React, { useState, useEffect, useRef } from 'react';

export default function Console({ logs = [], onCommand }) {
    const bottomRef = useRef(null);
    const [input, setInput] = useState('');

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (input.trim() && onCommand) {
            onCommand(input);
            setInput('');
        }
    };

    return (
        <div className="terminal-window" style={{ height: '100%' }}>
            <div className="terminal-header">
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f56', marginRight: 6 }}></div>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ffbd2e', marginRight: 6 }}></div>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#27c93f', marginRight: 10 }}></div>
                <span>root@cyber-agent:~</span>
            </div>
            <div className="terminal-body">
                {logs.map((log, i) => (
                    <div key={i} style={{ color: log.type === 'error' ? 'var(--error-color)' : log.type === 'success' ? 'var(--success-color)' : 'inherit', marginBottom: '0.5rem', wordBreak: 'break-word' }}>
                        <span style={{ opacity: 0.5, marginRight: '0.5rem' }}>[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                        {log.sender && <span style={{ fontWeight: 'bold', color: log.senderColor || 'inherit' }}>{log.sender}: </span>}
                        {log.message}
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>
            <form onSubmit={handleSubmit} style={{ borderTop: '1px solid var(--border-color)', padding: '0.5rem', display: 'flex' }}>
                <span style={{ marginRight: '0.5rem', color: 'var(--accent-color)' }}>$</span>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="input-field"
                    style={{ border: 'none', outline: 'none', background: 'transparent', flex: 1 }}
                    autoFocus
                    placeholder="Type a command or flag..."
                />
            </form>
        </div>
    );
}
