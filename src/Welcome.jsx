import React, { useEffect } from 'react';
import { C, card, useWindowWidth } from '../ParryFSApp.jsx';
import { PlaybookVideo } from './first-home-playbook/shared.jsx';
import { PLAYBOOK_VIDEOS, PLAYBOOK_VIDEO_CAPTIONS } from './first-home-playbook/videos.js';

// Landing page for people arriving from the Facebook / Instagram lead form's
// thank you screen. Not linked in the menu and kept out of Google.

function Link({ to, go, style, children }) {
  return (
    <a href={to} onClick={(e) => { if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return; e.preventDefault(); go(to); }} style={style}>
      {children}
    </a>
  );
}

const NEXT = [
  { title: 'Run the Borrow Checker', body: 'It works out what you could borrow using typical bank lending criteria. Rough numbers are fine to start.' },
  { title: 'Look around the Playbook', body: 'Guides on deposits, hidden costs and Kāinga Ora, plus the full journey from pre-approval to keys.' },
  { title: 'Talk to us when you are ready', body: "Not sure what your results mean? We'll go through them with you. Free, no pressure, no credit check." },
];

export default function Welcome({ go }) {
  const isMobile = useWindowWidth() < 768;

  // Keep this page out of search results
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex';
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  return (
    <div>
      <div style={{ ...card, padding: isMobile ? '1.5rem' : '2.25rem' }}>
        <PlaybookVideo videoId={PLAYBOOK_VIDEOS.welcome} caption={PLAYBOOK_VIDEO_CAPTIONS.welcome} />

        <h2 style={{ margin: '0 0 1.25rem', fontSize: isMobile ? '22px' : '26px', fontWeight: 700, color: C.navy }}>Your next steps</h2>
        <ol style={{ listStyle: 'none', margin: '0 0 1.75rem', padding: 0, display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          {NEXT.map((n, i) => (
            <li key={n.title} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <span aria-hidden="true" style={{ width: '32px', height: '32px', borderRadius: '50%', background: i === 0 ? C.red : C.navy, color: 'white', fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</span>
              <div>
                <p style={{ margin: '4px 0 3px', fontSize: '16px', fontWeight: 600, color: C.navy }}>{n.title}</p>
                <p style={{ margin: 0, fontSize: '15px', lineHeight: 1.6, color: C.textSecondary }}>{n.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '12px' }}>
          <Link to="/borrow-checker" go={go} style={{ padding: '17px 28px', borderRadius: '14px', background: C.red, color: 'white', fontWeight: 600, fontSize: '17px', textDecoration: 'none', textAlign: 'center' }}>
            Start the Borrow Checker
          </Link>
          <Link to="/first-home-playbook" go={go} style={{ padding: '16px 28px', borderRadius: '14px', border: `1px solid ${C.borderLight}`, background: 'white', color: C.navy, fontWeight: 600, fontSize: '17px', textDecoration: 'none', textAlign: 'center' }}>
            Explore the Playbook
          </Link>
        </div>
        <p style={{ margin: '1.25rem 0 0', fontSize: '14px', color: C.textSecondary }}>
          Rather talk it through first? <Link to="/first-home-playbook/book-a-call" go={go} style={{ color: C.accent, fontWeight: 600 }}>Get your plan</Link>
        </p>
      </div>
    </div>
  );
}
