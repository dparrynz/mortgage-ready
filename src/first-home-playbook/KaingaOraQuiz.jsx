import React, { useState, useRef } from 'react';
import { useScrollToTopOnChange } from '../useScrollToTopOnChange.js';
import { C, MoneyField, useWindowWidth } from '../../ParryFSApp.jsx';
import { PlaybookHeader, PlaybookCard, PlaybookDisclaimer } from './shared.jsx';
import { QuizProgress, QuizQuestionTitle, AnswerButton, QuizNav, ResultCard } from './quizParts.jsx';

// Citizenship/residency, owner-occupier intent and deposit readiness aren't
// computed anywhere in Borrow Checker, so they're checked fresh here.
// Income caps: $95,000 for one buyer, $150,000 for one buyer with
// dependants, $150,000 combined for two or more buyers.

const initial = { residency: null, ownership: null, ownerOccupier: null, buyers: null, dependants: null, deposit: null };

const fmt = (n) => `$${n.toLocaleString('en-NZ')}`;

export default function KaingaOraQuiz({ onExit, onBackToHub, onNavigate }) {
  const isMobile = useWindowWidth() < 768;
  const [answers, setAnswers] = useState(initial);
  const [incomeA, setIncomeA] = useState(0);
  const [incomeB, setIncomeB] = useState(0);
  const [step, setStep] = useState(0);
  const topRef = useRef(null);
  useScrollToTopOnChange(topRef, step);

  const isJoint = answers.buyers === 'joint';

  // The question list changes with the answers: the dependants question only
  // shows for someone buying alone.
  const STEPS = [
    { key: 'residency', q: 'Are you a NZ citizen, permanent resident or resident visa holder living in New Zealand?', options: [['yes', 'Yes'], ['no', 'No']] },
    { key: 'ownership', q: 'Have you owned a home before?', options: [['first', 'No, this is my first'], ['similar', "Yes, but I'm now in a similar financial position to a first home buyer"], ['own', 'Yes, and I currently own or have a stake in a property']] },
    { key: 'ownerOccupier', q: 'Will you live in the property yourself?', options: [['yes', "Yes, it'll be my main home"], ['no', "No, it's an investment or won't be my main home"]] },
    { key: 'buyers', q: 'Are you buying alone or with someone else?', options: [['single', 'Alone'], ['joint', 'With one other person or a group']] },
    ...(answers.buyers === 'single' ? [{ key: 'dependants', q: 'Do you have any dependent children?', options: [['yes', 'Yes'], ['no', 'No']] }] : []),
    { key: 'income', q: isJoint ? 'What is your combined income before tax over the last 12 months?' : 'What is your income before tax over the last 12 months?' },
    { key: 'deposit', q: 'Do you have at least a 5% deposit, or will you soon?', options: [['yes', 'Yes'], ['not-yet', 'Not yet']] },
  ];
  const total = STEPS.length;
  const done = step >= total;
  const current = STEPS[step];

  const choose = (key, val) => {
    setAnswers((a) => ({ ...a, [key]: val, ...(key === 'buyers' && val === 'joint' ? { dependants: null } : {}) }));
    setTimeout(() => setStep((s) => s + 1), 220);
  };

  const retake = () => { setAnswers(initial); setIncomeA(0); setIncomeB(0); setStep(0); };

  const incomeAnswered = incomeA > 0 && (!isJoint || incomeB > 0);
  const cap = isJoint || answers.dependants === 'yes' ? 150000 : 95000;
  const income = incomeA + (isJoint ? incomeB : 0);

  // Each check is pass, fail, or "check" (worth talking through)
  const checks = done ? [
    { label: 'Citizen or resident', status: answers.residency === 'yes' ? 'pass' : 'fail' },
    { label: answers.ownership === 'similar' ? 'Previous owner in a similar position' : 'First home', status: answers.ownership === 'own' ? 'fail' : answers.ownership === 'similar' ? 'check' : 'pass' },
    { label: 'Living in it yourself', status: answers.ownerOccupier === 'yes' ? 'pass' : 'fail' },
    { label: `Income ${fmt(income)} (cap ${fmt(cap)})`, status: income <= cap ? 'pass' : 'fail' },
    { label: '5% deposit', status: answers.deposit === 'yes' ? 'pass' : 'check' },
  ] : [];

  const result = !done ? null
    : checks.some((c) => c.status === 'fail') ? 'not-eligible'
    : checks.some((c) => c.status === 'check') ? 'borderline'
    : 'eligible';

  const nav = (path) => () => onNavigate(path);
  const book = { label: 'Book a call', onClick: nav('/book-a-call') };

  const OUTCOMES = {
    eligible: {
      art: 'house', badge: 'Looks eligible',
      title: 'You may be eligible for the First Home Loan.',
      body: 'That means you could buy with a 5% deposit. The lender makes the final call, so it\'s worth confirming properly.',
      primary: { ...book, heading: 'Confirm it properly', text: "We'll check the details and line up a lender that offers the First Home Loan." },
      secondary: { label: 'How the First Home Loan works →', onClick: nav('/kainga-ora') },
    },
    borderline: {
      art: 'scales', badge: 'Worth a chat',
      title: "You're close, with a detail or two to check.",
      body: "Nothing here rules you out. The points marked below just need a proper look.",
      primary: { ...book, heading: "Let's look at the details", text: 'A quick call can tell you where you stand and what to sort first.' },
      secondary: { label: 'Where your deposit could come from →', onClick: nav('/deposit-sources') },
    },
    'not-eligible': {
      art: 'signpost', badge: 'Other paths',
      title: "The First Home Loan probably isn't the one for you right now.",
      body: "That doesn't mean you can't buy. There are other ways in, like family help or other low deposit lending.",
      primary: { ...book, heading: "Let's find your way in", text: "We'll look at the options that do fit your situation." },
      secondary: { label: 'Where your deposit could come from →', onClick: nav('/deposit-sources') },
    },
  };
  const outcome = result ? OUTCOMES[result] : null;

  const STATUS = {
    pass: { bg: '#E6F4EE', colour: '#2E7D60', icon: <path d="M5 12l5 5L20 7" />, word: 'Yes' },
    fail: { bg: '#FDEFEC', colour: C.red, icon: <><path d="M6 6l12 12" /><path d="M18 6 6 18" /></>, word: 'No' },
    check: { bg: '#FFF4DE', colour: '#A86A00', icon: <><path d="M12 7v6" /><path d="M12 17h.01" /></>, word: 'Check' },
  };

  return (
    <div>
      <PlaybookHeader title="Kāinga Ora Qualifying Quiz" onExit={onExit} onBackToHub={onBackToHub} />
      <div ref={topRef} />
      <PlaybookCard style={{ padding: isMobile ? '1.25rem' : '2rem' }}>
        {!done && (
          <div style={{ maxWidth: '620px', margin: '0 auto' }}>
            <QuizProgress step={step} total={total} />
            <QuizQuestionTitle>{current.q}</QuizQuestionTitle>

            {current.key === 'income' ? (
              <>
                <MoneyField label="Your income" value={incomeA} onChange={setIncomeA} hint={!isJoint ? `The cap is ${fmt(cap)}${answers.dependants === 'yes' ? ' for one buyer with dependants' : ' for one buyer'}.` : undefined} />
                {isJoint && <MoneyField label="Their income" value={incomeB} onChange={setIncomeB} hint="The cap is $150,000 combined for two or more buyers." />}
                <QuizNav onBack={() => setStep((s) => s - 1)} onNext={() => setStep((s) => s + 1)} nextDisabled={!incomeAnswered} />
              </>
            ) : (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {current.options.map(([val, text]) => (
                    <AnswerButton key={val} selected={answers[current.key] === val} onClick={() => choose(current.key, val)}>{text}</AnswerButton>
                  ))}
                </div>
                <QuizNav onBack={step > 0 ? () => setStep((s) => s - 1) : null} />
              </>
            )}
          </div>
        )}

        {outcome && (
          <ResultCard isMobile={isMobile} art={outcome.art} badge={outcome.badge} title={outcome.title} body={outcome.body} primary={outcome.primary} secondary={outcome.secondary} onRetake={retake}>
            <div style={{ marginBottom: '1.25rem' }}>
              <p style={{ fontSize: '12px', fontWeight: 700, color: C.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.6rem' }}>Your answers at a glance</p>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(250px, 1fr))', gap: '0.6rem' }}>
                {checks.map((c) => {
                  const s = STATUS[c.status];
                  return (
                    <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', border: `1px solid ${C.borderLight}`, borderRadius: '14px', padding: '0.75rem 0.9rem' }}>
                      <span style={{ width: '30px', height: '30px', borderRadius: '50%', background: s.bg, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={s.colour} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{s.icon}</svg>
                      </span>
                      <span style={{ fontSize: '14px', color: C.navy, flex: 1 }}>{c.label}</span>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: s.colour }}>{s.word}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </ResultCard>
        )}

        <PlaybookDisclaimer />
      </PlaybookCard>
    </div>
  );
}
