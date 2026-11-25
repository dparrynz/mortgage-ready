// Vercel cron job (see "crons" in vercel.json). Runs once a day and emails a
// reminder to anyone with a key date coming up in 3 days, if they turned
// reminders on in the Journey page.
//
// Environment variables (Vercel project -> Settings -> Environment Variables):
//   RESEND_API_KEY     required. Same key the enquiry form uses.
//   REMINDERS_SECRET   required. Its hash is stored in Supabase (see
//                      supabase/key_dates.sql); without it the database
//                      refuses to hand over anything.
//   CRON_SECRET        optional. When set, only Vercel's own cron call is
//                      accepted.
//
// It never holds a master database key. It can only read the email and dates
// of people with reminders on, and tick a reminder off as sent.

import { normaliseKeyDates, dueReminders, todayIso, formatDate, groupTitle, groupDetail, groupChecklist, groupUntilText } from '../src/first-home-playbook/keyDatesLogic.js';

const SUPABASE_URL = 'https://cpwbixddgcyingntsxci.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwd2JpeGRkZ2N5aW5nbnRzeGNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYwNjgzMjksImV4cCI6MjEwMTY0NDMyOX0.-K5k0pyWV_piJCdcwQUiAzUND-PM35VOXSZSaBSbP6g';
const FROM = 'First Home Playbook <noreply@parryfs.com>';
const REPLY_TO = 'dan@parryfs.com';
const JOURNEY_URL = 'https://www.parryfs.com/first-home-playbook/journey?utm_source=reminder&utm_medium=email&utm_campaign=key_dates';
const TIME_ZONE = 'Pacific/Auckland';
const MAX_EMAILS_PER_RUN = 90; // stays inside Resend's free daily allowance

const escapeHtml = (str) => String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const oneLine = (str) => String(str).replace(/[\r\n]+/g, ' ').trim();

async function rpc(name, args) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`, {
    method: 'POST',
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
  });
  if (!r.ok) throw new Error(`${name} failed: ${r.status}`);
  return r.status === 204 ? null : r.json().catch(() => null);
}

const awayText = (n) => (n === 1 ? "That's tomorrow." : `That's ${n} days away.`);

export function subjectFor(group, firstName) {
  const day = formatDate(group.date, 'long').split(' ')[0]; // "Monday"
  const types = new Set(group.items.map((i) => i.type));
  types.delete('accepted');
  let s;
  if (types.size > 1) s = `you have key dates coming up ${day}`;
  else if (types.has('settlement')) s = `settlement day is ${day}`;
  else if (types.has('deposit')) s = `your deposit is due ${day}`;
  else if (types.has('preapproval')) s = `your pre-approval expires ${day}`;
  else if (types.has('inspection')) s = `your pre-settlement inspection is ${day}`;
  else s = `${groupUntilText(group)} ${day}`;
  const name = oneLine(firstName || '').slice(0, 40);
  return name ? `${name}, ${s}` : s[0].toUpperCase() + s.slice(1);
}

export function emailFor(group, firstName) {
  const name = oneLine(firstName || '').slice(0, 40);
  const hello = name ? `Hi ${escapeHtml(name)},` : 'Hi there,';
  const detail = groupDetail(group);
  const what = escapeHtml(detail ? `${groupTitle(group)} (${detail})` : groupTitle(group));
  const when = escapeHtml(formatDate(group.date, 'long'));
  const todo = groupChecklist(group).map((t) => `<li style="margin:0 0 6px">${escapeHtml(t)}</li>`).join('');
  const isSettlement = group.items.some((i) => i.type === 'settlement' || i.type === 'inspection');
  const isPreapproval = group.items.every((i) => i.type === 'preapproval');
  const advice = isPreapproval
    ? "Renewing usually means sending the bank updated payslips and statements, so it's worth starting now rather than when you find the right home."
    : isSettlement
    ? 'If anything looks like it might not be ready in time, talk to your solicitor now.'
    : "If anything isn't sorted, talk to your solicitor now. It's much easier to extend a date before it passes.";
  const p = 'margin:0 0 16px;font-size:16px;line-height:1.55;color:#0F1E3A';
  const html = `<!doctype html><html lang="en"><body style="margin:0;padding:0;background:#EEF2F8;font-family:Inter,-apple-system,'Segoe UI',Arial,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EEF2F8"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#FFFFFF;border-radius:14px;overflow:hidden">
<tr><td style="background:#1572D3;padding:14px 24px;color:#FFFFFF;font-weight:700;font-size:16px">First Home Playbook</td></tr>
<tr><td style="padding:24px">
<p style="${p}">${hello}</p>
<p style="${p}">A date you saved is coming up: <strong>${what}</strong> on <strong>${when}</strong>. ${awayText(group.daysAway)}</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F3F7FD;border-radius:10px;margin:0 0 16px"><tr><td style="padding:14px 16px">
<p style="margin:0 0 8px;font-size:15px;font-weight:700;color:#0F1E3A">Before then</p>
<ul style="margin:0;padding-left:20px;font-size:15px;line-height:1.5;color:#0F1E3A">${todo}</ul>
</td></tr></table>
<p style="${p}">${advice}</p>
<p style="margin:0 0 20px"><a href="${JOURNEY_URL}" style="display:inline-block;background:#D93A25;color:#FFFFFF;text-decoration:none;font-weight:600;font-size:16px;padding:13px 20px;border-radius:10px">See my key dates</a></p>
<p style="margin:0;font-size:13px;line-height:1.5;color:#5C6B85">This reminder uses the dates you entered, so always confirm them with your solicitor. You're getting it because you turned on reminders in the First Home Playbook. To stop them, open <a href="${JOURNEY_URL}" style="color:#1572D3">your key dates</a> and turn reminders off.</p>
</td></tr></table>
</td></tr></table>
</body></html>`;
  const text = `${name ? `Hi ${name},` : 'Hi there,'}

A date you saved is coming up: ${detail ? `${groupTitle(group)} (${detail})` : groupTitle(group)} on ${formatDate(group.date, 'long')}. ${awayText(group.daysAway)}

Before then:
${groupChecklist(group).map((t) => `- ${t}`).join('\n')}

${advice}

See my key dates: ${JOURNEY_URL}

This reminder uses the dates you entered, so always confirm them with your solicitor. To stop reminders, open your key dates and turn them off.`;
  return { html, text };
}

export default async function handler(req, res) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && req.headers.authorization !== `Bearer ${cronSecret}`) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  // Ignore spaces, line breaks or quote marks picked up when the value was copied
  const secret = (process.env.REMINDERS_SECRET || '').trim().replace(/^["'`]+|["'`]+$/g, '').trim();
  const apiKey = process.env.RESEND_API_KEY;
  if (!secret || !apiKey) {
    res.status(500).json({ error: 'Reminders not configured' });
    return;
  }

  let rows;
  try {
    rows = await rpc('key_date_reminders_due', { p_secret: secret });
  } catch (e) {
    // Safe to log: the secret's length and the start of its hash, never the secret
    const { createHash } = await import('node:crypto');
    console.error('Could not load reminders', e.message, `secret length ${secret.length}, hash starts ${createHash('sha256').update(secret, 'utf8').digest('hex').slice(0, 6)}`);
    res.status(502).json({ error: 'Could not load reminders' });
    return;
  }

  const today = todayIso(TIME_ZONE);
  let sent = 0;
  let failed = 0;
  for (const row of Array.isArray(rows) ? rows : []) {
    for (const group of dueReminders(normaliseKeyDates(row.dates), row.sent, today)) {
      if (sent >= MAX_EMAILS_PER_RUN) break;
      try {
        const { html, text } = emailFor(group, row.first_name);
        const r = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            // If ticking it off fails below, tomorrow's run can't send it twice
            'Idempotency-Key': `key-date/${row.user_id}/${group.date}`,
          },
          body: JSON.stringify({ from: FROM, to: [row.email], reply_to: REPLY_TO, subject: subjectFor(group, row.first_name), html, text }),
        });
        if (!r.ok) {
          failed += 1;
          console.error('Resend error', r.status, await r.text());
          continue;
        }
        sent += 1;
        await rpc('key_date_reminder_mark_sent', { p_secret: secret, p_user: row.user_id, p_key: group.date });
      } catch (e) {
        failed += 1;
        console.error('Reminder failed', e.message);
      }
    }
  }
  res.status(200).json({ ok: true, sent, failed, at: new Date().toISOString() });
}
