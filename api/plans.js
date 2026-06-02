import supabase from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('id', { ascending: true });
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const { name, price_monthly, price_annual, currency, employee_limit, storage_limit_gb, is_active, description, sort_order } =
        req.body || {};
      if (!name) return res.status(400).json({ error: 'Missing name.' });
      const { data, error } = await supabase
        .from('plans')
        .insert({
          name,
          price_monthly: price_monthly ?? 0,
          price_annual: price_annual ?? 0,
          currency: currency || 'INR',
          employee_limit: employee_limit ?? null,
          storage_limit_gb: storage_limit_gb ?? null,
          is_active: is_active ?? true,
          description: description || null,
          sort_order: sort_order ?? 0,
        })
        .select()
        .single();
      if (error) throw error;
      return res.status(201).json(data);
    }

    if (req.method === 'PUT') {
      const { id, patch } = req.body || {};
      if (!id || !patch) return res.status(400).json({ error: 'Missing id or patch.' });
      const { data, error } = await supabase
        .from('plans')
        .update(patch)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'DELETE') {
      const { id } = req.body || {};
      if (!id) return res.status(400).json({ error: 'Missing id.' });
      const { error } = await supabase.from('plans').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
