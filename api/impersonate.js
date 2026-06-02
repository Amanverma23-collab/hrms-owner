import supabase from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    // This does not actually log into another product; it creates an audit event and returns a safe deep-link placeholder.
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { company_id } = req.body || {};
    if (!company_id) return res.status(400).json({ error: 'Missing company_id.' });

    const { data: company, error } = await supabase.from('companies').select('id,name').eq('id', company_id).single();
    if (error) throw error;

    await supabase.from('activities').insert({
      type: 'impersonation_started',
      company_id,
      message: `Super Admin initiated “Login as Company Admin” for ${company.name}.`,
      meta: { company_id },
    });

    return res.status(200).json({ ok: true, target: `company:${company_id}` });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
