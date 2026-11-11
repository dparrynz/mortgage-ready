import React from 'react';
import { C, card, useWindowWidth } from '../../ParryFSApp.jsx';
import { PlaybookHeader, PlaybookDisclaimer } from './shared.jsx';

// Kāinga Ora First Home Loan, redesigned in the Playbook style: the 5% vs
// 20% difference as a visual, a tick list of who it's for, income caps as
// tiles, and the combined "good to know" + bottom line panel.
//
// Figures checked November 2026: income caps unchanged since 2022, no house
// price caps. A proposal to lift the caps to $300,000 was announced in
// September 2026 but isn't in place. Check kaingaora.govt.nz before relying
// on these, and update INCOME_CAPS here if they change.

const INCOME_CAPS = [
  { amount: '$95,000', who: 'Single buyer, no dependants' },
  { amount: '$150,000', who: 'Single buyer with dependants' },
  { amount: '$150,000', who: 'Two or more buyers, combined' },
];

const WHO = [
  'NZ citizen, permanent resident or resident visa holder living in NZ',
  'First home buyer, or a previous owner in a similar position',
  "You'll live in the home yourself",
  'At least a 5% deposit',
];

const GOOD_TO_KNOW = [
  "It's a normal home loan at normal interest rates, not a grant.",
  'You apply through a participating lender, not Kāinga Ora.',
  'You still need to show you can afford the repayments.',
  'There are no house price caps.',
];

const Tick = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2E7D60" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0, marginTop: '2px' }}><path d="M5 12l5 5L20 7" /></svg>
);

export default function KaingaOraPage({ onNavigate }) {
  const isMobile = useWindowWidth() < 768;
  const box = { ...card, padding: isMobile ? '1.25rem' : '1.75rem 2rem', marginBottom: '1rem' };
  const h2 = { margin: '0 0 14px', fontFamily: C.headingFont, fontSize: '24px', fontWeight: 700, color: C.navy };
  const go = (path) => (e) => { e.preventDefault(); onNavigate(path); };

  return (
    <div>
      <PlaybookHeader />

      {/* 5% vs 20% */}
      <section style={box}>
        <p style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: 600, color: C.accent, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Example: a $750,000 home</p>
        <h2 style={{ ...h2, marginBottom: '18px' }}>The deposit you need</h2>
        {[
          { label: 'With a First Home Loan', pct: 5, amount: '$37,500', colour: C.red },
          { label: 'Usual bank deposit', pct: 20, amount: '$150,000', colour: '#9DC4F3' },
        ].map((r) => (
          <div key={r.label} style={{ marginBottom: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', fontSize: '14px', marginBottom: '6px' }}>
              <span style={{ fontWeight: 600, color: C.navy }}>{r.label}</span>
              <span style={{ color: C.textSecondary }}><strong style={{ color: C.navy }}>{r.pct}%</strong> · {r.amount}</span>
            </div>
            <div style={{ height: '16px', borderRadius: '8px', background: C.inputBg, overflow: 'hidden' }} role="img" aria-label={`${r.pct}% deposit, ${r.amount}`}>
              <div style={{ width: `${r.pct * 4}%`, height: '100%', background: r.colour, borderRadius: '8px' }} />
            </div>
          </div>
        ))}
        <p style={{ margin: '4px 0 0', fontSize: '14px', color: C.textSecondary, lineHeight: 1.55 }}>Kāinga Ora backs part of the loan, which lets lenders approve a smaller deposit than usual.</p>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, minmax(0, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
        {/* Who it's for */}
        <section style={{ ...box, marginBottom: 0 }}>
          <h2 style={h2}>Who it's for</h2>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {WHO.map((w) => (
              <li key={w} style={{ display: 'flex', gap: '10px', fontSize: '15px', lineHeight: 1.5, color: C.navy }}><Tick />{w}</li>
            ))}
          </ul>
        </section>

        {/* Income caps */}
        <section style={{ ...box, marginBottom: 0 }}>
          <h2 style={{ ...h2, marginBottom: '4px' }}>Income caps</h2>
          <p style={{ margin: '0 0 14px', fontSize: '14px', color: C.textSecondary }}>Before tax, over the last 12 months.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {INCOME_CAPS.map((c) => (
              <div key={c.who} style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '12px', background: C.inputBg, borderRadius: '14px', padding: '14px 16px' }}>
                <span style={{ fontSize: '14px', color: C.textSecondary }}>{c.who}</span>
                <span style={{ fontFamily: C.headingFont, fontSize: '20px', fontWeight: 700, color: C.navy, whiteSpace: 'nowrap' }}>{c.amount}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Good to know + bottom line, one panel */}
      <section style={{ ...card, padding: isMobile ? '10px' : '12px', marginBottom: '1rem', display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '12px', alignItems: 'stretch' }}>
        <div style={{ flex: '3 1 0', minWidth: 0, padding: isMobile ? '1.1rem 0.75rem 0.75rem' : '1.5rem 1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h2 style={h2}>Good to know</h2>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {GOOD_TO_KNOW.map((g) => (
              <li key={g} style={{ display: 'flex', gap: '10px', fontSize: '15px', lineHeight: 1.5, color: C.navy }}>
                <span aria-hidden="true" style={{ width: '8px', height: '8px', borderRadius: '50%', background: C.sky, flexShrink: 0, marginTop: '8px' }} />{g}
              </li>
            ))}
          </ul>
          <p style={{ margin: '14px 0 0', fontSize: '13px', color: C.textSecondary, lineHeight: 1.55 }}>The First Home Grant is a different scheme. It closed to new applications in May 2024.</p>
        </div>

        <div style={{ flex: '2 1 0', minWidth: 0, background: C.navy, color: '#FFFFFF', borderRadius: '18px', padding: isMobile ? '1.4rem' : '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <p style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: 600, color: '#9DC4F3', textTransform: 'uppercase', letterSpacing: '0.05em' }}>The bottom line</p>
          <p style={{ margin: '0 0 20px', fontSize: isMobile ? '17px' : '19px', lineHeight: 1.5, fontWeight: 500 }}>If you fit the criteria, this could mean buying years sooner. Check if you might qualify in a minute.</p>
          <a href="/first-home-playbook/kainga-ora-quiz" onClick={go('/kainga-ora-quiz')} style={{ display: 'block', textAlign: 'center', padding: '15px', borderRadius: '12px', background: C.red, color: '#FFFFFF', fontWeight: 600, fontSize: '16px', textDecoration: 'none', marginBottom: '10px' }}>Take the eligibility quiz</a>
          <a href="/first-home-playbook/book-a-call" onClick={go('/book-a-call')} style={{ display: 'block', textAlign: 'center', padding: '14px', borderRadius: '12px', border: '1px solid #3A4C70', color: '#FFFFFF', fontWeight: 600, fontSize: '15px', textDecoration: 'none' }}>Get your plan</a>
        </div>
      </section>

      <PlaybookDisclaimer />
    </div>
  );
}
