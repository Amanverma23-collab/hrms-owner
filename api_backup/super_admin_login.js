import supabase from './_supabase.js';
import crypto from 'crypto';

function sha256(str) {
  return crypto.createHash('sha256').update(str).digest('hex');
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'Missing email or password.' });

    const inEmail = String(email).trim().toLowerCase();
    const inPassword = String(password);

    const { data: admin, error } = await supabase.from('super_admin').select('*').eq('id', 1).single();
    if (error) throw error;

    if (inEmail !== String(admin.email).trim().toLowerCase()) {
      await supabase.from('activities').insert({
        type: 'auth_failed',
        message: 'Super Admin login failed (email mismatch).',
        meta: { email: inEmail },
      });
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const hash = sha256(`${admin.password_salt}:${inPassword}`);
    if (hash !== admin.password_hash) {
      await supabase.from('activities').insert({
        type: 'auth_failed',
        message: 'Super Admin login failed (bad password).',
        meta: { email: inEmail },
      });
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    await supabase.from('activities').insert({ type: 'auth_success', message: 'Super Admin signed in.', meta: { email } });
    return res.status(200).json({ ok: true, requires2fa: !!admin.twofa_enabled });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
