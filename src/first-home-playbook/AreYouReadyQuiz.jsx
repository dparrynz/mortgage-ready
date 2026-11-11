import React, { useState } from 'react';
import { useWindowWidth } from '../../ParryFSApp.jsx';
import { PlaybookHeader, PlaybookCard, PlaybookDisclaimer } from './shared.jsx';
import { ARE_YOU_READY_QUESTIONS } from './content.js';
import { QuizProgress, QuizQuestionTitle, AnswerButton, QuizNav, ResultCard } from './quizParts.jsx';

// Each answer index (0/1/2) maps to "starting/getting there/ready". The band
// with the most answers wins; ties resolve toward the more cautious band,
// so it never turns someone away, it just calibrates the next step.
function scoreAnswers(answers) {
  const counts = [0, 0, 0];
  answers.forEach((a) => { if (a !== null) counts[a] += 1; });
  if (counts[2] >= counts[1] && counts[2] >= counts[0] && counts[2] > 0) return 'ready';
  if (counts[1] >= counts[0]) return 'gettingThere';
  return 'starting';
}

export default function AreYouReadyQuiz({ onExit, onBackToHub, onNavigate }) {
  const isMobile = useWindowWidth() < 768;
  const total = ARE_YOU_READY_QUESTIONS.length;
  const [answers, setAnswers] = useState(Array(total).fill(null));
  const [step, setStep] = useState(0);
  const done = step >= total;

  const answer = (oi) => {
    const next = [...answers];
    next[step] = oi;
    setAnswers(next);
    // Short pause so the tap registers visually before moving on
    setTimeout(() => setStep((s) => s + 1), 220);
  };

  const retake = () => { setAnswers(Array(total).fill(null)); setStep(0); };

  const step_ = (title, text, cta, path) => ({ title, text, cta, onClick: () => onNavigate(path) });
  const book = { heading: 'Talk it through', label: 'Book a call', onClick: () => onNavigate('/book-a-call') };

  const OUTCOMES = {
    starting: {
      art: 'seedling',
      badge: 'Just starting',
      title: "You're at the beginning, and that's a great place to be.",
      body: 'Now is the time to get the basics sorted, so you know what to aim for.',
      steps: [
        step_('See your numbers', 'Get a rough idea of what you could borrow.', 'Know your numbers', '/calculator'),
        step_('Plan your deposit', 'See where your deposit could come from.', 'Deposit sources', '/deposit-sources'),
        step_('Learn the steps', 'Every stage from pre-approval to keys.', 'Your journey', '/journey'),
      ],
      primary: { ...book, text: "No rush. When you're ready, a quick chat can map out your plan." },
    },
    gettingThere: {
      art: 'path',
      badge: 'Getting there',
      title: "You're closer than you think.",
      body: 'A few pieces are in place. Pin down the rest and you could be house hunting soon.',
      steps: [
        step_('Check your borrowing', 'See where you stand today.', 'Know your numbers', '/calculator'),
        step_('Firm up your deposit', 'KiwiSaver, savings, family help or a mix.', 'Deposit sources', '/deposit-sources'),
        step_('Know the hidden costs', 'Budget for the extras on top of the price.', 'Costs of buying', '/costs-of-buying'),
      ],
      primary: { ...book, text: 'A quick call gets you a clear picture of your options and timing.' },
    },
    ready: {
      art: 'key',
      badge: 'Ready to talk',
      title: "Sounds like you're ready for a proper conversation.",
      body: "Let's talk numbers and get you pre-approved, so you can shop with confidence.",
      steps: [
        step_('Gather your documents', 'Payslips and recent bank statements.', 'See the journey', '/journey'),
        step_('Know the hidden costs', 'Budget for the extras on top of the price.', 'Costs of buying', '/costs-of-buying'),
      ],
      primary: { ...book, heading: 'Next step: pre-approval', text: "We'll map out what's possible and get the bank's approval in principle." },
    },
  };

  const outcome = done ? OUTCOMES[scoreAnswers(answers)] : null;
  const q = ARE_YOU_READY_QUESTIONS[step];

  return (
    <div>
      <PlaybookHeader title="Are You Ready?" onExit={onExit} onBackToHub={onBackToHub} />
      <PlaybookCard style={{ padding: isMobile ? '1.25rem' : '2rem' }}>
        {!done && (
          <div style={{ maxWidth: '620px', margin: '0 auto' }}>
            <QuizProgress step={step} total={total} />
            <QuizQuestionTitle>{q.q}</QuizQuestionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {q.options.map((opt, oi) => (
                <AnswerButton key={opt} selected={answers[step] === oi} onClick={() => answer(oi)}>{opt}</AnswerButton>
              ))}
            </div>
            <QuizNav onBack={step > 0 ? () => setStep((s) => s - 1) : null} />
          </div>
        )}

        {outcome && (
          <ResultCard
            isMobile={isMobile}
            art={outcome.art}
            badge={outcome.badge}
            title={outcome.title}
            body={outcome.body}
            steps={outcome.steps}
            primary={outcome.primary}
            onRetake={retake}
          />
        )}

        <PlaybookDisclaimer />
      </PlaybookCard>
    </div>
  );
}
