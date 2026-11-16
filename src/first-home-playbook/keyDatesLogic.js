// Key dates (offer accepted through to settlement): the shared rules used by
// the Journey page and by the daily reminder email job (api/key-date-reminders.js).
// No React in here, so the server can import it too.
//
// Only dates and short labels are stored. No address, price or other detail.

export const KEY_DATES_LS_KEY = 'fhp_key_dates_v1';
export const REMIND_DAYS = 3; // email goes out this many days before a date
export const MAX_CONDITIONS = 8;
export const MAX_LABEL = 40;
export const DEFAULT_CONDITIONS = ['Finance', 'Building report', 'LIM'];

const ISO = /^\d{4}-\d{2}-\d{2}$/;
const DAY_MS = 86400000;

export function isIsoDate(s) {
  if (typeof s !== 'string' || !ISO.test(s)) return false;
  const t = Date.parse(`${s}T00:00:00Z`);
  return !Number.isNaN(t) && new Date(t).toISOString().slice(0, 10) === s;
}

const cleanDate = (s) => (isIsoDate(s) ? s : '');
const cleanLabel = (s) => String(s ?? '').replace(/[\r\n\t]+/g, ' ').trim().slice(0, MAX_LABEL);

export function emptyKeyDates(path) {
  return {
    accepted: '',
    conditions: path === 'auction' ? [] : DEFAULT_CONDITIONS.map((label) => ({ label, date: '' })),
    deposit: '',
    settlement: '',
  };
}

// Makes whatever was saved (or sent to us) safe to use
export function normaliseKeyDates(raw) {
  const r = raw && typeof raw === 'object' ? raw : {};
  const conditions = Array.isArray(r.conditions)
    ? r.conditions.slice(0, MAX_CONDITIONS)
        .map((c) => ({ label: cleanLabel(c?.label), date: cleanDate(c?.date) }))
        .filter((c) => c.label || c.date)
    : [];
  return { accepted: cleanDate(r.accepted), conditions, deposit: cleanDate(r.deposit), settlement: cleanDate(r.settlement) };
}

export function hasAnyDate(d) {
  return !!(d && (d.accepted || d.deposit || d.settlement || (d.conditions || []).some((c) => c.date)));
}

// Whole days from one date to another (both "YYYY-MM-DD")
export function dayDiff(fromIso, toIso) {
  return Math.round((Date.parse(`${toIso}T00:00:00Z`) - Date.parse(`${fromIso}T00:00:00Z`)) / DAY_MS);
}

// Today's date in a given time zone, or the device's own when none is given
export function todayIso(timeZone) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
  const get = (t) => parts.find((p) => p.type === t).value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}

export function formatDate(iso, style = 'short') {
  const opts = style === 'long'
    ? { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' }
    : { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' };
  // "Mon 7 Dec" / "Monday 7 December" (some devices add a comma after the day)
  return new Intl.DateTimeFormat('en-NZ', opts).format(new Date(`${iso}T00:00:00Z`)).replace(/,/g, '');
}

const joinList = (xs) => (xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);
// "Finance" -> "finance", but "LIM" stays "LIM"
const lowerFirst = (s) => (s && s[0] === s[0].toUpperCase() && s.slice(1) === s.slice(1).toLowerCase() ? s[0].toLowerCase() + s.slice(1) : s);

// Everything in date order, with things that fall on the same day grouped
// together: [{ date, items: [{ type, label }] }]
export function keyDateEvents(dates) {
  const d = normaliseKeyDates(dates);
  const all = [];
  if (d.accepted) all.push({ date: d.accepted, type: 'accepted', label: 'Offer accepted' });
  d.conditions.forEach((c) => { if (c.date) all.push({ date: c.date, type: 'condition', label: c.label || 'Condition' }); });
  if (d.deposit) all.push({ date: d.deposit, type: 'deposit', label: 'Deposit due' });
  if (d.settlement) all.push({ date: d.settlement, type: 'settlement', label: 'Settlement and keys' });
  const order = { accepted: 0, condition: 1, deposit: 2, settlement: 3 };
  all.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : order[a.type] - order[b.type]));
  const groups = [];
  all.forEach((e) => {
    const last = groups[groups.length - 1];
    if (last && last.date === e.date) last.items.push({ type: e.type, label: e.label });
    else groups.push({ date: e.date, items: [{ type: e.type, label: e.label }] });
  });
  return groups;
}

// Short name for a day's events, e.g. "Conditions due" or "Settlement and keys"
export function groupTitle(group) {
  const parts = [];
  const conds = group.items.filter((i) => i.type === 'condition');
  if (group.items.some((i) => i.type === 'accepted')) parts.push('Offer accepted');
  if (conds.length === 1) parts.push(`${conds[0].label} due`);
  if (conds.length > 1) parts.push('Conditions due');
  if (group.items.some((i) => i.type === 'deposit')) parts.push('Deposit due');
  if (group.items.some((i) => i.type === 'settlement')) parts.push('Settlement and keys');
  return parts.join(', ');
}

// Reads after "3 days until ...", e.g. "your conditions are due"
export function groupUntilText(group) {
  const parts = [];
  const conds = group.items.filter((i) => i.type === 'condition');
  if (conds.length === 1) parts.push(`your ${lowerFirst(conds[0].label)} condition is due`);
  if (conds.length > 1) parts.push('your conditions are due');
  if (group.items.some((i) => i.type === 'deposit')) parts.push('your deposit is due');
  if (group.items.some((i) => i.type === 'settlement')) parts.push('settlement day');
  return joinList(parts);
}

// One line saying what falls on the day, e.g. "Finance, building report and LIM"
export function groupDetail(group) {
  const conds = group.items.filter((i) => i.type === 'condition');
  return conds.length > 1 ? joinList(conds.map((c, i) => (i === 0 ? c.label : lowerFirst(c.label)))) : '';
}

// What to have sorted before the day
export function groupChecklist(group) {
  const out = [];
  group.items.forEach((i) => {
    if (i.type === 'condition') {
      const l = i.label.toLowerCase();
      if (l === 'finance') out.push('Confirm your finance is approved');
      else if (l === 'building report') out.push('Read your building report and raise any concerns with your solicitor');
      else if (l === 'lim') out.push('Check your solicitor has reviewed the LIM');
      else out.push(`Check your ${lowerFirst(i.label)} condition is sorted`);
    }
    if (i.type === 'deposit') out.push('Have your deposit ready, and ask your solicitor how to pay it');
    if (i.type === 'settlement') {
      out.push('Sign your loan documents with your solicitor');
      out.push('Make sure your insurance starts on settlement day');
      out.push('Do your pre-settlement inspection');
      out.push("If you're using KiwiSaver, check with your solicitor that it has come through");
    }
  });
  return out;
}

// Days with something still to do (so not "offer accepted" on its own)
const actionable = (g) => g.items.some((i) => i.type !== 'accepted');

// The next day with something due, from today on
export function nextEvent(dates, today) {
  return keyDateEvents(dates).find((g) => actionable(g) && g.date >= today) || null;
}

// Reminder emails to send today: anything due in the next REMIND_DAYS days
// that hasn't had one yet. Normally that's exactly 3 days out; the window
// also catches dates added late or a day the job didn't run.
export function dueReminders(dates, sent, today) {
  const done = sent && typeof sent === 'object' ? sent : {};
  return keyDateEvents(dates)
    .filter(actionable)
    .map((g) => ({ ...g, daysAway: dayDiff(today, g.date) }))
    .filter((g) => g.daysAway >= 1 && g.daysAway <= REMIND_DAYS && !done[g.date]);
}

// A calendar file (.ics) with each day as an all-day event and an alert at
// 9am three days before
export function buildIcs(dates) {
  const esc = (s) => String(s).replace(/\\/g, '\\\\').replace(/;/g, '\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
  const compact = (iso) => iso.replace(/-/g, '');
  const nextDay = (iso) => new Date(Date.parse(`${iso}T00:00:00Z`) + DAY_MS).toISOString().slice(0, 10);
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//First Home Playbook//Key dates//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH'];
  keyDateEvents(dates).filter(actionable).forEach((g) => {
    const detail = groupDetail(g);
    const title = detail ? `${groupTitle(g)}: ${detail}` : groupTitle(g);
    const todo = groupChecklist(g).map((t) => `- ${t}`).join('\n');
    lines.push(
      'BEGIN:VEVENT',
      `UID:fhp-${compact(g.date)}@parryfs.com`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${compact(g.date)}`,
      `DTEND;VALUE=DATE:${compact(nextDay(g.date))}`,
      `SUMMARY:${esc(title)}`,
      `DESCRIPTION:${esc(`Before this date:\n${todo}\n\nAlways confirm your dates with your solicitor.\nhttps://www.parryfs.com/first-home-playbook/journey`)}`,
      'TRANSP:TRANSPARENT',
      'BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${esc(`${title} in ${REMIND_DAYS} days`)}`, `TRIGGER:-P${REMIND_DAYS - 1}DT15H`, 'END:VALARM',
      'END:VEVENT',
    );
  });
  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}
