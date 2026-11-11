import React, { useEffect, useState } from 'react';
import { C, card, useWindowWidth } from '../../ParryFSApp.jsx';
import { PlaybookHeader, PlaybookDisclaimer } from './shared.jsx';

// Deposit sources, redesigned: answer first, a visual example, short cards
// that open for detail, and a 2-step timeline for bank vs seller deposit.
// Approved design: "Playbook redesign" page on the design canvas.

const SOURCES = [
  { id: 'kiwisaver', title: 'KiwiSaver', fact: 'After 3 years as a member', body: 'Members of at least three years can withdraw their KiwiSaver savings towards a first home, leaving a minimum of $1,000 in the account.' },
  { id: 'savings', title: 'Your savings', fact: 'Shows your track record', body: 'Regular saving over time shows lenders you can manage your money and meet your repayments.' },
  { id: 'gift', title: 'Family gift or loan', fact: 'Large or small', body: 'Gifts from family are widely accepted, as long as they are not repayable. A family loan can also be used, but any repayments will be included when a lender works out what you can afford.' },
  { id: 'equity', title: 'Family equity', fact: 'Support from a family home', body: 'A family member can offer the equity in their own home as extra security for your loan, which can reduce the cash deposit you need. This is more complex, so get advice before going ahead.' },
];

const ICONS = {
  kiwisaver: <><ellipse cx="9" cy="12.8" rx="6.3" ry="5" /><path d="M13.6 9.3c.9-1.5 3-1.6 3.9-.3" /><path d="M17.5 9.5c1.6 1.2 3.3 3.3 4.6 5.8" /><path d="M7.5 17.6v3.2M11 17.6v3.2M6.3 20.8h2.4M9.8 20.8h2.4" /><path d="M15.6 9.6h.01" /></>,
  savings: <><rect x="3" y="6" width="18" height="13" rx="2" /><path d="M3 10h18M16 15h2" /></>,
  gift: <><rect x="3" y="8" width="18" height="4" rx="1" /><path d="M5 12v8h14v-8M12 8v12M12 8c-1.5-3-5-3-5-1s3 1 5 1zM12 8c1.5-3 5-3 5-1s-3 1-5 1z" /></>,
  equity: <><path d="M3 11 12 4l9 7" /><path d="M5 10v10h14V10" /><path d="M10 20v-6h4v6" /></>,
};

const Icon = ({ id }) => (
  <span style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.sky} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{ICONS[id]}</svg>
  </span>
);

const HouseCoins = ({ size = 64 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" style={{ flexShrink: 0 }}>
    <circle cx="32" cy="32" r="32" fill="#EAF1FE" />
    <path d="M14 31 L32 16 L50 31" fill="none" stroke={C.sky} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M19 28 V47 H45 V28" fill="#FFFFFF" stroke={C.sky} strokeWidth="3.2" strokeLinejoin="round" />
    <rect x="28" y="36" width="8" height="11" rx="1.5" fill={C.red} />
    <ellipse cx="50" cy="48" rx="7" ry="2.6" fill="#F5A623" />
    <ellipse cx="50" cy="44.5" rx="7" ry="2.6" fill="#F7B84B" />
    <ellipse cx="50" cy="41" rx="7" ry="2.6" fill="#F5A623" />
  </svg>
);

const H2 = ({ children, style }) => (
  <h2 style={{ margin: '0 0 6px', fontFamily: C.headingFont, fontSize: '24px', fontWeight: 700, color: C.navy, ...style }}>{children}</h2>
);

export default function DepositSources({ onNavigate, hash }) {
  const isMobile = useWindowWidth() < 768;
  const [open, setOpen] = useState('kiwisaver');
  const [more, setMore] = useState(false);
  const box = { ...card, padding: isMobile ? '1.25rem' : '1.75rem 2rem', marginBottom: '1rem' };

  // Deep links (glossary, journey) to #bank-vs-seller-deposit
  useEffect(() => {
    if (!hash) return;
    if (hash === 'bank-vs-seller-deposit') setMore(true);
    const raf = requestAnimationFrame(() => document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    return () => cancelAnimationFrame(raf);
  }, [hash]);

  const go = (path) => (e) => { e.preventDefault(); onNavigate(path); };

  return (
    <div>
      <PlaybookHeader />

      {/* Example mix */}
      <section style={{ ...box, display: 'flex', flexWrap: 'wrap', gap: isMobile ? '16px' : '28px', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flex: '0 1 300px' }}>
          <HouseCoins size={isMobile ? 64 : 72} />
          <div>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: C.accent, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Example</p>
            <p style={{ margin: '2px 0 0', fontSize: isMobile ? '15px' : '18px', fontWeight: 600, color: C.navy, lineHeight: 1.35 }}>20% deposit on a $750,000 home</p>
          </div>
        </div>
        <div style={{ flex: '1 1 320px' }}>
          <div role="img" aria-label="$150,000 deposit made up of $80,000 savings and $70,000 KiwiSaver" style={{ display: 'flex', height: isMobile ? '44px' : '52px', borderRadius: '12px', overflow: 'hidden', marginBottom: '10px' }}>
            <div style={{ flex: 80, background: C.sky, color: '#FFFFFF', display: 'flex', alignItems: 'center', padding: '0 12px', fontSize: '14px', fontWeight: 600, whiteSpace: 'nowrap' }}>Savings {isMobile ? '$80k' : '$80,000'}</div>
            <div style={{ flex: 70, background: '#9DC4F3', color: C.navy, display: 'flex', alignItems: 'center', padding: '0 12px', fontSize: '14px', fontWeight: 600, whiteSpace: 'nowrap' }}>KiwiSaver {isMobile ? '$70k' : '$70,000'}</div>
          </div>
          <p style={{ margin: 0, fontSize: '14px', color: C.textSecondary }}>= <strong style={{ color: C.navy }}>$150,000 deposit</strong>. The bank lends the other $600,000.</p>
        </div>
      </section>

      {/* Sources */}
      <section style={box}>
        <H2>4 places it can come from</H2>
        {isMobile && <p style={{ margin: '0 0 14px', fontSize: '14px', color: C.textSecondary }}>Tap any to learn more.</p>}
        {isMobile ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {SOURCES.map((s) => {
              const isOpen = open === s.id;
              return (
                <div key={s.id} style={{ borderRadius: '16px', background: C.inputBg }}>
                  <button onClick={() => setOpen(isOpen ? null : s.id)} aria-expanded={isOpen} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', border: 0, background: 'transparent', cursor: 'pointer', textAlign: 'left', color: C.navy }}>
                    <Icon id={s.id} />
                    <span style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                      <span style={{ fontSize: '16px', fontWeight: 600 }}>{s.title}</span>
                      <span style={{ fontSize: '13px', color: C.textSecondary }}>{s.fact}</span>
                    </span>
                    <span aria-hidden="true" style={{ fontSize: '22px', color: C.accent, width: '20px', textAlign: 'center' }}>{isOpen ? '−' : '+'}</span>
                  </button>
                  {isOpen && <p style={{ margin: 0, padding: '0 14px 14px 70px', fontSize: '14px', lineHeight: 1.6, color: '#33415C' }}>{s.body}</p>}
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginTop: '14px' }}>
            {SOURCES.map((s) => (
              <div key={s.id} style={{ background: C.inputBg, borderRadius: '18px', padding: '18px' }}>
                <div style={{ marginBottom: '14px' }}><Icon id={s.id} /></div>
                <p style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 600, color: C.navy }}>{s.title}</p>
                <p style={{ margin: '0 0 10px', fontSize: '13px', fontWeight: 600, color: C.accent }}>{s.fact}</p>
                <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.55, color: C.textSecondary }}>{s.body}</p>
              </div>
            ))}
          </div>
        )}
        <div style={{ marginTop: '14px', display: 'flex', flexWrap: 'wrap', gap: '6px 12px', alignItems: 'center', background: '#EAF1FE', borderRadius: '14px', padding: '12px 14px' }}>
          <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.55, color: C.navy, flex: '1 1 260px' }}>
            <strong>Good to know:</strong> the Kāinga Ora First Home Loan isn't a deposit source, but if you're eligible it can lower the deposit you need to as little as 5%.
          </p>
          <a href="/first-home-playbook/kainga-ora" onClick={go('/kainga-ora')} style={{ fontSize: '14px', fontWeight: 600, color: C.accent, whiteSpace: 'nowrap' }}>See if it applies →</a>
        </div>
      </section>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem', alignItems: 'stretch' }}>
        {/* Bank vs seller deposit */}
        <section id="bank-vs-seller-deposit" style={{ ...box, marginBottom: 0, flex: '3 1 440px', scrollMarginTop: '90px' }}>
          <H2>Two kinds of "deposit"</H2>
          <p style={{ margin: '0 0 18px', fontSize: '14px', color: C.textSecondary, lineHeight: 1.55 }}>The bank deposit is your total share. The seller deposit is part of it, paid earlier.</p>
          {[
            { n: 1, colour: C.red, title: 'Go unconditional', body: <>Pay the <strong style={{ color: C.navy }}>seller deposit</strong>, usually about 10% ($75,000). Cash savings work best here, as KiwiSaver takes time to come through.</> },
            { n: 2, colour: C.navy, title: 'Settlement day', body: 'KiwiSaver, the rest of your savings and the bank loan pay the balance.' },
          ].map((step, i, arr) => (
            <div key={step.n} style={{ display: 'flex', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '28px' }}>
                <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: step.colour, color: '#FFFFFF', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{step.n}</span>
                {i < arr.length - 1 && <span style={{ width: '2px', flex: 1, minHeight: '20px', background: '#D5E0F2' }} />}
              </div>
              <div style={{ paddingBottom: i < arr.length - 1 ? '16px' : 0 }}>
                <p style={{ margin: '2px 0 2px', fontSize: '15px', fontWeight: 600, color: C.navy }}>{step.title}</p>
                <p style={{ margin: 0, fontSize: '14px', color: C.textSecondary, lineHeight: 1.55 }}>{step.body}</p>
              </div>
            </div>
          ))}
          <div style={{ marginTop: '16px', background: '#FDECE9', borderRadius: '14px', padding: '12px 14px', display: 'flex', gap: '10px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B8301C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0, marginTop: '1px' }}><path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" /></svg>
            <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.55, color: '#5A1F14' }}><strong>Worth knowing:</strong> once you're unconditional you're committed. Check with your adviser and solicitor that your funds will be ready in time.</p>
          </div>
          <button onClick={() => setMore((m) => !m)} aria-expanded={more} style={{ marginTop: '14px', background: 'none', border: 0, padding: 0, color: C.accent, fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
            {more ? 'Show less' : 'How it can strengthen your offer'}
          </button>
          {more && (
            <p style={{ margin: '10px 0 0', fontSize: '14px', lineHeight: 1.6, color: '#33415C' }}>
              If a seller needs their deposit quickly, for example to pay the deposit on their next home, paying it promptly from cash can make your offer stand out. If cash is tight, a smaller seller deposit can often be negotiated.
            </p>
          )}
        </section>

        {/* Bottom line */}
        <section style={{ flex: '2 1 280px', alignSelf: 'flex-start', background: C.navy, color: '#FFFFFF', borderRadius: '24px', padding: isMobile ? '1.4rem' : '1.75rem' }}>
          <p style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: 600, color: '#9DC4F3', textTransform: 'uppercase', letterSpacing: '0.05em' }}>The bottom line</p>
          <p style={{ margin: '0 0 20px', fontSize: isMobile ? '17px' : '19px', lineHeight: 1.5, fontWeight: 500 }}>Most buyers mix two or three sources. Not sure what you've got? That's what a first chat is for.</p>
          <a href="/first-home-playbook/calculator" onClick={go('/calculator')} style={{ display: 'block', textAlign: 'center', padding: '15px', borderRadius: '12px', background: C.red, color: '#FFFFFF', fontWeight: 600, fontSize: '16px', textDecoration: 'none', marginBottom: '10px' }}>Check what I could borrow</a>
          <a href="/first-home-playbook/book-a-call" onClick={go('/book-a-call')} style={{ display: 'block', textAlign: 'center', padding: '14px', borderRadius: '12px', border: '1px solid #3A4C70', color: '#FFFFFF', fontWeight: 600, fontSize: '15px', textDecoration: 'none' }}>Get your plan</a>
        </section>
      </div>

      <PlaybookDisclaimer />
    </div>
  );
}
