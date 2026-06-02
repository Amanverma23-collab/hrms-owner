import supabase from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const { code } = req.body || {};
    const { data: admin, error } = await supabase.from('super_admin').select('*').eq('id', 1).single();
    if (error) throw error;

    if (!admin.twofa_enabled) return res.status(200).json({ ok: true });

    // Demo verification: stored static code. In a real app, use TOTP.
    if (String(code) !== String(admin.twofa_demo_code || '123456')) {
      await supabase.from('activities').insert({ type: '2fa_failed', message: '2FA verification failed.', meta: {} });
      return res.status(401).json({ error: 'Invalid 2FA code.' });
    }

    await supabase.from('activities').insert({ type: '2fa_success', message: '2FA verified for Super Admin.', meta: {} });
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
