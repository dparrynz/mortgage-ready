// Vercel cron job (see "crons" in vercel.json). Runs once a day and makes a
// small read against Supabase so the free plan project never counts as
// inactive and doesn't get paused after 7 quiet days.
//
// It uses the public anon key, so with row level security on it reads nothing
// private: the query returns an empty list, but it still counts as activity.
//
// Optional: set CRON_SECRET in Vercel's environment variables. Vercel then
// sends it with each cron call, and anyone else calling this URL is refused.

const SUPABASE_URL = 'https://cpwbixddgcyingntsxci.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwd2JpeGRkZ2N5aW5nbnRzeGNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYwNjgzMjksImV4cCI6MjEwMTY0NDMyOX0.-K5k0pyWV_piJCdcwQUiAzUND-PM35VOXSZSaBSbP6g';

export default async function handler(req, res) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.authorization !== `Bearer ${secret}`) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/saved_scenarios?select=id&limit=1`, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
    });
    res.status(r.ok ? 200 : 502).json({ ok: r.ok, supabaseStatus: r.status, at: new Date().toISOString() });
  } catch (e) {
    res.status(502).json({ ok: false, error: 'Supabase unreachable' });
  }
}
