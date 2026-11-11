import React from 'react';
import { C } from '../../ParryFSApp.jsx';
import { PlaybookHeader, PlaybookDisclaimer, TILES, useJourneyProgress } from './shared.jsx';
import { journeyProgressFor } from './content.js';

// Ticks are shared across both paths, so show whichever path has more done.
function bestJourneyProgress(checklist) {
  if (!checklist) return null;
  let best = null;
  for (const path of ['negotiation', 'auction']) {
    const { ticked, total, pct } = journeyProgressFor(checklist, path);
    if (ticked > 0 && (!best || pct > best.pct)) best = { doneTodos: ticked, totalTodos: total, pct };
  }
  return best;
}

export default function Hub({ onExit, onNavigate }) {
  const checklist = useJourneyProgress();
  const journeyProgress = bestJourneyProgress(checklist);

  return (
    <div>
      <PlaybookHeader onExit={onExit} onBackToHub={() => {}} />
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
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: tile.id === 'book-a-call' ? '#FDECE9' : C.accentLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className={`ti ${tile.icon}`} style={{ fontSize: '20px', color: tile.id === 'book-a-call' ? C.red : C.accent }} />
            </div>
            <p style={{ fontSize: '16px', fontWeight: '600', color: C.textPrimary, margin: 0 }}>{tile.title}</p>
            <p style={{ fontSize: '13px', color: C.textSecondary, margin: 0, lineHeight: 1.5 }}>{tile.blurb}</p>
            {tile.id === 'journey' && journeyProgress && (
              <div style={{ marginTop: '0.25rem' }}>
                <div style={{ height: '6px', borderRadius: '3px', background: C.inputBg, overflow: 'hidden' }}>
                  <div style={{ width: `${journeyProgress.pct}%`, height: '100%', background: C.accent, borderRadius: '3px' }} />
                </div>
                <p style={{ fontSize: '12px', color: C.textMuted, margin: '0.4rem 0 0' }}>
                  {journeyProgress.doneTodos} of {journeyProgress.totalTodos} to-dos done{journeyProgress.pct === 100 ? ' · complete' : ' · continue'}
                </p>
              </div>
            )}
          </button>
        ))}
      </div>

      <PlaybookDisclaimer />
    </div>
  );
}
