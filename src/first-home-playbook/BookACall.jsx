import React, { useState } from 'react';
import { C, primaryBtn, inputWrap, inputStyle } from '../../ParryFSApp.jsx';
import { PlaybookHeader, PlaybookCard, PlaybookDisclaimer } from './shared.jsx';

const BOOKINGS_URL = 'https://outlook.office.com/bookwithme/user/35910337ef6b47e19c21334740c35b06@mikepero.co.nz/meetingtype/S_Ma3DVzG0q0a21VJQQ2GA2?bookingcode=9cc31a19-0a07-4b23-af84-d8655a9195af&anonymous&ismsaljsauthenabled&ep=mcard';

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

export default function BookACall({ onExit, onBackToHub, onNavigate }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', bestTime: '', comment: '' });
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const canSubmit = form.name.trim() && form.email.trim() && form.phone.trim();

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
    });
    setStatus(ok ? 'sent' : 'error');
  };

  return (
    <div>
      <PlaybookHeader title="Get Your Plan" onExit={onExit} onBackToHub={onBackToHub} />
      <PlaybookCard>
        <h1 style={{ fontSize: '24px', fontWeight: '500', color: C.textPrimary, margin: '0 0 0.5rem' }}>Get Your Plan</h1>
        <p style={{ fontSize: '14px', color: C.textSecondary, lineHeight: 1.7, margin: '0 0 1.5rem' }}>
          A no pressure first conversation about buying your first home, covering your numbers and what's possible for you. Send a few details and Dan will follow up, or book straight into a time below.
        </p>

        {status === 'sent' ? (
          <div style={{ background: C.greenBg, border: `1px solid ${C.greenBorder}`, borderRadius: '12px', padding: '1.25rem' }}>
            <p style={{ fontSize: '15px', fontWeight: '600', color: C.green, margin: '0 0 0.25rem' }}>Thanks, that's through to Dan.</p>
            <p style={{ fontSize: '14px', color: C.textSecondary, margin: 0 }}>He'll be in touch, or pick a time below if you'd rather lock one in now.</p>
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
          Book with Dan
        </a>

        <PlaybookDisclaimer onNavigate={onNavigate} />
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
