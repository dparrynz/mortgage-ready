// Vercel serverless function. Sends a plain notification email to Dan when
// someone submits the First Home Playbook contact form — no automation
// beyond the notification, Dan follows up manually (per the build brief).
//
// Environment variables (Vercel project -> Settings -> Environment Variables):
//   RESEND_API_KEY        required. "From" address must be on a domain verified in Resend.
//   TURNSTILE_SECRET_KEY  Cloudflare Turnstile secret for the site key used on the
//                         form. When set, every submission must pass the bot check.

const NOTIFY_TO = 'dparry@mikepero.co.nz';
const FROM = 'First Home Playbook <noreply@parryfs.com>';
const ALLOWED_ORIGINS = ['https://parryfs.com', 'https://www.parryfs.com'];

const LIMITS = { name: 100, phone: 40, email: 200, bestTime: 200, comment: 2000 };
const EMAIL_RE = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// Strip line breaks from anything that ends up in an email header
const oneLine = (str) => String(str).replace(/[\r\n]+/g, ' ').trim();

function originAllowed(req) {
  const origin = req.headers.origin;
  if (!origin) return true; // some browsers omit it on same-origin requests
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  // Vercel preview deployments of this project
  return /^https:\/\/mortgage-ready[a-z0-9-]*\.vercel\.app$/.test(origin) || /^http:\/\/localhost(:\d+)?$/.test(origin);
}

async function verifyTurnstile(token, ip) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // not configured yet; the honeypot still applies
  if (!token) return false;
  const body = new URLSearchParams({ secret, response: token });
  if (ip) body.append('remoteip', ip);
  try {
    const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body });
    const data = await r.json();
    return data.success === true;
  } catch (e) {
    return false;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  if (!originAllowed(req)) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const { name, phone, email, bestTime, comment, website, turnstileToken } = body;

  // Honeypot: a hidden field real people never see or fill in. Pretend success
  // so bots don't learn they were caught.
  if (website) {
    res.status(200).json({ ok: true });
    return;
  }

  if (!name || !phone || !email || typeof name !== 'string' || typeof phone !== 'string' || typeof email !== 'string') {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }
  const fields = { name, phone, email, bestTime: bestTime || '', comment: comment || '' };
  for (const [k, max] of Object.entries(LIMITS)) {
    if (typeof fields[k] !== 'string' || fields[k].length > max) {
      res.status(400).json({ error: 'Invalid input' });
      return;
    }
  }
  if (!EMAIL_RE.test(email.trim())) {
    res.status(400).json({ error: 'Invalid email' });
    return;
  }

  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  if (!(await verifyTurnstile(turnstileToken, ip))) {
    res.status(400).json({ error: 'Verification failed' });
    return;
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'Email service not configured' });
    return;
  }

  const html = `
    <h2>New First Home Playbook enquiry</h2>
    <p><strong>Name:</strong> ${escapeHtml(fields.name)}</p>
    <p><strong>Phone:</strong> ${escapeHtml(fields.phone)}</p>
    <p><strong>Email:</strong> ${escapeHtml(fields.email)}</p>
    <p><strong>Best time to contact:</strong> ${escapeHtml(fields.bestTime || 'Not specified')}</p>
    <p><strong>Comment:</strong> ${escapeHtml(fields.comment || 'None')}</p>
  `.trim();

  try {
    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: FROM,
        to: [NOTIFY_TO],
        reply_to: oneLine(fields.email),
        subject: `New First Home Playbook enquiry: ${oneLine(fields.name)}`,
        html,
      }),
    });

    if (!resendRes.ok) {
      // Log the detail for Vercel logs, but don't send it back to the browser
      console.error('Resend error', resendRes.status, await resendRes.text());
      res.status(502).json({ error: 'Failed to send email' });
      return;
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Unexpected error sending email', err);
    res.status(500).json({ error: 'Unexpected error sending email' });
  }
}
