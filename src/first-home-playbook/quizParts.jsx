import React from 'react';
import { C, primaryBtn } from '../../ParryFSApp.jsx';

// Shared pieces for the two Playbook quizzes: one question per screen, a
// progress bar, answer buttons, and the result card with an illustration.

export function QuizProgress({ step, total }) {
  const pct = Math.round(((step + 1) / total) * 100);
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, color: C.textSecondary, marginBottom: '0.5rem' }}>
        <span>Question {step + 1} of {total}</span>
        <span>{pct}%</span>
      </div>
      <div style={{ height: '8px', borderRadius: '4px', background: '#DCE6F5', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: C.red, borderRadius: '4px', transition: 'width 0.25s' }} />
      </div>
    </div>
  );
}

export function QuizQuestionTitle({ children }) {
  return <h2 style={{ fontFamily: C.headingFont, fontSize: '22px', fontWeight: 700, color: C.navy, lineHeight: 1.3, margin: '0 0 1.25rem' }}>{children}</h2>;
}

export function AnswerButton({ selected, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      style={{
        width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.75rem',
        padding: '0.95rem 1.1rem', borderRadius: '14px', cursor: 'pointer', fontSize: '15px', color: C.navy,
        border: `2px solid ${selected ? C.red : C.borderLight}`,
        background: selected ? '#FDEFEC' : 'white',
        transition: 'border-color 0.15s, background 0.15s',
      }}
    >
      <span aria-hidden="true" style={{ width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0, border: `2px solid ${selected ? C.red : '#B9C6DB'}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        {selected && <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: C.red }} />}
      </span>
      {children}
    </button>
  );
}

export function QuizNav({ onBack, onNext, nextLabel = 'Next', nextDisabled }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', marginTop: '1.5rem' }}>
      {onBack ? (
        <button type="button" onClick={onBack} style={{ background: 'none', border: 'none', color: C.textSecondary, fontSize: '14px', fontWeight: 600, cursor: 'pointer', padding: '0.5rem 0' }}>← Back</button>
      ) : <span />}
      {onNext && (
        <button type="button" onClick={onNext} disabled={nextDisabled} style={{ ...primaryBtn, opacity: nextDisabled ? 0.4 : 1, cursor: nextDisabled ? 'not-allowed' : 'pointer' }}>{nextLabel}</button>
      )}
    </div>
  );
}

const ART = {
  seedling: <><path d="M32 54V30" /><path d="M32 34c0-9-7-15-17-15 0 9 7 15 17 15z" /><path d="M32 30c0-8 6-13 15-13 0 8-6 13-15 13z" /><path d="M20 54h24" /></>,
  path: <><path d="M14 54c6-10 18-6 22-16s14-10 16-20" strokeDasharray="4 5" /><circle cx="14" cy="54" r="3.5" /><path d="M46 8v14" /><path d="M46 9h10l-3 3.5 3 3.5H46" /></>,
  house: <><path d="M10 30 32 12l22 18" /><path d="M16 26v26h32V26" /><rect x="27" y="38" width="10" height="14" /><circle cx="49" cy="46" r="9" fill="white" /><path d="M45 46l3 3 5-6" /></>,
  key: <><path d="M10 30 32 12l22 18" /><path d="M16 26v26h32V26" /><circle cx="28" cy="40" r="5" /><path d="M33 40h11M40 40v4M44 40v3" /></>,
  scales: <><path d="M32 12v40" /><path d="M22 52h20" /><path d="M14 20h36" /><path d="M14 20 8 34a6 6 0 0 0 12 0z" /><path d="M50 20l-6 14a6 6 0 0 0 12 0z" /></>,
  signpost: <><path d="M32 8v48" /><path d="M24 56h16" /><path d="M32 14h18l5 5-5 5H32" /><path d="M32 30H14l-5 5 5 5h18" /></>,
};

// A soft blue circle with a simple line drawing and a red accent dot
export function ResultArt({ kind, size = 120 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: 'linear-gradient(160deg, #DCEAFD 0%, #F1F6FE 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', flexShrink: 0 }} aria-hidden="true">
      <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 64 64" fill="none" stroke={C.sky} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">{ART[kind]}</svg>
      <span style={{ position: 'absolute', top: size * 0.12, right: size * 0.1, width: size * 0.12, height: size * 0.12, borderRadius: '50%', background: C.red }} />
    </div>
  );
}

// The result screen: badge, illustration, headline, short body, an optional
// extra block (eg a checklist of answers), next steps and buttons.
export function ResultCard({ art, badge, title, body, children, steps, primary, secondary, onRetake, isMobile }) {
  return (
    <div>
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', gap: '1.5rem', background: C.inputBg, borderRadius: '20px', padding: isMobile ? '1.25rem' : '1.75rem', marginBottom: '1.25rem' }}>
        <ResultArt kind={art} size={isMobile ? 96 : 120} />
        <div>
          <span style={{ display: 'inline-block', fontSize: '12px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: C.red, background: '#FDEFEC', borderRadius: '999px', padding: '0.3rem 0.75rem', marginBottom: '0.6rem' }}>{badge}</span>
          <h2 style={{ fontFamily: C.headingFont, fontSize: isMobile ? '21px' : '24px', fontWeight: 700, color: C.navy, lineHeight: 1.3, margin: '0 0 0.5rem' }}>{title}</h2>
          <p style={{ fontSize: '15px', color: C.textSecondary, lineHeight: 1.6, margin: 0 }}>{body}</p>
        </div>
      </div>

      {children}

      {steps && steps.length > 0 && (
        <div style={{ marginBottom: '1.25rem' }}>
          <p style={{ fontSize: '12px', fontWeight: 700, color: C.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.6rem' }}>Your next steps</p>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : `repeat(${steps.length}, minmax(0, 1fr))`, gap: '0.75rem' }}>
            {steps.map((s, i) => (
              <button key={s.title} type="button" onClick={s.onClick} style={{ textAlign: 'left', border: `1px solid ${C.borderLight}`, background: 'white', borderRadius: '16px', padding: '1rem', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: C.navy, color: 'white', fontSize: '13px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</span>
                <span style={{ fontSize: '15px', fontWeight: 700, color: C.navy }}>{s.title}</span>
                <span style={{ fontSize: '13px', color: C.textSecondary, lineHeight: 1.5 }}>{s.text}</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: C.accent, marginTop: 'auto' }}>{s.cta} →</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{ background: C.navy, borderRadius: '18px', padding: isMobile ? '1.1rem' : '1.25rem 1.5rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.9rem' }}>
        <div style={{ flex: '1 1 260px' }}>
          <p style={{ margin: '0 0 0.2rem', fontSize: '16px', fontWeight: 700, color: 'white' }}>{primary.heading}</p>
          <p style={{ margin: 0, fontSize: '14px', color: '#C2CDE2', lineHeight: 1.5 }}>{primary.text}</p>
        </div>
        <button type="button" onClick={primary.onClick} style={{ ...primaryBtn, whiteSpace: 'nowrap' }}>{primary.label}</button>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', marginTop: '1rem' }}>
        {secondary && <button type="button" onClick={secondary.onClick} style={{ background: 'none', border: 'none', color: C.accent, fontSize: '14px', fontWeight: 600, cursor: 'pointer', padding: 0 }}>{secondary.label}</button>}
        <button type="button" onClick={onRetake} style={{ background: 'none', border: 'none', color: C.textMuted, fontSize: '14px', textDecoration: 'underline', cursor: 'pointer', padding: 0 }}>Retake the quiz</button>
      </div>
    </div>
  );
}
