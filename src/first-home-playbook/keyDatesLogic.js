// Key dates (offer accepted through to settlement): the shared rules used by
// the Journey page and by the daily reminder email job (api/key-date-reminders.js).
// No React in here, so the server can import it too.
//
// Only dates and short labels are stored. No address, price or other detail.

export const KEY_DATES_LS_KEY = 'fhp_key_dates_v1';
export const REMIND_DAYS = 3; // email goes out this many days before a date
// A pre-approval running out needs more notice, so there's time to renew it
export const PREAPPROVAL_REMIND_DAYS = 14;
// Suggested pre-settlement inspection: this many working days before settlement
export const INSPECTION_WORKING_DAYS_BEFORE = 2;
export const MAX_CONDITIONS = 8;
export const MAX_LABEL = 40;
export const DEFAULT_CONDITIONS = ['Finance', 'Building report', 'LIM'];
export const DEFAULT_WORKING_DAYS = 10;
export const MAX_WORKING_DAYS = 60;

const ISO = /^\d{4}-\d{2}-\d{2}$/;
const DAY_MS = 86400000;

export function isIsoDate(s) {
  if (typeof s !== 'string' || !ISO.test(s)) return false;
  const t = Date.parse(`${s}T00:00:00Z`);
  return !Number.isNaN(t) && new Date(t).toISOString().slice(0, 10) === s;
}

const cleanDate = (s) => (isIsoDate(s) ? s : '');
const cleanDays = (n) => (Number.isInteger(n) && n >= 1 && n <= MAX_WORKING_DAYS ? n : null);
const cleanLabel = (s) => String(s ?? '').replace(/[\r\n\t]+/g, ' ').trim().slice(0, MAX_LABEL);

// ---------------------------------------------------------------------------
// NZ working days, as defined in the standard ADLS/REINZ Agreement for Sale
// and Purchase of Real Estate. A working day is any day other than:
//   - Saturday, Sunday, Waitangi Day, Good Friday, Easter Monday, Anzac Day,
//     the Sovereign's Birthday and Labour Day
//   - the Monday after Waitangi Day or Anzac Day when they fall on a weekend
//   - 24 December to 5 January inclusive (to 15 January for the LIM condition)
//   - the anniversary day of the province the property is in
//   - Matariki
// Christmas, Boxing Day and New Year all sit inside the 24 Dec to 5 Jan break.
// ---------------------------------------------------------------------------

// Matariki is set by law (Te Kāhui o Matariki Public Holiday Act 2022,
// Schedule 1). Always a Friday. Dates after 2052 haven't been set yet.
const MATARIKI = {
  2022: '06-24', 2023: '07-14', 2024: '06-28', 2025: '06-20', 2026: '07-10', 2027: '06-25',
  2028: '07-14', 2029: '07-06', 2030: '06-21', 2031: '07-11', 2032: '07-02', 2033: '06-24',
  2034: '07-07', 2035: '06-29', 2036: '07-18', 2037: '07-10', 2038: '06-25', 2039: '07-15',
  2040: '07-06', 2041: '07-19', 2042: '07-11', 2043: '07-03', 2044: '06-24', 2045: '07-07',
  2046: '06-29', 2047: '07-19', 2048: '07-03', 2049: '06-25', 2050: '07-15', 2051: '06-30',
  2052: '06-21',
};

// Provinces for anniversary days, with the regions usually included in each
// (as listed on govt.nz). Rules follow Employment New Zealand.
export const PROVINCES = [
  { id: 'auckland', label: 'Auckland, Northland, Waikato, Bay of Plenty or Gisborne' },
  { id: 'wellington', label: 'Wellington, Manawatū or Whanganui' },
  { id: 'hawkes-bay', label: "Hawke's Bay" },
  { id: 'taranaki', label: 'Taranaki' },
  { id: 'nelson', label: 'Nelson, Tasman or Buller' },
  { id: 'marlborough', label: 'Marlborough' },
  { id: 'westland', label: 'Westland' },
  { id: 'canterbury', label: 'Canterbury (Christchurch and north)' },
  { id: 'south-canterbury', label: 'South Canterbury' },
  { id: 'otago', label: 'Otago' },
  { id: 'southland', label: 'Southland' },
  { id: 'chatham', label: 'Chatham Islands' },
];
export const DEFAULT_PROVINCE = 'auckland';
const PROVINCE_IDS = new Set(PROVINCES.map((p) => p.id));

const toIso = (y, m, d) => new Date(Date.UTC(y, m - 1, d)).toISOString().slice(0, 10);
const dow = (iso) => new Date(`${iso}T00:00:00Z`).getUTCDay(); // 0 Sunday ... 6 Saturday
export function addDays(iso, n) { return new Date(Date.parse(`${iso}T00:00:00Z`) + n * DAY_MS).toISOString().slice(0, 10); }

// Easter Sunday (Gregorian calendar)
function easterSunday(y) {
  const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4;
  const f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31), day = ((h + l - 7 * m + 114) % 31) + 1;
  return toIso(y, month, day);
}
// The nth given weekday of a month (n = 1 is the first)
function nthWeekday(y, m, weekday, n) {
  const first = toIso(y, m, 1);
  return addDays(first, ((weekday - dow(first) + 7) % 7) + (n - 1) * 7);
}
// The Monday closest to a date (Tue to Thu go back, Fri to Sun go forward)
function mondayNearest(y, m, d) {
  const iso = toIso(y, m, d);
  const shift = [1, 0, -1, -2, -3, 3, 2][dow(iso)];
  return addDays(iso, shift);
}
const mondayised = (iso) => (dow(iso) === 6 ? addDays(iso, 2) : dow(iso) === 0 ? addDays(iso, 1) : null);

export function anniversaryDay(province, y) {
  const labour = nthWeekday(y, 10, 1, 4);
  switch (province) {
    case 'wellington': return mondayNearest(y, 1, 22);
    case 'auckland': return mondayNearest(y, 1, 29);
    case 'nelson': return mondayNearest(y, 2, 1);
    case 'taranaki': return nthWeekday(y, 3, 1, 2);
    case 'otago': {
      const day = mondayNearest(y, 3, 23);
      return day === addDays(easterSunday(y), 1) ? addDays(day, 1) : day; // clashes with Easter Monday: the Tuesday
    }
    case 'southland': return addDays(easterSunday(y), 2); // Easter Tuesday
    case 'south-canterbury': return nthWeekday(y, 9, 1, 4);
    case 'hawkes-bay': return addDays(labour, -3); // Friday before Labour Day
    case 'marlborough': return addDays(labour, 7); // first Monday after Labour Day
    case 'canterbury': return addDays(nthWeekday(y, 11, 2, 1), 10); // second Friday after the first Tuesday in November
    case 'westland': return mondayNearest(y, 12, 1);
    case 'chatham': return mondayNearest(y, 11, 30);
    default: return null;
  }
}

const holidayCache = new Map();
// Every non-working day in a year that isn't a weekend or the Christmas break
export function nzHolidays(y, province) {
  const key = `${y}|${province}`;
  if (holidayCache.has(key)) return holidayCache.get(key);
  const easter = easterSunday(y);
  const waitangi = toIso(y, 2, 6), anzac = toIso(y, 4, 25);
  const days = [
    waitangi, mondayised(waitangi),
    addDays(easter, -2), addDays(easter, 1),
    anzac, mondayised(anzac),
    nthWeekday(y, 6, 1, 1), // Sovereign's (King's) Birthday
    nthWeekday(y, 10, 1, 4), // Labour Day
    MATARIKI[y] ? `${y}-${MATARIKI[y]}` : null,
    anniversaryDay(province, y),
  ].filter(Boolean);
  const set = new Set(days);
  holidayCache.set(key, set);
  return set;
}

// lim: the LIM condition's Christmas break runs to 15 January, not 5 January
export function isWorkingDay(iso, province = DEFAULT_PROVINCE, { lim = false } = {}) {
  const wd = dow(iso);
  if (wd === 0 || wd === 6) return false;
  const [y, m, d] = iso.split('-').map(Number);
  if ((m === 12 && d >= 24) || (m === 1 && d <= (lim ? 15 : 5))) return false;
  return !nzHolidays(y, province).has(iso);
}

// "n working days after" a date: counting starts the next working day
export function addWorkingDays(iso, n, province = DEFAULT_PROVINCE, opts) {
  if (!isIsoDate(iso) || !Number.isInteger(n) || n < 1) return '';
  let d = iso;
  let count = 0;
  while (count < n) {
    d = addDays(d, 1);
    if (isWorkingDay(d, province, opts)) count += 1;
  }
  return d;
}

// The working day n working days before a date (counting back from the day before)
export function workingDaysBefore(iso, n, province = DEFAULT_PROVINCE) {
  if (!isIsoDate(iso) || !Number.isInteger(n) || n < 1) return '';
  let d = iso;
  let count = 0;
  while (count < n) {
    d = addDays(d, -1);
    if (isWorkingDay(d, province)) count += 1;
  }
  return d;
}

export const isLimCondition = (label) => /\blim\b/i.test(String(label || ''));

// Works out each condition's date from its number of working days
export function withCalculatedDates(dates) {
  const d = normaliseKeyDates(dates);
  if (!d.accepted) return d;
  return {
    ...d,
    conditions: d.conditions.map((c) => (c.days
      ? { ...c, date: addWorkingDays(d.accepted, c.days, d.province, { lim: isLimCondition(c.label) }) }
      : c)),
  };
}

export function emptyKeyDates(path) {
  return {
    accepted: '',
    province: DEFAULT_PROVINCE,
    conditions: path === 'auction' ? [] : DEFAULT_CONDITIONS.map((label) => ({ label, days: DEFAULT_WORKING_DAYS, date: '' })),
    deposit: '',
    inspection: '',
    settlement: '',
    preapproval: '',
  };
}

// Makes whatever was saved (or sent to us) safe to use
export function normaliseKeyDates(raw) {
  const r = raw && typeof raw === 'object' ? raw : {};
  const conditions = Array.isArray(r.conditions)
    ? r.conditions.slice(0, MAX_CONDITIONS)
        .map((c) => ({ label: cleanLabel(c?.label), days: cleanDays(c?.days), date: cleanDate(c?.date) }))
        .filter((c) => c.label || c.date || c.days)
    : [];
  return {
    accepted: cleanDate(r.accepted),
    province: PROVINCE_IDS.has(r.province) ? r.province : DEFAULT_PROVINCE,
    conditions,
    deposit: cleanDate(r.deposit),
    inspection: cleanDate(r.inspection),
    settlement: cleanDate(r.settlement),
    preapproval: cleanDate(r.preapproval),
  };
}

export function hasAnyDate(d) {
  return !!(d && (hasOfferDates(d) || d.preapproval));
}

// Dates from an accepted offer onwards (everything except the pre-approval)
export function hasOfferDates(d) {
  return !!(d && (d.accepted || d.deposit || d.inspection || d.settlement || (d.conditions || []).some((c) => c.date)));
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
  // Once an offer is accepted the pre-approval has done its job
  if (d.preapproval && !d.accepted) all.push({ date: d.preapproval, type: 'preapproval', label: 'Pre-approval expires' });
  if (d.accepted) all.push({ date: d.accepted, type: 'accepted', label: 'Offer accepted' });
  d.conditions.forEach((c) => { if (c.date) all.push({ date: c.date, type: 'condition', label: c.label || 'Condition' }); });
  if (d.deposit) all.push({ date: d.deposit, type: 'deposit', label: 'Deposit due' });
  if (d.inspection) all.push({ date: d.inspection, type: 'inspection', label: 'Pre-settlement inspection' });
  if (d.settlement) all.push({ date: d.settlement, type: 'settlement', label: 'Settlement and keys' });
  const order = { preapproval: -1, accepted: 0, condition: 1, deposit: 2, inspection: 3, settlement: 4 };
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
  if (group.items.some((i) => i.type === 'preapproval')) parts.push('Pre-approval expires');
  if (group.items.some((i) => i.type === 'accepted')) parts.push('Offer accepted');
  if (conds.length === 1) parts.push(`${conds[0].label} due`);
  if (conds.length > 1) parts.push('Conditions due');
  if (group.items.some((i) => i.type === 'deposit')) parts.push('Deposit due');
  if (group.items.some((i) => i.type === 'inspection')) parts.push('Pre-settlement inspection');
  if (group.items.some((i) => i.type === 'settlement')) parts.push('Settlement and keys');
  return parts.join(', ');
}

// Reads after "3 days until ...", e.g. "your conditions are due"
export function groupUntilText(group) {
  const parts = [];
  const conds = group.items.filter((i) => i.type === 'condition');
  if (group.items.some((i) => i.type === 'preapproval')) parts.push('your pre-approval expires');
  if (conds.length === 1) parts.push(`your ${lowerFirst(conds[0].label)} condition is due`);
  if (conds.length > 1) parts.push('your conditions are due');
  if (group.items.some((i) => i.type === 'deposit')) parts.push('your deposit is due');
  if (group.items.some((i) => i.type === 'inspection')) parts.push('your pre-settlement inspection');
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
    if (i.type === 'preapproval') {
      out.push('Talk to your mortgage adviser or bank about renewing your pre-approval');
      out.push('Have your latest payslips and bank statements ready, as the bank may want updated ones');
      out.push('Let them know about any changes to your income, debts or deposit');
    }
    if (i.type === 'condition') {
      const l = i.label.toLowerCase();
      if (l === 'finance') {
        out.push('Confirm your finance is approved');
        out.push('Check you can get house insurance for the property, as the bank needs it in place');
      }
      else if (l === 'building report') out.push('Read your building report and raise any concerns with your solicitor');
      else if (l === 'lim') out.push('Check your solicitor has reviewed the LIM');
      else out.push(`Check your ${lowerFirst(i.label)} condition is sorted`);
    }
    if (i.type === 'deposit') out.push('Have your deposit ready, and ask your solicitor how to pay it');
    if (i.type === 'inspection') {
      out.push('Book a time with the agent and take your agreement or a list of the chattels');
      out.push('Check the chattels are there and working: oven, hob, heat pumps, dishwasher, lights');
      out.push('Run the taps and shower, flush the toilets, and check the hot water');
      out.push('Open and lock the windows and doors, and look for any new damage');
      out.push('Check anything the seller agreed to fix has been done, and rubbish is gone');
      out.push('Tell your solicitor straight away if anything is wrong');
    }
    if (i.type === 'settlement') {
      out.push('Sign your loan documents with your solicitor');
      out.push('Make sure your insurance starts on settlement day');
      if (!group.items.some((x) => x.type === 'inspection')) out.push('Do your pre-settlement inspection, if you have not already');
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

// How many days ahead a day's reminder goes out
export const remindDaysFor = (group) => (group.items.some((i) => i.type === 'preapproval') ? PREAPPROVAL_REMIND_DAYS : REMIND_DAYS);

// Reminder emails to send today: anything due within its reminder window
// (3 days, or 14 for a pre-approval) that hasn't had one yet. Normally that's
// exactly 3 (or 14) days out; the window also catches dates added late or a
// day the job didn't run.
export function dueReminders(dates, sent, today) {
  const done = sent && typeof sent === 'object' ? sent : {};
  return keyDateEvents(dates)
    .filter(actionable)
    .map((g) => ({ ...g, daysAway: dayDiff(today, g.date) }))
    .filter((g) => g.daysAway >= 1 && g.daysAway <= remindDaysFor(g) && !done[g.date]);
}

// A calendar file (.ics) with each day as an all-day event and an alert at
// 9am three days before (14 days before a pre-approval runs out)
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
      'BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${esc(`${title} in ${remindDaysFor(g)} days`)}`, `TRIGGER:-P${remindDaysFor(g) - 1}DT15H`, 'END:VALARM',
      'END:VEVENT',
    );
  });
  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}
