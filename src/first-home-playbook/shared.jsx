import React from 'react';
import { C, card, primaryBtn, secondaryBtn } from '../../ParryFSApp.jsx';

// Shared page chrome for every First Home Playbook page: a back-to-hub
// breadcrumb, title/intro, and the general-information disclaimer the brief
// asks for on every content page.

export const PLAYBOOK_ROOT = '/first-home-playbook';

export const TILES = [
  { id: 'calculator', title: 'Know Your Numbers', blurb: 'Run the Borrow Checker calculator to see what you could borrow.', icon: 'ti-calculator', path: '/calculator' },
  { id: 'are-you-ready', title: 'Are You Ready?', blurb: 'A quick self-check on where you stand right now.', icon: 'ti-checklist', path: '/are-you-ready' },
  { id: 'deposit-sources', title: 'Deposit Sources', blurb: 'Where your deposit can actually come from.', icon: 'ti-piggy-bank', path: '/deposit-sources' },
  { id: 'costs-of-buying', title: 'Hidden Costs of Buying', blurb: 'What buying a home actually costs, beyond the deposit.', icon: 'ti-receipt', path: '/costs-of-buying' },
  { id: 'kainga-ora', title: 'Kāinga Ora Explained', blurb: 'What the First Home Loan scheme actually means for you.', icon: 'ti-building-bank', path: '/kainga-ora' },
  { id: 'kainga-ora-quiz', title: 'Kāinga Ora Qualifying Quiz', blurb: 'A fast read on whether you might be eligible.', icon: 'ti-clipboard-check', path: '/kainga-ora-quiz' },
  { id: 'glossary', title: 'Jargon Glossary', blurb: 'First home buyer terms, in plain English.', icon: 'ti-book-2', path: '/glossary' },
  { id: 'book-a-call', title: 'Get Your Plan', blurb: 'Tell us a bit about you, or book straight in with Dan.', icon: 'ti-calendar-event', path: '/book-a-call' },
];

export function PlaybookDisclaimer({ onNavigate }) {
  return (
    <div style={{ background: C.inputBg, borderRadius: '12px', padding: '1rem', border: `1px solid ${C.borderLight}`, marginTop: '1.5rem' }}>
      <p style={{ fontSize: '12px', color: C.textSecondary, margin: 0, lineHeight: 1.6 }}>
        This is general information only and doesn't take your personal situation into account.{' '}
        <button
          onClick={() => onNavigate('/book-a-call')}
          style={{ background: 'none', border: 'none', padding: 0, color: C.textPrimary, fontWeight: '600', textDecoration: 'underline', cursor: 'pointer', fontSize: '12px' }}
        >
          Book a call with Dan
        </button>{' '}
        to see how this applies to you.
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

export function BookCallCTA({ onNavigate, label = 'Book a call with Dan' }) {
  return (
    <PlaybookButton onClick={() => onNavigate('/book-a-call')} style={{ marginTop: '1rem' }}>
      {label}
    </PlaybookButton>
  );
}
