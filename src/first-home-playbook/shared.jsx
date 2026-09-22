import React, { useState, useEffect } from 'react';
import { C, card, primaryBtn, secondaryBtn, useAuth, supabase } from '../../ParryFSApp.jsx';

// Shared page chrome for every First Home Playbook page: a back-to-hub
// breadcrumb, title/intro, and the general-information disclaimer the brief
// asks for on every content page.

export const PLAYBOOK_ROOT = '/first-home-playbook';

// Same key Journey.jsx reads/writes, kept here so anything that just needs
// to *read* progress (e.g. the Hub tile) doesn't need its own copy.
export const JOURNEY_PROGRESS_LS_KEY = 'fhp_journey_progress_v1';

// Loads saved journey checklist state: localStorage first (instant, works
// logged out), then Supabase if signed in (overrides, since that's the
// source of truth for a logged in user across devices). Returns null while
// loading, then the checklist object (possibly {}).
export function useJourneyProgress() {
  const { user } = useAuth();
  const [checklist, setChecklist] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let merged = {};
      try {
        const raw = localStorage.getItem(JOURNEY_PROGRESS_LS_KEY);
        if (raw) merged = JSON.parse(raw) || {};
      } catch {}
      if (user) {
        const { data } = await supabase.getJourneyProgress();
        if (data) merged = data;
      }
      if (!cancelled) setChecklist(merged);
    })();
    return () => { cancelled = true; };
  }, [user]);

  return checklist;
}

// Single place to update the First Home Playbook Enquiry Bookings link
// (current link expires 1 December 2026, per the build brief). BookACall.jsx
// and the journey page's call to action both import this same constant.
export const BOOKINGS_URL = 'https://outlook.office.com/bookwithme/user/35910337ef6b47e19c21334740c35b06@mikepero.co.nz/meetingtype/S_Ma3DVzG0q0a21VJQQ2GA2?bookingcode=5864afb8-c9dc-4233-bb2a-85d8ad303c85&anonymous&ismsaljsauthenabled&ep=mLinkFromTile';

export const TILES = [
  { id: 'journey', title: 'Start here: your journey', blurb: 'Every step of buying your first home, from pre-approval to keys, and who to call at each stage.', icon: 'ti-route', path: '/journey' },
  { id: 'calculator', title: 'Know Your Numbers', blurb: 'Run the Borrow Checker calculator to see what you could borrow.', icon: 'ti-calculator', path: '/calculator' },
  { id: 'are-you-ready', title: 'Are You Ready?', blurb: 'A quick self-check on where you stand right now.', icon: 'ti-checklist', path: '/are-you-ready' },
  { id: 'deposit-sources', title: 'Deposit Sources', blurb: 'Where your deposit can actually come from.', icon: 'ti-wallet', path: '/deposit-sources' },
  { id: 'costs-of-buying', title: 'Hidden Costs of Buying', blurb: 'What buying a home actually costs, beyond the deposit.', icon: 'ti-receipt', path: '/costs-of-buying' },
  { id: 'kainga-ora', title: 'Kāinga Ora Explained', blurb: 'What the First Home Loan scheme actually means for you.', icon: 'ti-building-bank', path: '/kainga-ora' },
  { id: 'kainga-ora-quiz', title: 'Kāinga Ora Qualifying Quiz', blurb: 'A fast read on whether you might be eligible.', icon: 'ti-clipboard-check', path: '/kainga-ora-quiz' },
  { id: 'glossary', title: 'Jargon Glossary', blurb: 'First home buyer terms, in plain English.', icon: 'ti-book-2', path: '/glossary' },
  { id: 'book-a-call', title: 'Get Your Plan', blurb: 'Tell us a bit about you, or book straight in with Dan.', icon: 'ti-calendar-event', path: '/book-a-call' },
];

export function PlaybookDisclaimer() {
  return (
    <div style={{ background: C.inputBg, borderRadius: '12px', padding: '1rem', border: `1px solid ${C.borderLight}`, marginTop: '1.5rem' }}>
      <p style={{ fontSize: '12px', color: C.textSecondary, margin: 0, lineHeight: 1.6 }}>
        This is general information only and doesn't take your personal situation into account.
      </p>
    </div>
  );
}

export function PlaybookHeader({ title, onExit, onBackToHub }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '13px', color: C.textSecondary }}>
        <button onClick={onExit} style={{ background: 'none', border: 'none', padding: 0, color: C.textSecondary, cursor: 'pointer', fontSize: '13px', textDecoration: 'underline' }}>
          parryfs.com
        </button>
        <span>/</span>
        <button onClick={onBackToHub} style={{ background: 'none', border: 'none', padding: 0, color: C.textSecondary, cursor: 'pointer', fontSize: '13px', textDecoration: 'underline' }}>
          First Home Playbook
        </button>
        {title && <><span>/</span><span style={{ color: C.textPrimary, fontWeight: '500' }}>{title}</span></>}
      </div>
    </div>
  );
}

export function PlaybookCard({ children, style }) {
  return <div style={{ ...card, ...style }}>{children}</div>;
}

export function PlaybookButton({ children, onClick, variant = 'primary', style }) {
  return (
    <button onClick={onClick} style={{ ...(variant === 'primary' ? primaryBtn : secondaryBtn), ...style }}>
      {children}
    </button>
  );
}

// A subtle, dotted-underline inline link to a glossary anchor. Uses a real
// <a href> (so a full page load or a middle click still lands on the right
// glossary term) but intercepts a plain click to navigate inside the SPA.
export function GlossaryLink({ anchor, onNavigate, children }) {
  return (
    <a
      href={`${PLAYBOOK_ROOT}/glossary#${anchor}`}
      onClick={(e) => {
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        onNavigate(`/glossary#${anchor}`);
      }}
      style={{ color: 'inherit', textDecoration: 'underline', textDecorationStyle: 'dotted', textUnderlineOffset: '3px' }}
    >
      {children}
    </a>
  );
}

// Escapes text for use inside a RegExp literal.
function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Turns plain text into an array of strings and <GlossaryLink> nodes,
// linking only the FIRST use of each term across the whole page (tracked via
// the shared `usedAnchors` Set, mutated in place as terms are consumed).
// Word-boundary matching means "conditional" never matches inside
// "unconditional". Safe to call once per paragraph of copy.
export function linkifyGlossaryTerms(text, termLinks, usedAnchors, onNavigate) {
  let remaining = termLinks.filter(([, anchor]) => !usedAnchors.has(anchor));
  if (!text || remaining.length === 0) return [text];

  const nodes = [];
  let rest = text;
  let key = 0;

  while (rest && remaining.length > 0) {
    const pattern = new RegExp(`\\b(${remaining.map(([term]) => escapeRegExp(term)).join('|')})\\b`, 'i');
    const match = rest.match(pattern);
    if (!match) break;

    const matchedTerm = match[0];
    const found = remaining.find(([term]) => term.toLowerCase() === matchedTerm.toLowerCase());
    const before = rest.slice(0, match.index);
    if (before) nodes.push(before);

    usedAnchors.add(found[1]);
    nodes.push(<GlossaryLink key={`gl-${key++}`} anchor={found[1]} onNavigate={onNavigate}>{matchedTerm}</GlossaryLink>);
    remaining = remaining.filter(([term]) => term !== found[0]);

    rest = rest.slice(match.index + matchedTerm.length);
  }

  if (rest) nodes.push(rest);
  return nodes;
}
