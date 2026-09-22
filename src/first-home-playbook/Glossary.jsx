import React, { useState, useEffect } from 'react';
import { C } from '../../ParryFSApp.jsx';
import { PlaybookHeader, PlaybookCard, PlaybookDisclaimer, PLAYBOOK_ROOT } from './shared.jsx';
import { GLOSSARY_GROUPS } from './content.js';

export default function Glossary({ onExit, onBackToHub, onNavigate, hash }) {
  const [query, setQuery] = useState('');

  // Deep-link support: /first-home-playbook/glossary#some-anchor scrolls to
  // that term, whether arriving via a fresh load or an in-app navigate()
  // that only changed the hash while staying on this page.
  useEffect(() => {
    if (!hash) return;
    const raf = requestAnimationFrame(() => {
      const el = document.getElementById(hash);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    return () => cancelAnimationFrame(raf);
  }, [hash]);

  const q = query.trim().toLowerCase();
  const groups = GLOSSARY_GROUPS.map((g) => ({
    ...g,
    terms: q ? g.terms.filter((t) => t.term.toLowerCase().includes(q) || t.body.toLowerCase().includes(q)) : g.terms,
  })).filter((g) => g.terms.length > 0);

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

        {groups.length === 0 && <p style={{ fontSize: '14px', color: C.textMuted }}>No terms match "{query}".</p>}

        {groups.map((g) => (
          <div key={g.heading} style={{ marginBottom: '1.75rem' }}>
            <h2 style={{ fontSize: '13px', fontWeight: '700', letterSpacing: '0.02em', textTransform: 'uppercase', color: C.textMuted, margin: '0 0 0.5rem' }}>{g.heading}</h2>
            {g.terms.map((t) => (
              <div key={t.anchor} id={t.anchor} style={{ borderBottom: `1px solid ${C.borderLight}`, padding: '0.9rem 0', scrollMarginTop: '1.5rem' }}>
                <p style={{ fontSize: '15px', fontWeight: '600', color: C.textPrimary, margin: '0 0 0.3rem' }}>{t.term}</p>
                <p style={{ fontSize: '14px', color: C.textSecondary, lineHeight: 1.6, margin: 0 }}>
                  {t.body}
                  {t.readMore && (
                    <>
                      {' '}
                      <a
                        href={`${PLAYBOOK_ROOT}/deposit-sources#bank-vs-seller-deposit`}
                        onClick={(e) => {
                          if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
                          e.preventDefault();
                          onNavigate('/deposit-sources#bank-vs-seller-deposit');
                        }}
                        style={{ color: C.accent, textDecoration: 'underline', textDecorationStyle: 'dotted', textUnderlineOffset: '3px' }}
                      >
                        Read more in Deposit Sources
                      </a>
                    </>
                  )}
                </p>
              </div>
            ))}
          </div>
        ))}

        <PlaybookDisclaimer />
      </PlaybookCard>
    </div>
  );
}
