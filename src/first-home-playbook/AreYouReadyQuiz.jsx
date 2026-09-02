import React, { useState } from 'react';
import { C, primaryBtn, secondaryBtn } from '../../ParryFSApp.jsx';
import { PlaybookHeader, PlaybookCard, PlaybookDisclaimer, BookCallCTA } from './shared.jsx';
import { ARE_YOU_READY_QUESTIONS, ARE_YOU_READY_OUTCOMES } from './content.js';

// Each answer index (0/1/2) maps to "starting/getting there/ready". The band
// with the most answers wins; ties resolve toward the more cautious band,
// matching the draft's "never turns someone away, just calibrates the CTA".
function scoreAnswers(answers) {
  const counts = [0, 0, 0];
  answers.forEach((a) => { if (a !== null) counts[a] += 1; });
  if (counts[2] >= counts[1] && counts[2] >= counts[0] && counts[2] > 0) return 'ready';
  if (counts[1] >= counts[0]) return 'gettingThere';
  return 'starting';
}

export default function AreYouReadyQuiz({ onExit, onBackToHub, onNavigate }) {
  const [answers, setAnswers] = useState(Array(ARE_YOU_READY_QUESTIONS.length).fill(null));
  const [submitted, setSubmitted] = useState(false);

  const answer = (qi, oi) => {
    const next = [...answers];
    next[qi] = oi;
    setAnswers(next);
  };

  const allAnswered = answers.every((a) => a !== null);
  const outcome = submitted ? ARE_YOU_READY_OUTCOMES[scoreAnswers(answers)] : null;

  return (
    <div>
      <PlaybookHeader title="Are You Ready?" onExit={onExit} onBackToHub={onBackToHub} />
      <PlaybookCard>
        <h1 style={{ fontSize: '24px', fontWeight: '500', color: C.textPrimary, margin: '0 0 0.25rem' }}>Are You Ready?</h1>
        <p style={{ fontSize: '14px', color: C.textSecondary, margin: '0 0 1.5rem' }}>A quick, no-pressure self-check on where you stand.</p>

        {!submitted && (
          <>
            {ARE_YOU_READY_QUESTIONS.map((item, qi) => (
              <div key={item.q} style={{ marginBottom: '1.5rem' }}>
                <p style={{ fontSize: '15px', fontWeight: '600', color: C.textPrimary, margin: '0 0 0.75rem' }}>{qi + 1}. {item.q}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {item.options.map((opt, oi) => (
                    <button
                      key={opt}
                      onClick={() => answer(qi, oi)}
                      style={{
                        textAlign: 'left',
                        padding: '0.75rem 1rem',
                        borderRadius: '10px',
                        border: answers[qi] === oi ? `2px solid ${C.accent}` : `2px solid ${C.borderLight}`,
                        background: answers[qi] === oi ? C.accentLight : C.inputBg,
                        cursor: 'pointer',
                        fontSize: '14px',
                        color: C.textPrimary,
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <button
              onClick={() => setSubmitted(true)}
              disabled={!allAnswered}
              style={{ ...primaryBtn, opacity: allAnswered ? 1 : 0.4, cursor: allAnswered ? 'pointer' : 'not-allowed' }}
            >
              See my result
            </button>
          </>
        )}

        {submitted && outcome && (
          <div>
            <div style={{ background: C.accentLight, borderRadius: '12px', padding: '1.5rem', marginBottom: '1rem' }}>
              <p style={{ fontSize: '17px', fontWeight: '600', color: C.textPrimary, margin: '0 0 0.5rem' }}>{outcome.title}</p>
              <p style={{ fontSize: '14px', color: C.textSecondary, lineHeight: 1.7, margin: 0 }}>{outcome.body}</p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button style={secondaryBtn} onClick={() => onNavigate('/calculator')}>Run the calculator</button>
              <button style={primaryBtn} onClick={() => onNavigate('/book-a-call')}>Book a call with Dan</button>
            </div>
            <button
              onClick={() => { setSubmitted(false); setAnswers(Array(ARE_YOU_READY_QUESTIONS.length).fill(null)); }}
              style={{ background: 'none', border: 'none', color: C.textMuted, fontSize: '13px', textDecoration: 'underline', cursor: 'pointer', marginTop: '1rem', padding: 0 }}
            >
              Retake the quiz
            </button>
          </div>
        )}

        <PlaybookDisclaimer onNavigate={onNavigate} />
      </PlaybookCard>
    </div>
  );
}
