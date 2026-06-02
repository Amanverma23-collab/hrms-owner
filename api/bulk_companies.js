import supabase from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'POST') {
      const { action, ids } = req.body || {};
      if (!action || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: 'Missing action or ids.' });
      }

      if (action === 'suspend') {
        const { error } = await supabase.from('companies').update({ status: 'suspended' }).in('id', ids);
        if (error) throw error;
        await supabase.from('activities').insert(
          ids.map((id) => ({ type: 'company_suspended', company_id: id, message: 'Company suspended (bulk).', meta: {} }))
        );
        return res.status(200).json({ ok: true });
      }

      if (action === 'activate') {
        const { error } = await supabase.from('companies').update({ status: 'active' }).in('id', ids);
        if (error) throw error;
        await supabase.from('activities').insert(
          ids.map((id) => ({ type: 'company_activated', company_id: id, message: 'Company activated (bulk).', meta: {} }))
        );
        return res.status(200).json({ ok: true });
      }

      if (action === 'delete') {
        const { error } = await supabase.from('companies').delete().in('id', ids);
        if (error) throw error;
        await supabase.from('activities').insert(
          ids.map((id) => ({ type: 'company_deleted', company_id: id, message: 'Company deleted (bulk).', meta: {} }))
        );
        return res.status(200).json({ ok: true });
      }

      return res.status(400).json({ error: 'Unknown action.' });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
