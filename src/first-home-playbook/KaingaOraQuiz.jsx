import React, { useState } from 'react';
import { C, primaryBtn, MoneyField, checkKaingaOraIncomeCap } from '../../ParryFSApp.jsx';
import { PlaybookHeader, PlaybookCard, PlaybookDisclaimer, BookCallCTA } from './shared.jsx';

// Citizenship/residency, owner-occupier intent, and deposit readiness aren't
// computed anywhere in Borrow Checker today (it assumes an NZ-resident
// owner-occupier and only asks for deposit amount), so there's no existing
// logic to reuse for those three checks — they're implemented fresh here.
// The income cap re-uses checkKaingaOraIncomeCap, exported from
// ParryFSApp.jsx, so it can never drift from the number Borrow Checker uses.

const initial = {
  residency: null,
  ownership: null,
  ownerOccupier: null,
  buyers: null,
  income: null,
  deposit: null,
};

export default function KaingaOraQuiz({ onExit, onBackToHub, onNavigate }) {
  const [answers, setAnswers] = useState(initial);
  const [incomeSingle, setIncomeSingle] = useState(0);
  const [incomeJoint, setIncomeJoint] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const set = (key, val) => setAnswers((a) => ({ ...a, [key]: val }));

  const isJoint = answers.buyers === 'joint';
  const allAnswered = Object.entries(answers).every(([k, v]) => v !== null) && (isJoint ? incomeJoint > 0 || incomeJoint === 0 : true);

  const evaluate = () => {
    const hardFails = [
      answers.residency === 'no',
      answers.ownership === 'own',
      answers.ownerOccupier === 'no',
    ];
    if (hardFails.some(Boolean)) return 'not-eligible';

    const incomeEligible = checkKaingaOraIncomeCap({
      applicationType: isJoint ? 'joint' : 'single',
      baseSalary: isJoint ? incomeJoint / 2 : incomeSingle,
      partnerBaseSalary: isJoint ? incomeJoint / 2 : 0,
    });

    if (!incomeEligible) return 'not-eligible';
    if (answers.deposit === 'not-yet') return 'borderline';
    return 'eligible';
  };

  const outcomes = {
    eligible: { title: 'It looks like you may be eligible for the Kāinga Ora First Home Loan.', body: 'Worth a conversation to confirm properly, since the lender makes the final call, not this quiz.' },
    borderline: { title: "There's some nuance to your situation worth talking through.", body: "You're close, but a couple of details need a proper look before we can say for sure." },
    'not-eligible': { title: "Based on what you've told us, the First Home Loan likely isn't available to you right now.", body: 'There may be other options worth discussing.' },
  };

  const result = submitted ? outcomes[evaluate()] : null;

  return (
    <div>
      <PlaybookHeader title="Kāinga Ora Qualifying Quiz" onExit={onExit} onBackToHub={onBackToHub} />
      <PlaybookCard>
        <h1 style={{ fontSize: '24px', fontWeight: '500', color: C.textPrimary, margin: '0 0 0.25rem' }}>Kāinga Ora Qualifying Quiz</h1>
        <p style={{ fontSize: '14px', color: C.textSecondary, margin: '0 0 1.5rem' }}>A fast read on eligibility, using the same criteria as our Borrow Checker.</p>

        {!submitted && (
          <>
            <QuizQuestion label="Are you a New Zealand citizen, permanent resident, or resident visa holder ordinarily living in New Zealand?" value={answers.residency} onChange={(v) => set('residency', v)} options={[['yes', 'Yes'], ['no', 'No']]} />
            <QuizQuestion label="Have you owned a home before?" value={answers.ownership} onChange={(v) => set('ownership', v)} options={[['first', "No, this is my first"], ['similar', "Yes, but I'm in a similar financial position to a first home buyer now"], ['own', 'Yes, and I currently own or have a stake in a property']]} />
            <QuizQuestion label="Will you live in the property yourself?" value={answers.ownerOccupier} onChange={(v) => set('ownerOccupier', v)} options={[['yes', "Yes, it'll be my main home"], ['no', "No, it's an investment or won't be my main home"]]} />
            <QuizQuestion label="Are you buying alone or with someone else?" value={answers.buyers} onChange={(v) => set('buyers', v)} options={[['single', 'Alone'], ['joint', 'With one other person or a group']]} />

            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '15px', fontWeight: '600', color: C.textPrimary, margin: '0 0 0.5rem' }}>What's your gross income before tax over the last 12 months?</p>
              {!isJoint ? (
                <MoneyField label="Your income" value={incomeSingle} onChange={setIncomeSingle} hint="Single buyer cap is $95,000, or $150,000 with dependants." />
              ) : (
                <MoneyField label="Combined income" value={incomeJoint} onChange={setIncomeJoint} hint="Combined cap for two or more buyers is $150,000." />
              )}
              <button onClick={() => set('income', 'answered')} style={{ marginTop: '0.5rem', background: 'none', border: 'none', color: C.textMuted, fontSize: '12px', cursor: 'pointer', padding: 0, textDecoration: answers.income ? 'none' : 'underline' }}>
                {answers.income ? 'Income noted ✓' : 'Confirm income'}
              </button>
            </div>

            <QuizQuestion label="Do you have at least a 5% deposit available or nearly available?" value={answers.deposit} onChange={(v) => set('deposit', v)} options={[['yes', 'Yes'], ['not-yet', 'Not yet']]} />

            <button
              onClick={() => setSubmitted(true)}
              disabled={!allAnswered}
              style={{ ...primaryBtn, opacity: allAnswered ? 1 : 0.4, cursor: allAnswered ? 'pointer' : 'not-allowed' }}
            >
              See my result
            </button>
          </>
        )}

        {submitted && result && (
          <div>
            <div style={{ background: C.accentLight, borderRadius: '12px', padding: '1.5rem', marginBottom: '1rem' }}>
              <p style={{ fontSize: '17px', fontWeight: '600', color: C.textPrimary, margin: '0 0 0.5rem' }}>{result.title}</p>
              <p style={{ fontSize: '14px', color: C.textSecondary, lineHeight: 1.7, margin: 0 }}>{result.body}</p>
            </div>
            <BookCallCTA onNavigate={onNavigate} />
            <button
              onClick={() => { setSubmitted(false); setAnswers(initial); setIncomeSingle(0); setIncomeJoint(0); }}
              style={{ display: 'block', background: 'none', border: 'none', color: C.textMuted, fontSize: '13px', textDecoration: 'underline', cursor: 'pointer', marginTop: '1rem', padding: 0 }}
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

function QuizQuestion({ label, value, onChange, options }) {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <p style={{ fontSize: '15px', fontWeight: '600', color: C.textPrimary, margin: '0 0 0.75rem' }}>{label}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {options.map(([val, text]) => (
          <button
            key={val}
            onClick={() => onChange(val)}
            style={{
              textAlign: 'left',
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              border: value === val ? `2px solid ${C.accent}` : `2px solid ${C.borderLight}`,
              background: value === val ? C.accentLight : C.inputBg,
              cursor: 'pointer',
              fontSize: '14px',
              color: C.textPrimary,
            }}
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  );
}
