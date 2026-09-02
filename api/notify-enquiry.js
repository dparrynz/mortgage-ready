// Vercel serverless function. Sends a plain notification email to Dan when
// someone submits the First Home Playbook contact form — no automation
// beyond the notification, Dan follows up manually (per the build brief).
// Requires a RESEND_API_KEY environment variable set in the Vercel project
// (Settings -> Environment Variables). "From" address must be on a domain
// verified in Resend.

const NOTIFY_TO = 'dparry@mikepero.co.nz';
const FROM = 'First Home Playbook <noreply@parryfs.com>';

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { name, phone, email, bestTime, comment } = req.body || {};
  if (!name || !phone || !email) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'Email service not configured' });
    return;
  }

  const html = `
    <h2>New First Home Playbook enquiry</h2>
    <p><strong>Name:</strong> ${escapeHtml(name)}</p>
    <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p><strong>Best time to contact:</strong> ${escapeHtml(bestTime || 'Not specified')}</p>
    <p><strong>Comment:</strong> ${escapeHtml(comment || 'None')}</p>
  `.trim();

  try {
    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: FROM,
        to: [NOTIFY_TO],
        reply_to: email,
        subject: `New First Home Playbook enquiry: ${name}`,
        html,
      }),
    });

    if (!resendRes.ok) {
      const detail = await resendRes.text();
      res.status(502).json({ error: 'Failed to send email', detail });
      return;
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Unexpected error sending email' });
  }
}
