import React from 'react';
import { C, useWindowWidth } from '../ParryFSApp.jsx';

// The blue to white banner ("hero") at the top of every page, matching the
// homepage so the whole site reads as one design.

const TOOL_PAGES = {
  borrow: { title: 'Borrow Checker', sub: "Find out if you're ready to buy, or how much you could borrow." },
  repayment: { title: 'Loan Repayment Calculator', sub: 'Calculate your repayments and compare multiple loans.' },
  quickrepay: { title: 'Quick Repay Calculator', sub: 'See how extra repayments can save you interest and time.' },
  comparison: { title: 'Mortgage Comparison', sub: 'Compare current and new rates and repayments across multiple loans.' },
  breakeven: { title: 'Break Even Calculator', sub: 'Should you break your fixed rate? Find out here.' },
  costtowait: { title: 'Cost to Wait Calculator', sub: 'See the daily, monthly and annual cost of waiting to fix your rate.' },
};

const PLAYBOOK_PAGES = {
  '/': { title: 'The Playbook', sub: 'Everything you need to get your bearings as a first home buyer: tools, guides, and a straightforward way to talk it through with an adviser.' },
  '/journey': { crumb: 'Your journey', title: 'The first home journey, start to finish' },
  '/calculator': { crumb: 'Know your numbers', title: 'Know your numbers', sub: "Find out if you're ready to buy, or how much you could borrow." },
  '/are-you-ready': { crumb: 'Are you ready?', title: 'Are you ready?', sub: 'A quick, no pressure self check on where you stand.' },
  '/kainga-ora-quiz': { crumb: 'Kāinga Ora quiz', title: 'Kāinga Ora qualifying quiz', sub: 'A fast read on eligibility, using the same criteria as our Borrow Checker.' },
  '/deposit-sources': { crumb: 'Deposit sources', title: 'Where your deposit can come from', sub: 'Most first home buyers combine a few sources, not just savings.' },
  '/costs-of-buying': { crumb: 'Hidden costs', title: 'What buying really costs, beyond the deposit', sub: 'Budget for these early, so there are no surprises before settlement.' },
  '/kainga-ora': { crumb: 'Kāinga Ora explained', title: 'Kāinga Ora First Home Loan, explained', sub: 'Buy with as little as a 5% deposit, if you meet the criteria.' },
  '/glossary': { crumb: 'Jargon glossary', title: 'First home buyer terms, in plain English', sub: 'This list keeps growing over time.' },
  '/book-a-call': { crumb: 'Get your plan', title: 'Get your plan' },
};

export function heroFor(tab, path) {
  if (tab === 'welcome') return { title: 'Thanks for getting in touch', sub: "We've got your details. While you're here, this is the best place to start.", crumbs: [{ label: 'Home', to: '/' }], crumb: 'Welcome' };
  if (TOOL_PAGES[tab]) return { ...TOOL_PAGES[tab], crumbs: [{ label: 'Home', to: '/' }] };
  if (tab === 'first-home-playbook') {
    const sub = path.replace('/first-home-playbook', '').replace(/\/$/, '') || '/';
    const page = PLAYBOOK_PAGES[sub] || PLAYBOOK_PAGES['/'];
    const crumbs = [{ label: 'Home', to: '/' }];
    if (sub !== '/' && PLAYBOOK_PAGES[sub]) crumbs.push({ label: 'The Playbook', to: '/first-home-playbook' });
    return { ...page, crumbs };
  }
  return null;
}

export default function PageHero({ hero, go }) {
  const isMobile = useWindowWidth() < 768;
  if (!hero) return null;
  return (
    <section style={{ background: `linear-gradient(180deg, ${C.sky} 0%, #2E86E6 55%, #CFE4FB 100%)`, color: '#FFFFFF', padding: isMobile ? '22px 20px 84px' : '36px 24px 104px' }}>
      <div style={{ maxWidth: '1068px', margin: '0 auto' }}>
        <nav aria-label="Breadcrumb" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem', fontSize: '14px', marginBottom: isMobile ? '14px' : '18px' }}>
          {hero.crumbs.map((c) => (
            <React.Fragment key={c.to}>
              <a href={c.to} onClick={(e) => { if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return; e.preventDefault(); go(c.to); }} style={{ color: '#FFFFFF', opacity: 0.9, textDecoration: 'underline', textUnderlineOffset: '3px' }}>{c.label}</a>
              <span aria-hidden="true" style={{ opacity: 0.7 }}>/</span>
            </React.Fragment>
          ))}
          <span style={{ fontWeight: 600 }}>{hero.crumb || hero.title}</span>
        </nav>
        <h1 style={{ margin: 0, fontFamily: C.headingFont, fontSize: isMobile ? '32px' : '48px', lineHeight: 1.08, fontWeight: 700, letterSpacing: '-0.01em', maxWidth: '860px' }}>{hero.title}</h1>
        {hero.sub && <p style={{ margin: isMobile ? '12px 0 0' : '16px 0 0', fontSize: isMobile ? '16px' : '18px', lineHeight: 1.6, maxWidth: '680px' }}>{hero.sub}</p>}
      </div>
    </section>
  );
}
