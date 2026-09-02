import React from 'react';
import { C } from '../../ParryFSApp.jsx';
import { PlaybookHeader, PlaybookCard, PlaybookDisclaimer, BookCallCTA } from './shared.jsx';

export default function GuidePage({ content, onExit, onBackToHub, onNavigate }) {
  return (
    <div>
      <PlaybookHeader title={content.title} onExit={onExit} onBackToHub={onBackToHub} />
      <PlaybookCard>
        <h1 style={{ fontSize: '24px', fontWeight: '500', color: C.textPrimary, margin: '0 0 0.75rem' }}>{content.title}</h1>
        <p style={{ fontSize: '15px', color: C.textSecondary, lineHeight: 1.7, margin: '0 0 1.5rem' }}>{content.intro}</p>

        {content.sections.map((s) => (
          <div key={s.heading} style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: C.textPrimary, margin: '0 0 0.5rem' }}>{s.heading}</h3>
            {s.body && <p style={{ fontSize: '14px', color: C.textSecondary, lineHeight: 1.7, margin: 0 }}>{s.body}</p>}
            {s.list && (
              <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem' }}>
                {s.list.map((item) => (
                  <li key={item} style={{ fontSize: '14px', color: C.textSecondary, lineHeight: 1.7, marginBottom: '0.35rem' }}>{item}</li>
                ))}
              </ul>
            )}
          </div>
        ))}

        <div style={{ background: C.accentLight, borderRadius: '12px', padding: '1.25rem', marginTop: '0.5rem' }}>
          <p style={{ fontSize: '13px', fontWeight: '600', color: C.textPrimary, margin: '0 0 0.25rem' }}>The bottom line</p>
          <p style={{ fontSize: '14px', color: C.textSecondary, lineHeight: 1.7, margin: 0 }}>{content.bottomLine}</p>
        </div>

        <BookCallCTA onNavigate={onNavigate} />
        <PlaybookDisclaimer onNavigate={onNavigate} />
      </PlaybookCard>
    </div>
  );
}
