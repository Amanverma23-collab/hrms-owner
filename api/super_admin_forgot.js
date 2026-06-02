import supabase from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ error: 'Missing email.' });

    await supabase.from('activities').insert({
      type: 'password_reset_requested',
      message: 'Password reset requested (simulated).',
      meta: { email },
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
