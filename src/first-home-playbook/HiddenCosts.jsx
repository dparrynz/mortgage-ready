import React from 'react';
import { C, card, useWindowWidth } from '../../ParryFSApp.jsx';
import { PlaybookHeader, PlaybookDisclaimer } from './shared.jsx';

// Hidden costs, redesigned in the same style as Deposit sources: icon cards
// with a short label, a "when each cost comes up" timeline, and the bottom
// line card. Enough to budget with confidence, not a technical guide.

const COSTS = [
  { id: 'legal', title: 'Legal fees', fact: 'Usually a few thousand dollars', body: 'A lawyer or conveyancer reviews your agreement, transfers the title and manages settlement.' },
  { id: 'building', title: 'Building report', fact: 'A few hundred to around $1,000', body: 'An inspector checks for structural issues, moisture and other problems that could be costly later.' },
  { id: 'lim', title: 'LIM report', fact: 'From the council', body: 'Shows consents, code compliance, rates and any known issues with the property or land.' },
  { id: 'valuation', title: 'Valuation', fact: 'Sometimes required', body: 'Some lenders need an independent valuation before confirming your loan. The cost can be yours.' },
  { id: 'moving', title: 'Moving costs', fact: 'Easy to underestimate', body: 'Removalists, connecting power and internet, and insurance for your new home.' },
  { id: 'ongoing', title: 'Ongoing costs', fact: 'From settlement day', body: 'Rates, insurance and any body corporate fees start when you settle, so include them in your budget now.' },
];

const ICONS = {
  legal: <><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5M9 13h6M9 17h4" /></>,
  building: <><path d="M3 11 12 4l9 7" /><path d="M5 10v10h8" /><circle cx="17" cy="17" r="3" /><path d="m19.2 19.2 2 2" /></>,
  lim: <><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" /></>,
  valuation: <><path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z" /><path d="M7.5 7.5h.01" /></>,
  moving: <><path d="M2 7h11v9H2zM13 10h4l4 3v3h-8" /><circle cx="6" cy="17.5" r="2" /><circle cx="17" cy="17.5" r="2" /></>,
  ongoing: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /><path d="M8 14h.01M12 14h.01M16 14h.01" /></>,
};

const Icon = ({ id }) => (
  <span style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.sky} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{ICONS[id]}</svg>
  </span>
);

// Colours are picked inside the component: C isn't ready at import time
// (ParryFSApp.jsx and the Playbook import each other).
const WHEN = [
  { title: 'Before you go unconditional', items: 'Building report, LIM and any valuation', colour: 'red' },
  { title: 'On settlement day', items: 'Legal fees', colour: 'sky' },
  { title: 'Once you move in', items: 'Moving costs, rates and insurance', colour: 'navy' },
];

export default function HiddenCosts({ onNavigate }) {
  const isMobile = useWindowWidth() < 768;
  const box = { ...card, padding: isMobile ? '1.25rem' : '1.75rem 2rem', marginBottom: '1rem' };
  const go = (path) => (e) => { e.preventDefault(); onNavigate(path); };

  return (
    <div>
      <PlaybookHeader />

      {/* The costs */}
      <section style={box}>
        <h2 style={{ margin: '0 0 14px', fontFamily: C.headingFont, fontSize: '24px', fontWeight: 700, color: C.navy }}>6 costs to plan for</h2>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, minmax(0, 1fr))', gap: isMobile ? '10px' : '14px' }}>
          {COSTS.map((c) => (
            <div key={c.id} style={{ background: C.inputBg, borderRadius: '18px', padding: isMobile ? '14px' : '18px', display: 'flex', flexDirection: isMobile ? 'row' : 'column', gap: isMobile ? '12px' : 0 }}>
              <div style={{ marginBottom: isMobile ? 0 : '14px' }}><Icon id={c.id} /></div>
              <div>
                <p style={{ margin: '0 0 3px', fontSize: '16px', fontWeight: 600, color: C.navy }}>{c.title}</p>
                <p style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: 600, color: C.accent }}>{c.fact}</p>
                <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.55, color: C.textSecondary }}>{c.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem', alignItems: 'flex-start' }}>
        {/* When they come up */}
        <section style={{ ...box, marginBottom: 0, flex: '3 1 440px' }}>
          <h2 style={{ margin: '0 0 16px', fontFamily: C.headingFont, fontSize: '24px', fontWeight: 700, color: C.navy }}>When they come up</h2>
          {WHEN.map((w, i) => (
            <div key={w.title} style={{ display: 'flex', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '28px' }}>
                <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: C[w.colour], color: '#FFFFFF', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</span>
                {i < WHEN.length - 1 && <span style={{ width: '2px', flex: 1, minHeight: '18px', background: '#D5E0F2' }} />}
              </div>
              <div style={{ paddingBottom: i < WHEN.length - 1 ? '14px' : 0 }}>
                <p style={{ margin: '2px 0 2px', fontSize: '15px', fontWeight: 600, color: C.navy }}>{w.title}</p>
                <p style={{ margin: 0, fontSize: '14px', color: C.textSecondary }}>{w.items}</p>
              </div>
            </div>
          ))}
        </section>

        {/* Bottom line */}
        <section style={{ flex: '2 1 280px', background: C.navy, color: '#FFFFFF', borderRadius: '24px', padding: isMobile ? '1.4rem' : '1.75rem' }}>
          <p style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: 600, color: '#9DC4F3', textTransform: 'uppercase', letterSpacing: '0.05em' }}>The bottom line</p>
          <p style={{ margin: '0 0 20px', fontSize: isMobile ? '17px' : '19px', lineHeight: 1.5, fontWeight: 500 }}>Set aside a buffer of a few thousand dollars for legal, building and LIM costs, and talk it through before you make an offer.</p>
          <a href="/first-home-playbook/calculator" onClick={go('/calculator')} style={{ display: 'block', textAlign: 'center', padding: '15px', borderRadius: '12px', background: C.red, color: '#FFFFFF', fontWeight: 600, fontSize: '16px', textDecoration: 'none', marginBottom: '10px' }}>Check what I could borrow</a>
          <a href="/first-home-playbook/book-a-call" onClick={go('/book-a-call')} style={{ display: 'block', textAlign: 'center', padding: '14px', borderRadius: '12px', border: '1px solid #3A4C70', color: '#FFFFFF', fontWeight: 600, fontSize: '15px', textDecoration: 'none' }}>Get your plan</a>
        </section>
      </div>

      <PlaybookDisclaimer />
    </div>
  );
}
