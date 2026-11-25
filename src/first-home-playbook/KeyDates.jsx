import React, { useState, useEffect, useRef } from 'react';
import { C, primaryBtn, supabase } from '../../ParryFSApp.jsx';
import {
  KEY_DATES_LS_KEY, REMIND_DAYS, PREAPPROVAL_REMIND_DAYS, INSPECTION_WORKING_DAYS_BEFORE, MAX_CONDITIONS, MAX_LABEL, MAX_WORKING_DAYS, DEFAULT_WORKING_DAYS, PROVINCES,
  addWorkingDays, workingDaysBefore, isLimCondition, withCalculatedDates,
  emptyKeyDates, normaliseKeyDates, hasAnyDate, hasOfferDates, keyDateEvents, nextEvent, dayDiff, todayIso,
  formatDate, groupTitle, groupDetail, groupChecklist, groupUntilText, buildIcs,
} from './keyDatesLogic.js';

// Key dates for the Journey page: once an offer is accepted, people add the
// dates from their agreement, see a countdown and timeline, can put them in
// their phone calendar, and (with an account) get an email 3 days before each.
//
// Dates are kept on the device, and in the person's account when signed in.
// Email reminders need an account, as that's where the email address is.

const readLocal = () => {
  try { return normaliseKeyDates(JSON.parse(localStorage.getItem(KEY_DATES_LS_KEY))); } catch { return normaliseKeyDates(null); }
};
const writeLocal = (dates) => { try { localStorage.setItem(KEY_DATES_LS_KEY, JSON.stringify(dates)); } catch {} };

export function useKeyDates(user) {
  const [dates, setDates] = useState(() => normaliseKeyDates(null));
  const [reminders, setReminders] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');
  // Someone tapped "email reminders" before signing in: turn them on once they have
  const [wantReminders, setWantReminders] = useState(false);
  // Set after a save so the page can bring the countdown into view
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let d = readLocal();
      let r = false;
      if (user) {
        const { data } = await supabase.getKeyDates();
        const saved = data ? normaliseKeyDates(data.dates) : null;
        if (saved && hasAnyDate(saved)) { d = saved; r = !!data.reminders; }
        else if (hasAnyDate(d)) supabase.saveKeyDates(d, false); // first sign-in: keep what's on this device
      }
      if (!cancelled) { setDates(d); setReminders(r); writeLocal(d); setLoaded(true); }
    })();
    return () => { cancelled = true; };
  }, [user]);

  const persist = async (d, r) => {
    setDates(d); setReminders(r); writeLocal(d); setError('');
    if (user) {
      const { error: e } = await supabase.saveKeyDates(d, r);
      if (e) setError("We couldn't save that to your account. Check your connection and try again.");
    }
  };

  useEffect(() => {
    if (user && loaded && wantReminders) { setWantReminders(false); if (hasAnyDate(dates)) persist(dates, true); }
  }, [user, loaded, wantReminders]);

  return {
    dates, reminders, loaded, editing, error,
    has: hasAnyDate(dates),
    startEditing: () => setEditing(true),
    cancelEditing: () => setEditing(false),
    justSaved,
    clearJustSaved: () => setJustSaved(false),
    save: (d) => { setEditing(false); setJustSaved(true); return persist(normaliseKeyDates(d), reminders && hasAnyDate(d)); },
    clear: () => { setEditing(false); return persist(normaliseKeyDates(null), false); },
    setReminders: (on) => persist(dates, on),
    askForReminders: () => setWantReminders(true),
  };
}

// Built on first use, not at load: this file and ParryFSApp.jsx import each
// other, so the shared colours (C) aren't ready while the module is loading.
let cached = null;
function styles() {
  if (cached) return cached;
  const card = { background: 'white', border: `1px solid ${C.borderLight}`, borderRadius: '16px', padding: '1rem 1.1rem' };
  const fieldLabel = { fontSize: '14px', fontWeight: 600, color: C.navy };
  const dateInput = { height: '46px', width: '100%', boxSizing: 'border-box', border: '1px solid #C9D6EA', borderRadius: '10px', padding: '0 0.7rem', fontSize: '16px', color: C.navy, background: C.inputBg };
  const outlineBtn = { minHeight: '48px', border: `1px solid ${C.sky}`, background: 'white', color: C.sky, borderRadius: '12px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', padding: '0.5rem 0.75rem' };
  const linkBtn = { border: 'none', background: 'transparent', color: C.accent, fontSize: '14px', fontWeight: 600, cursor: 'pointer', padding: '0.6rem 0', minHeight: '44px' };
  cached = { card, fieldLabel, dateInput, outlineBtn, linkBtn };
  return cached;
}

const CalendarIcon = ({ colour = 'white', size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={colour} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
    <rect x="3.5" y="5" width="17" height="15" rx="2" /><path d="M3.5 10h17M8 3v4M16 3v4" />
  </svg>
);

// Shown inside a stage once someone is at the offer, before any dates exist
export function KeyDatesPrompt({ onStart, auction }) {
  return (
    <div style={{ background: C.navy, color: 'white', borderRadius: '16px', padding: '1.1rem', marginBottom: '1rem' }}>
      <p style={{ margin: '0 0 0.4rem', fontSize: '17px', fontWeight: 700, fontFamily: C.headingFont, display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
        <CalendarIcon /> {auction ? 'Won the auction?' : 'Offer accepted?'}
      </p>
      <p style={{ margin: '0 0 0.9rem', fontSize: '14px', color: '#D6E2F5', lineHeight: 1.5 }}>
        Add the dates from your agreement and we'll remind you before each one, so nothing sneaks up on you.
      </p>
      <button type="button" onClick={onStart} style={{ ...primaryBtn, padding: '0.8rem 1.25rem' }}>Add my key dates</button>
      <p style={{ margin: '0.7rem 0 0', fontSize: '12px', color: '#A9B8D0' }}>Takes about 2 minutes. Have your Sale and Purchase Agreement handy.</p>
    </div>
  );
}

// Shown in the early stages (pre-approval, house hunting, homework): one date,
// so a pre-approval doesn't quietly run out while they're looking
export function PreapprovalPrompt({ kd }) {
  const { card, fieldLabel, dateInput } = styles();
  const [date, setDate] = useState('');
  const [problem, setProblem] = useState('');
  const today = todayIso();
  const submit = (e) => {
    e.preventDefault();
    if (!date) { setProblem('Pick the date your pre-approval expires.'); return; }
    if (date <= today) { setProblem('That date has already passed. Talk to your adviser or bank about renewing it.'); return; }
    kd.save({ ...kd.dates, preapproval: date });
  };
  return (
    <form onSubmit={submit} style={{ ...card, marginBottom: '1rem' }}>
      <p style={{ margin: '0 0 0.35rem', fontSize: '16px', fontWeight: 700, color: C.navy, fontFamily: C.headingFont, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <CalendarIcon colour={C.sky} size={20} /> Pre-approved?
      </p>
      <p style={{ margin: '0 0 0.8rem', fontSize: '14px', color: C.textSecondary, lineHeight: 1.5 }}>
        Most pre-approvals last 3 to 6 months. Add the date yours expires and we'll remind you {PREAPPROVAL_REMIND_DAYS / 7} weeks before, so it doesn't run out while you're looking.
      </p>
      <label htmlFor="kd-preapproval-quick" style={{ ...fieldLabel, display: 'block', marginBottom: '0.35rem' }}>Pre-approval expires</label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
        <input id="kd-preapproval-quick" type="date" min={today} value={date} onChange={(e) => { setDate(e.target.value); setProblem(''); }} style={{ ...dateInput, flex: '1 1 180px', width: 'auto' }} />
        <button type="submit" style={{ ...primaryBtn, padding: '0.7rem 1.25rem' }}>Save</button>
      </div>
      {problem && <p role="alert" style={{ margin: '0.6rem 0 0', fontSize: '14px', color: '#B3261E', fontWeight: 600 }}>{problem}</p>}
      <p style={{ margin: '0.6rem 0 0', fontSize: '12px', color: C.textSecondary }}>Your approval letter or your adviser can tell you the date.</p>
    </form>
  );
}

function Editor({ kd, path, isMobile }) {
  const { card, fieldLabel, dateInput, linkBtn } = styles();
  // Each condition is either "N working days after the offer" (worked out for
  // them) or a fixed date, whichever their agreement says
  const [draft, setDraft] = useState(() => {
    const d = hasOfferDates(kd.dates) ? kd.dates : { ...emptyKeyDates(path), preapproval: kd.dates.preapproval };
    return { ...d, conditions: d.conditions.map((c) => ({ ...c, mode: c.days || !c.date ? 'days' : 'date' })) };
  });
  const [problem, setProblem] = useState('');
  useEffect(() => { setProblem(''); }, [draft]); // clear an old message once they change something
  const set = (k, v) => setDraft((d) => ({ ...d, [k]: v }));
  // Suggest a pre-settlement inspection a couple of working days before
  // settlement, and keep it in step if settlement moves (unless they've changed it)
  const suggestedInspection = (d, settlement) => (settlement ? workingDaysBefore(settlement, INSPECTION_WORKING_DAYS_BEFORE, d.province) : '');
  const setSettlement = (v) => setDraft((d) => {
    const followSuggestion = !d.inspection || d.inspection === suggestedInspection(d, d.settlement);
    return { ...d, settlement: v, inspection: followSuggestion ? suggestedInspection(d, v) : d.inspection };
  });
  const setCond = (i, patch) => setDraft((d) => ({ ...d, conditions: d.conditions.map((c, j) => (j === i ? { ...c, ...patch } : c)) }));
  const removeCond = (i) => setDraft((d) => ({ ...d, conditions: d.conditions.filter((_, j) => j !== i) }));
  const addCond = () => setDraft((d) => ({ ...d, conditions: [...d.conditions, { label: '', days: DEFAULT_WORKING_DAYS, date: '', mode: 'days' }] }));

  const condDate = (c) => (c.mode === 'days'
    ? addWorkingDays(draft.accepted, c.days, draft.province, { lim: isLimCondition(c.label) })
    : c.date);
  const lastCondDate = draft.conditions.map(condDate).filter(Boolean).sort().pop() || '';

  // What gets saved: working-day conditions keep their number and get the
  // worked-out date; fixed-date ones drop the number
  const toSave = () => withCalculatedDates({
    ...draft,
    conditions: draft.conditions.map(({ mode, ...c }) => (mode === 'days' ? { ...c, date: '' } : { ...c, days: null })),
  });

  const submit = (e) => {
    e.preventDefault();
    // Only a pre-approval date so far (no offer yet): save just that
    const offerStarted = draft.accepted || draft.deposit || draft.inspection || draft.settlement || draft.conditions.some((c) => c.mode === 'date' && c.date);
    if (!offerStarted && draft.preapproval) { kd.save({ ...normaliseKeyDates(null), preapproval: draft.preapproval }); return; }
    if (draft.conditions.some((c) => c.mode === 'days' && c.days) && !draft.accepted) {
      setProblem('Add the date your offer was accepted, so we can work out your conditions dates.');
      return;
    }
    if (draft.conditions.some((c) => c.mode === 'days' && !c.days)) {
      setProblem(`Enter a number of working days (1 to ${MAX_WORKING_DAYS}) for each condition, or pick a date instead.`);
      return;
    }
    const clean = toSave();
    if (!hasAnyDate(clean)) { setProblem('Add at least one date to save.'); return; }
    const first = clean.accepted;
    const later = [...clean.conditions.map((c) => c.date), clean.deposit, clean.inspection, clean.settlement].filter(Boolean);
    if (first && later.some((d) => d < first)) { setProblem('One of your dates is before the day your offer was accepted. Check them and try again.'); return; }
    if (clean.settlement && later.some((d) => d > clean.settlement)) { setProblem('One of your dates is after settlement. Check them and try again.'); return; }
    kd.save(clean);
  };

  const row = { display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1fr) 220px', gap: isMobile ? '0.35rem' : '0.75rem', alignItems: 'center' };
  const removeBtn = { width: '44px', height: '44px', border: 'none', background: 'transparent', color: C.textSecondary, fontSize: '22px', cursor: 'pointer' };
  const small = { margin: 0, fontSize: '13px', color: C.textSecondary, lineHeight: 1.45 };

  return (
    <form onSubmit={submit} style={{ ...card, marginBottom: '1.25rem' }}>
      <p style={{ margin: '0 0 0.3rem', fontSize: '18px', fontWeight: 700, color: C.navy, fontFamily: C.headingFont }}>{kd.has ? 'Edit your key dates' : 'Add your key dates'}</p>
      <p style={{ margin: '0 0 1rem', fontSize: '14px', color: C.textSecondary, lineHeight: 1.5 }}>
        You'll find these in your Sale and Purchase Agreement. Not sure? Your solicitor or agent can confirm them. Leave out any that don't apply.
      </p>

      {!draft.accepted && path !== 'auction' && (
        <>
          <div style={{ ...row, marginBottom: '0.3rem' }}>
            <label htmlFor="kd-preapproval" style={fieldLabel}>Pre-approval expires</label>
            <input id="kd-preapproval" type="date" value={draft.preapproval} onChange={(e) => set('preapproval', e.target.value)} style={dateInput} />
          </div>
          <p style={{ ...small, margin: '0 0 0.9rem' }}>Still looking? Add just this and we'll remind you {PREAPPROVAL_REMIND_DAYS / 7} weeks before it runs out.</p>
        </>
      )}

      <div style={{ ...row, marginBottom: '0.9rem' }}>
        <label htmlFor="kd-accepted" style={fieldLabel}>{path === 'auction' ? 'Auction day' : 'Offer accepted'}</label>
        <input id="kd-accepted" type="date" value={draft.accepted} onChange={(e) => set('accepted', e.target.value)} style={dateInput} />
      </div>

      {path !== 'auction' && (
        <div style={{ ...row, marginBottom: '1rem' }}>
          <label htmlFor="kd-province" style={fieldLabel}>Where's the property?</label>
          <select id="kd-province" value={draft.province} onChange={(e) => set('province', e.target.value)} style={{ ...dateInput, appearance: 'auto' }}>
            {PROVINCES.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
          </select>
        </div>
      )}

      <div style={{ background: C.inputBg, borderRadius: '14px', padding: '0.9rem', marginBottom: '1rem' }}>
        <p style={{ margin: '0 0 0.2rem', fontSize: '15px', fontWeight: 700, color: C.navy }}>Conditions due</p>
        <p style={{ ...small, margin: '0 0 0.8rem' }}>
          {path === 'auction'
            ? 'An auction sale is usually unconditional, so you can skip this.'
            : 'Enter the working days written in your agreement and we\'ll work out the date. We skip weekends, public holidays, your anniversary day and the Christmas break (24 December to 5 January, or to 15 January for the LIM).'}
        </p>
        {draft.conditions.map((c, i) => {
          const date = condDate(c);
          const name = c.label || `Condition ${i + 1}`;
          return (
            <div key={i} style={{ background: 'white', borderRadius: '12px', padding: '0.6rem 0.7rem', marginBottom: '0.6rem' }}>
              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', marginBottom: '0.4rem' }}>
                <input type="text" aria-label={`Condition ${i + 1} name`} placeholder="Condition name" maxLength={MAX_LABEL} value={c.label} onChange={(e) => setCond(i, { label: e.target.value })} style={{ ...dateInput, background: 'white', flex: 1, fontWeight: 600 }} />
                <button type="button" aria-label={`Remove ${name}`} onClick={() => removeCond(i)} style={removeBtn}>×</button>
              </div>
              {c.mode === 'days' ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem 0.6rem' }}>
                  <input type="number" inputMode="numeric" min="1" max={MAX_WORKING_DAYS} aria-label={`${name}: working days after the offer`} value={c.days ?? ''} onChange={(e) => { const n = parseInt(e.target.value, 10); setCond(i, { days: Number.isInteger(n) ? Math.min(Math.max(n, 1), MAX_WORKING_DAYS) : null }); }} style={{ ...dateInput, width: '76px', textAlign: 'center' }} />
                  <span style={{ fontSize: '14px', color: C.navy }}>working days</span>
                  <span aria-live="polite" style={{ fontSize: '15px', fontWeight: 700, color: date ? C.navy : C.textMuted, marginLeft: isMobile ? 0 : 'auto' }}>
                    {date ? `→ ${formatDate(date)}` : draft.accepted ? '' : '→ add the offer date'}
                  </span>
                  <button type="button" onClick={() => setCond(i, { mode: 'date', date: date || c.date })} style={{ ...linkBtn, fontSize: '13px', flexBasis: '100%', textAlign: 'left', padding: '0.2rem 0', minHeight: '36px' }}>Pick a date instead</button>
                </div>
              ) : (
                <div>
                  <input type="date" aria-label={`${name} due date`} value={c.date} onChange={(e) => setCond(i, { date: e.target.value })} style={dateInput} />
                  <button type="button" onClick={() => setCond(i, { mode: 'days', days: c.days || DEFAULT_WORKING_DAYS })} style={{ ...linkBtn, fontSize: '13px', padding: '0.2rem 0', minHeight: '36px' }}>Use working days instead</button>
                </div>
              )}
            </div>
          );
        })}
        {draft.conditions.length < MAX_CONDITIONS && (
          <button type="button" onClick={addCond} style={linkBtn}>+ Add {draft.conditions.length ? 'another' : 'a'} condition</button>
        )}
      </div>

      <div style={{ ...row, marginBottom: '0.3rem' }}>
        <label htmlFor="kd-deposit" style={fieldLabel}>Deposit due</label>
        <input id="kd-deposit" type="date" value={draft.deposit} onChange={(e) => set('deposit', e.target.value)} style={dateInput} />
      </div>
      <p style={{ ...small, margin: '0 0 0.2rem' }}>
        {path === 'auction' ? 'At auction the deposit is usually paid on the day.' : 'Often the day you go unconditional. Your agreement says when.'}
      </p>
      {path !== 'auction' && lastCondDate && draft.deposit !== lastCondDate && (
        <button type="button" onClick={() => set('deposit', lastCondDate)} style={{ ...linkBtn, fontSize: '13px', padding: '0.2rem 0', minHeight: '36px' }}>Same day as my last condition ({formatDate(lastCondDate)})</button>
      )}

      <div style={{ ...row, margin: '0.8rem 0 0.3rem' }}>
        <label htmlFor="kd-settlement" style={fieldLabel}>Settlement</label>
        <input id="kd-settlement" type="date" value={draft.settlement} onChange={(e) => setSettlement(e.target.value)} style={dateInput} />
      </div>
      <p style={{ ...small, margin: '0 0 0.8rem' }}>We'll include insurance and signing your loan documents in your settlement reminder.</p>

      <div style={{ ...row, marginBottom: '0.3rem' }}>
        <label htmlFor="kd-inspection" style={fieldLabel}>Pre-settlement inspection</label>
        <input id="kd-inspection" type="date" value={draft.inspection} onChange={(e) => set('inspection', e.target.value)} style={dateInput} />
      </div>
      <p style={{ ...small, margin: '0 0 1rem' }}>
        {draft.settlement
          ? `Usually a day or two before settlement, so there's time to sort anything with your solicitor. We've suggested ${INSPECTION_WORKING_DAYS_BEFORE} working days before; change it to suit.`
          : "Add your settlement date and we'll suggest one. Usually a day or two before settlement."}
      </p>

      {problem && <p role="alert" style={{ margin: '0 0 0.9rem', fontSize: '14px', color: '#B3261E', fontWeight: 600 }}>{problem}</p>}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', alignItems: 'center' }}>
        <button type="submit" style={{ ...primaryBtn, flex: isMobile ? '1 1 100%' : '0 0 auto' }}>Save my dates</button>
        <button type="button" onClick={kd.cancelEditing} style={linkBtn}>Cancel</button>
        {kd.has && <button type="button" onClick={kd.clear} style={{ ...linkBtn, color: C.textSecondary, marginLeft: 'auto' }}>Remove my dates</button>}
      </div>
      <p style={{ ...small, marginTop: '0.8rem' }}>Worked out dates follow the standard ADLS/REINZ agreement. Always check them with your solicitor, as your agreement may differ.</p>
    </form>
  );
}

function downloadIcs(dates) {
  const url = URL.createObjectURL(new Blob([buildIcs(dates)], { type: 'text/calendar;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url; a.download = 'my-key-dates.ics';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function View({ kd, user, isMobile, onSignIn, onNavigate }) {
  const { card, outlineBtn, linkBtn } = styles();
  const today = todayIso();
  const events = keyDateEvents(kd.dates);
  const next = nextEvent(kd.dates, today);
  const days = next ? dayDiff(today, next.date) : null;
  const settled = kd.dates.settlement && kd.dates.settlement < today;
  const nextDetail = next ? groupDetail(next) : '';

  const toggleReminders = () => {
    if (!user) { kd.askForReminders(); onSignIn(); return; }
    kd.setReminders(!kd.reminders);
  };

  return (
    <section aria-label="My key dates" style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.6rem' }}>
        <h2 style={{ margin: 0, fontSize: isMobile ? '19px' : '22px', fontWeight: 700, color: C.navy, display: 'flex', alignItems: 'center', gap: '0.55rem' }}><CalendarIcon colour={C.sky} /> My key dates</h2>
        <button type="button" onClick={kd.startEditing} style={linkBtn}>Edit</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1fr) minmax(0, 1fr)', gap: '0.9rem', alignItems: 'start' }}>
        <div style={{ background: C.sky, color: 'white', borderRadius: '16px', padding: '1.1rem' }}>
          {next ? (
            <>
              <p style={{ margin: '0 0 0.5rem', fontSize: '12px', fontWeight: 700, color: '#E3EEFB', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Coming up</p>
              <p style={{ margin: '0 0 0.4rem', display: 'flex', alignItems: 'baseline', gap: '0.55rem', flexWrap: 'wrap' }}>
                {days > 0 && <span style={{ fontFamily: C.headingFont, fontSize: '44px', fontWeight: 700, lineHeight: 1 }}>{days}</span>}
                <span style={{ fontSize: '16px', fontWeight: 600, lineHeight: 1.35 }}>
                  {days === 0 ? `Today: ${groupUntilText(next)}` : `${days === 1 ? 'day' : 'days'} until ${groupUntilText(next)}`}
                </span>
              </p>
              <p style={{ margin: '0 0 0.8rem', fontSize: '14px', color: '#E3EEFB' }}>{formatDate(next.date)}{nextDetail ? `: ${nextDetail}` : ''}</p>
              <div style={{ background: 'rgba(255,255,255,0.14)', borderRadius: '10px', padding: '0.75rem 0.85rem' }}>
                <p style={{ margin: '0 0 0.4rem', fontSize: '13px', fontWeight: 700 }}>Before then</p>
                <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '14px', lineHeight: 1.5 }}>
                  {groupChecklist(next).map((t) => <li key={t} style={{ marginBottom: '0.2rem' }}>{t}</li>)}
                </ul>
              </div>
            </>
          ) : (
            <p style={{ margin: 0, fontSize: '16px', fontWeight: 600, lineHeight: 1.45 }}>
              {settled ? 'All your key dates have passed. Congratulations on your new home!' : 'No dates coming up. Tap Edit to add the rest of your dates.'}
            </p>
          )}
        </div>

        <div>
          <ol style={{ ...card, listStyle: 'none', margin: '0 0 0.75rem' }}>
            {events.map((g) => {
              const past = g.date < today;
              const isNext = next && g.date === next.date;
              const detail = groupDetail(g);
              return (
                <li key={g.date} style={{ display: 'flex', gap: '0.7rem', padding: '0.45rem 0', alignItems: 'flex-start' }}>
                  <span aria-hidden="true" style={{ width: '12px', height: '12px', borderRadius: '50%', marginTop: '5px', flexShrink: 0, background: past ? '#8494AC' : isNext ? C.red : C.sky }} />
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'block', fontSize: '15px', fontWeight: isNext ? 700 : 500, color: past ? C.textSecondary : C.navy, textDecoration: past ? 'line-through' : 'none' }}>{groupTitle(g)}</span>
                    {detail && <span style={{ display: 'block', fontSize: '13px', color: C.textSecondary }}>{detail}</span>}
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: isNext ? 700 : 500, color: past ? C.textSecondary : C.navy, whiteSpace: 'nowrap' }}>{formatDate(g.date)}</span>
                </li>
              );
            })}
          </ol>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.6rem' }}>
            <button type="button" onClick={() => downloadIcs(kd.dates)} style={outlineBtn}>Add to my calendar</button>
            <button type="button" onClick={toggleReminders} aria-pressed={kd.reminders} style={kd.reminders ? { ...outlineBtn, background: C.sky, color: 'white' } : outlineBtn}>
              Email reminders: {kd.reminders ? 'On' : 'Off'}
            </button>
          </div>
          <p style={{ margin: '0.55rem 0 0', fontSize: '13px', color: C.textSecondary, lineHeight: 1.45 }}>
            {kd.reminders
              ? `We'll email ${user?.email || 'you'} ${REMIND_DAYS} days before each date${kd.dates.preapproval && !kd.dates.accepted ? `, and ${PREAPPROVAL_REMIND_DAYS / 7} weeks before your pre-approval expires` : ''}.`
              : !hasOfferDates(kd.dates)
                ? (user
                  ? `Turn on reminders and we'll email you ${PREAPPROVAL_REMIND_DAYS / 7} weeks before your pre-approval expires.`
                  : `Create a free account to get an email ${PREAPPROVAL_REMIND_DAYS / 7} weeks before your pre-approval expires. Your date is saved on this device for now.`)
                : user
                  ? `Turn on reminders and we'll email you ${REMIND_DAYS} days before each date.`
                  : `Create a free account to get an email ${REMIND_DAYS} days before each date. Your dates are saved on this device for now.`}
          </p>
          {kd.error && <p role="alert" style={{ margin: '0.5rem 0 0', fontSize: '14px', color: '#B3261E', fontWeight: 600 }}>{kd.error}</p>}
        </div>
      </div>

      <p style={{ margin: '0.75rem 0 0', fontSize: '13px', color: C.textSecondary, lineHeight: 1.45 }}>
        {hasOfferDates(kd.dates) ? 'These are the dates you entered, so always confirm them with your solicitor.' : 'Your approval letter has the exact expiry date. Once an offer is accepted, tap Edit to add the rest of your dates.'}{' '}
        {!settled && (
          <>Finance not sorted yet?{' '}
            <a href="/first-home-playbook/book-a-call" onClick={(e) => { if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return; e.preventDefault(); onNavigate('/book-a-call'); }} style={{ color: C.accent, fontWeight: 600 }}>Book a call</a>
          </>
        )}
      </p>
    </section>
  );
}

// The editor while adding or changing dates, otherwise the countdown and timeline
export function KeyDatesPanel({ kd, user, path, isMobile, onSignIn, onNavigate }) {
  const ref = useRef(null);
  useEffect(() => {
    // After saving, bring the countdown into view (it sits above the stage they were in)
    if (kd.justSaved && !kd.editing && kd.has && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      kd.clearJustSaved();
    }
  }, [kd.justSaved, kd.editing, kd.has]);
  useEffect(() => {
    // Opening the editor when it sits at the top of the page: bring it into view
    if (kd.editing && ref.current) ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [kd.editing]);
  if (!kd.loaded) return null;
  if (kd.editing) return <div ref={ref} style={{ scrollMarginTop: '80px' }}><Editor kd={kd} path={path} isMobile={isMobile} /></div>;
  if (!kd.has) return null;
  return <div ref={ref} style={{ scrollMarginTop: '80px' }}><View kd={kd} user={user} isMobile={isMobile} onSignIn={onSignIn} onNavigate={onNavigate} /></div>;
}
