import React, { useState } from 'react';
import { C } from '../../ParryFSApp.jsx';
import { PlaybookHeader, PlaybookCard, PlaybookDisclaimer, BookCallCTA } from './shared.jsx';
import { GLOSSARY_TERMS } from './content.js';

export default function Glossary({ onExit, onBackToHub, onNavigate }) {
  const [query, setQuery] = useState('');
  const filtered = GLOSSARY_TERMS.filter((t) => t.term.toLowerCase().includes(query.toLowerCase()));

  return (
    <div>
      <PlaybookHeader title="Jargon Glossary" onExit={onExit} onBackToHub={onBackToHub} />
      <PlaybookCard>
        <h1 style={{ fontSize: '24px', fontWeight: '500', color: C.textPrimary, margin: '0 0 0.25rem' }}>First Home Buyer Terms, In Plain English</h1>
        <p style={{ fontSize: '13px', color: C.textMuted, margin: '0 0 1.25rem' }}>This list keeps growing over time.</p>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a term..."
          style={{ width: '100%', boxSizing: 'border-box', background: C.inputBg, border: 'none', borderRadius: '12px', padding: '0.875rem 1.125rem', fontSize: '15px', color: C.textPrimary, outline: 'none', marginBottom: '1.5rem' }}
        />

        {filtered.map((t) => (
          <div key={t.term} style={{ borderBottom: `1px solid ${C.borderLight}`, padding: '0.9rem 0' }}>
            <p style={{ fontSize: '15px', fontWeight: '600', color: C.textPrimary, margin: '0 0 0.3rem' }}>{t.term}</p>
            <p style={{ fontSize: '14px', color: C.textSecondary, lineHeight: 1.6, margin: 0 }}>{t.body}</p>
          </div>
        ))}
        {filtered.length === 0 && <p style={{ fontSize: '14px', color: C.textMuted }}>No terms match "{query}".</p>}

        <BookCallCTA onNavigate={onNavigate} />
        <PlaybookDisclaimer onNavigate={onNavigate} />
      </PlaybookCard>
    </div>
  );
}
