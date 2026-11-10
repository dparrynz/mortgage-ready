import React, { useState, useEffect, useRef } from 'react';
import { C, primaryBtn, inputWrap, inputStyle } from '../../ParryFSApp.jsx';
import { PlaybookHeader, PlaybookCard, PlaybookDisclaimer, BOOKINGS_URL } from './shared.jsx';

// Posts to the /api/notify-enquiry serverless function (api/notify-enquiry.js),
// which emails Dan via Resend. Plain notification only, no automation beyond
// that — Dan follows up manually, per the build brief.
async function submitEnquiry(payload) {
  const res = await fetch('/api/notify-enquiry', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.ok;
}

const TURNSTILE_SITE_KEY = '0x4AAAAAAEMcplqQ59H92Bmy';

export default function BookACall({ onExit, onBackToHub, onNavigate }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', bestTime: '', comment: '', website: '' });
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [turnstileToken, setTurnstileToken] = useState('');
  const turnstileRef = useRef(null);
  const widgetId = useRef(null);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  // Cloudflare Turnstile bot check, same as the sign in form
  useEffect(() => {
    if (status === 'sent') return;
    const render = () => {
      if (!turnstileRef.current || !window.turnstile || widgetId.current !== null) return;
      widgetId.current = window.turnstile.render(turnstileRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        callback: (token) => setTurnstileToken(token),
        'expired-callback': () => setTurnstileToken(''),
        'error-callback': () => setTurnstileToken(''),
      });
    };
    let timer;
    if (window.turnstile) render();
    else timer = setInterval(() => { if (window.turnstile) { clearInterval(timer); render(); } }, 100);
    return () => {
      if (timer) clearInterval(timer);
      if (widgetId.current !== null && window.turnstile) {
        try { window.turnstile.remove(widgetId.current); } catch (e) {}
      }
      widgetId.current = null;
    };
  }, [status === 'sent']);

  const canSubmit = form.name.trim() && form.email.trim() && form.phone.trim() && turnstileToken;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setStatus('sending');
    const ok = await submitEnquiry({
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      bestTime: form.bestTime.trim(),
      comment: form.comment.trim(),
      website: form.website,
      turnstileToken,
    });
    setStatus(ok ? 'sent' : 'error');
    if (!ok && window.turnstile && widgetId.current !== null) {
      // tokens are single use, so get a fresh one for the retry
      setTurnstileToken('');
      try { window.turnstile.reset(widgetId.current); } catch (e) {}
    }
  };

  return (
    <div>
      <PlaybookHeader title="Get Your Plan" onExit={onExit} onBackToHub={onBackToHub} />
      <PlaybookCard>
        <p style={{ fontSize: '14px', color: C.textSecondary, lineHeight: 1.7, margin: '0 0 1.5rem' }}>
          A no pressure first conversation about buying your first home, covering your numbers and what's possible for you. Send a few details and we'll follow up, or book straight into a time below.
        </p>

        <WhatToExpect />

        {status === 'sent' ? (
          <div style={{ background: C.greenBg, border: `1px solid ${C.greenBorder}`, borderRadius: '12px', padding: '1.25rem' }}>
            <p style={{ fontSize: '15px', fontWeight: '600', color: C.green, margin: '0 0 0.25rem' }}>Thanks, we've got your details.</p>
            <p style={{ fontSize: '14px', color: C.textSecondary, margin: 0 }}>We'll be in touch soon, or pick a time below if you'd rather lock one in now.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <Field label="Name">
              <input value={form.name} onChange={set('name')} required style={inputStyle} placeholder="Your name" />
            </Field>
            <Field label="Phone">
              <input value={form.phone} onChange={set('phone')} required style={inputStyle} placeholder="Your phone number" />
            </Field>
            <Field label="Email">
              <input type="email" value={form.email} onChange={set('email')} required style={inputStyle} placeholder="you@email.com" />
            </Field>
            <Field label="Best time to contact you">
              <input value={form.bestTime} onChange={set('bestTime')} style={inputStyle} placeholder="e.g. weekday evenings" />
            </Field>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '0.75rem', color: C.textPrimary }}>Anything else you'd like to add? (optional)</label>
              <textarea
                value={form.comment}
                onChange={set('comment')}
                rows={4}
                style={{ width: '100%', boxSizing: 'border-box', background: C.inputBg, border: 'none', borderRadius: '12px', padding: '1rem 1.25rem', fontSize: '15px', color: C.textPrimary, outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
              />
            </div>
            {/* Honeypot: hidden from people, bots tend to fill it in */}
            <div aria-hidden="true" style={{ position: 'absolute', left: '-10000px', width: '1px', height: '1px', overflow: 'hidden' }}>
              <label>Website<input type="text" name="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={set('website')} /></label>
            </div>
            <div ref={turnstileRef} style={{ marginBottom: '1rem' }} />
            {status === 'error' && (
              <p style={{ fontSize: '13px', color: C.red, marginBottom: '1rem' }}>Something went wrong sending that — please try again, or use the booking link below.</p>
            )}
            <button type="submit" disabled={!canSubmit || status === 'sending'} style={{ ...primaryBtn, opacity: canSubmit ? 1 : 0.4, cursor: canSubmit ? 'pointer' : 'not-allowed' }}>
              {status === 'sending' ? 'Sending...' : 'Send my details'}
            </button>
          </form>
        )}

        <div style={{ borderTop: `1px solid ${C.borderLight}`, margin: '2rem 0 1.5rem' }} />

        <h3 style={{ fontSize: '16px', fontWeight: '600', color: C.textPrimary, margin: '0 0 0.5rem' }}>Or book a time directly</h3>
        <p style={{ fontSize: '14px', color: C.textSecondary, margin: '0 0 1rem' }}>Pick a slot that works for you, no need to wait for a reply.</p>
        <a href={BOOKINGS_URL} target="_blank" rel="noopener noreferrer" style={{ ...primaryBtn, display: 'inline-block', textDecoration: 'none' }}>
          Book a time
        </a>

        <PlaybookDisclaimer />
      </PlaybookCard>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '0.75rem', color: C.textPrimary }}>{label}</label>
      <div style={inputWrap}>{children}</div>
    </div>
  );
}

// Sets expectations before someone commits to a call. Removing the unknowns
// is one of the easiest ways to lift enquiries.
function WhatToExpect() {
  const items = [
    ['ti-coin-off', 'Free for you', "There's no cost to you for our advice. If you go ahead with a home loan, the bank pays us."],
    ['ti-mood-smile', 'No pressure, no obligation', "It's a conversation, not a sales pitch. You decide if and when to take the next step."],
    ['ti-shield-check', 'No credit check', "A first chat doesn't involve a credit check, so it won't affect your credit score."],
    ['ti-file-off', "No paperwork needed yet", "Come as you are. Rough numbers are fine, we'll tell you what's needed later."],
  ];
  return (
    <div style={{ background: C.accentLight, borderRadius: '16px', padding: '1.25rem', marginBottom: '1.75rem' }}>
      <p style={{ fontSize: '15px', fontWeight: '600', color: C.textPrimary, margin: '0 0 1rem' }}>What to expect from a first chat</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        {items.map(([icon, title, body]) => (
          <div key={title} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <i className={`ti ${icon}`} style={{ fontSize: '20px', color: C.accent, flexShrink: 0, marginTop: '1px' }} />
            <div>
              <p style={{ fontSize: '14px', fontWeight: '600', color: C.textPrimary, margin: '0 0 0.2rem' }}>{title}</p>
              <p style={{ fontSize: '13px', color: C.textSecondary, lineHeight: 1.6, margin: 0 }}>{body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
