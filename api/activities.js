import supabase from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { company_id, limit } = req.query;
      let query = supabase
        .from('activities')
        .select(
          `id, type, message, meta, created_at, company_id,
           company:companies(id, name, logo_url)
          `
        )
        .order('created_at', { ascending: false });
      if (company_id) query = query.eq('company_id', company_id);
      if (limit) query = query.limit(Number(limit));
      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const { type, message, company_id, meta } = req.body || {};
      if (!type || !message) return res.status(400).json({ error: 'Missing type or message.' });
      const { data, error } = await supabase
        .from('activities')
        .insert({ type, message, company_id: company_id || null, meta: meta || {} })
        .select()
        .single();
      if (error) throw error;
      return res.status(201).json(data);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
