import React from 'react';
import { C } from '../../ParryFSApp.jsx';
import { PlaybookHeader, PlaybookDisclaimer, TILES } from './shared.jsx';

export default function Hub({ onExit, onNavigate }) {
  return (
    <div>
      <PlaybookHeader onExit={onExit} onBackToHub={() => {}} />
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '500', color: C.textPrimary, margin: '0 0 0.5rem' }}>First Home Playbook</h1>
        <p style={{ fontSize: '15px', color: C.textSecondary, maxWidth: '520px', margin: '0 auto' }}>
          Everything you need to get your bearings as a first home buyer in New Zealand, tools, guides, and a straightforward way to talk it through with Dan.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
        {TILES.map((tile) => (
          <button
            key={tile.id}
            onClick={() => onNavigate(tile.path)}
            style={{
              textAlign: 'left',
              background: C.cardBg,
              border: 'none',
              borderRadius: '18px',
              padding: '1.5rem',
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
              transition: 'transform 0.15s',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: C.accentLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className={`ti ${tile.icon}`} style={{ fontSize: '20px', color: C.accent }} />
            </div>
            <p style={{ fontSize: '16px', fontWeight: '600', color: C.textPrimary, margin: 0 }}>{tile.title}</p>
            <p style={{ fontSize: '13px', color: C.textSecondary, margin: 0, lineHeight: 1.5 }}>{tile.blurb}</p>
          </button>
        ))}
      </div>

      <PlaybookDisclaimer onNavigate={onNavigate} />
    </div>
  );
}
