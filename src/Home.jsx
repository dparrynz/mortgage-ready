import React from 'react';
import { C, useWindowWidth } from '../ParryFSApp.jsx';
import Reviews from './Reviews.jsx';

// Homepage: "Bold and simple", all blue with red for the main actions.
// Two quiet colours (sky blue and white) and one loud one (red), so the red
// buttons are what the eye lands on.

const HEADING = "'Space Grotesk', Inter, system-ui, sans-serif";

const STEPS = [
  { n: '1', title: 'Know your numbers', body: 'See what you could borrow and how much deposit you need.', link: 'Check what I could borrow', path: '/borrow-checker' },
  { n: '2', title: 'Understand the process', body: 'Every stage from pre-approval to keys, plus the costs and schemes that help.', link: 'See the journey', path: '/first-home-playbook/journey' },
  { n: '3', title: 'Get your plan', body: 'A free chat to map out your next steps, when you are ready.', link: 'Talk to us', path: '/first-home-playbook/book-a-call' },
];

const TOOLS = [
  { title: 'Are you ready?', blurb: 'A quick self check on where you stand', path: '/first-home-playbook/are-you-ready' },
  { title: 'Deposit sources', blurb: 'Where your deposit can actually come from', path: '/first-home-playbook/deposit-sources' },
  { title: 'Hidden costs', blurb: 'What buying really costs, beyond the deposit', path: '/first-home-playbook/costs-of-buying' },
  { title: 'Kāinga Ora explained', blurb: 'The First Home Loan, in plain English', path: '/first-home-playbook/kainga-ora' },
  { title: 'Kāinga Ora quiz', blurb: 'A fast read on whether you might qualify', path: '/first-home-playbook/kainga-ora-quiz' },
  { title: 'Jargon glossary', blurb: 'First home buyer terms, made simple', path: '/first-home-playbook/glossary' },
];

// Real links (so they work with a middle click or when shared), handled in
// the app on a normal click.
function Link({ to, go, style, children }) {
  return (
    <a
      href={to}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        go(to);
      }}
      style={style}
    >
      {children}
    </a>
  );
}

export default function Home({ go }) {
  const isMobile = useWindowWidth() < 768;
  const wrap = { maxWidth: '1200px', margin: '0 auto' };

  return (
    <div style={{ background: '#FFFFFF', color: C.navy }}>
      {/* Hero */}
      <section style={{ background: `linear-gradient(180deg, ${C.sky} 0%, #2E86E6 60%, #CFE4FB 100%)`, color: '#FFFFFF', padding: isMobile ? '40px 20px 56px' : '72px 24px 112px' }}>
        <div style={{ ...wrap, maxWidth: '980px', textAlign: isMobile ? 'left' : 'center' }}>
          <h1 style={{ margin: '0 0 22px', fontFamily: HEADING, fontSize: isMobile ? '42px' : '88px', lineHeight: isMobile ? 1.05 : 1, fontWeight: 700, letterSpacing: '-0.015em' }}>
            Buying your first home, made simple.
          </h1>
          <div aria-hidden="true" style={{ width: isMobile ? '56px' : '80px', height: '7px', borderRadius: '4px', background: '#FFFFFF', margin: isMobile ? '0 0 22px' : '0 auto 28px' }} />
          <p style={{ margin: isMobile ? '0 0 28px' : '0 auto 36px', fontSize: isMobile ? '17px' : '21px', lineHeight: 1.6, maxWidth: '640px' }}>
            Everything first home buyers need to know, in one place. Free, simple and jargon free.
          </p>
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
            <Link to="/first-home-playbook" go={go} style={{ padding: isMobile ? '17px 20px' : '19px 32px', borderRadius: '14px', background: C.red, color: '#FFFFFF', fontWeight: 600, fontSize: isMobile ? '17px' : '18px', textDecoration: 'none', textAlign: 'center' }}>
              Start the Playbook
            </Link>
            <Link to="/borrow-checker" go={go} style={{ padding: isMobile ? '16px 20px' : '18px 32px', borderRadius: '14px', border: '1px solid #FFFFFF', color: '#FFFFFF', fontWeight: 600, fontSize: isMobile ? '17px' : '18px', textDecoration: 'none', textAlign: 'center' }}>
              See what I could borrow
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: isMobile ? '48px 20px 8px' : '96px 24px 40px' }}>
        <div style={wrap}>
          <p style={{ margin: '0 0 10px', fontSize: '14px', fontWeight: 600, color: C.accent, letterSpacing: '0.06em', textTransform: 'uppercase' }}>How it works</p>
          <h2 style={{ margin: isMobile ? '0 0 28px' : '0 0 48px', fontFamily: HEADING, fontSize: isMobile ? '28px' : '40px', lineHeight: 1.1, fontWeight: 700 }}>Three steps to your first home</h2>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, minmax(0, 1fr))', gap: isMobile ? '28px' : '40px' }}>
            {STEPS.map((s) => (
              <div key={s.n} style={{ display: isMobile ? 'flex' : 'block', gap: '18px' }}>
                <span aria-hidden="true" style={{ display: 'block', fontFamily: HEADING, fontSize: isMobile ? '40px' : '56px', lineHeight: 1, fontWeight: 700, color: '#C9D8F5', marginBottom: isMobile ? 0 : '18px', width: isMobile ? '40px' : 'auto', flexShrink: 0 }}>{s.n}</span>
                <div style={{ borderTop: `2px solid ${C.navy}`, paddingTop: '14px', flex: 1 }}>
                  <h3 style={{ margin: '0 0 8px', fontSize: isMobile ? '18px' : '21px', fontWeight: 600 }}>{s.title}</h3>
                  <p style={{ margin: '0 0 12px', fontSize: isMobile ? '15px' : '16px', lineHeight: 1.6, color: '#4A5872' }}>{s.body}</p>
                  <Link to={s.path} go={go} style={{ fontSize: isMobile ? '15px' : '16px', fontWeight: 600, color: C.accent, textDecoration: 'none' }}>{s.link} →</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Guides and tools */}
      <section style={{ padding: isMobile ? '48px 20px' : '64px 24px 96px' }}>
        <div style={wrap}>
          <h2 style={{ margin: '0 0 22px', fontFamily: HEADING, fontSize: isMobile ? '24px' : '32px', fontWeight: 700 }}>Inside the Playbook</h2>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, minmax(0, 1fr))' : 'repeat(3, minmax(0, 1fr))', gap: isMobile ? '10px' : '16px' }}>
            {TOOLS.map((t) => (
              <Link key={t.path} to={t.path} go={go} style={{ display: 'block', padding: isMobile ? '16px' : '24px', borderRadius: '18px', background: '#F2F6FD', textDecoration: 'none', color: C.navy, minHeight: isMobile ? '96px' : '120px' }}>
                <span style={{ display: 'block', fontSize: isMobile ? '15px' : '18px', fontWeight: 600, marginBottom: '6px' }}>{t.title}</span>
                <span style={{ display: 'block', fontSize: isMobile ? '13px' : '15px', color: '#4A5872', lineHeight: 1.45 }}>{t.blurb}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section style={{ padding: isMobile ? '8px 20px 48px' : '0 24px 96px' }}>
        <div style={wrap}>
          <Reviews />
        </div>
      </section>

      {/* Get your plan */}
      <section style={{ background: C.accent, color: '#FFFFFF', padding: isMobile ? '40px 20px 44px' : '72px 24px' }}>
        <div style={{ ...wrap, display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '22px' : '32px', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'center' }}>
          <div style={{ maxWidth: '620px' }}>
            <h2 style={{ margin: '0 0 10px', fontFamily: HEADING, fontSize: isMobile ? '30px' : '40px', lineHeight: 1.1, fontWeight: 700 }}>Get your plan</h2>
            <p style={{ margin: 0, fontSize: isMobile ? '16px' : '18px', lineHeight: 1.6, color: '#E4ECFD' }}>Free, no pressure, no credit check. Just a conversation about what's possible for you.</p>
          </div>
          <Link to="/first-home-playbook/book-a-call" go={go} style={{ padding: isMobile ? '16px' : '18px 32px', borderRadius: '14px', background: C.red, color: '#FFFFFF', fontWeight: 700, fontSize: '17px', textDecoration: 'none', textAlign: 'center', whiteSpace: 'nowrap' }}>
            Book a time
          </Link>
        </div>
      </section>
    </div>
  );
}
