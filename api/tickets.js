import supabase from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { status, company_id, q, limit } = req.query;
      let query = supabase
        .from('support_tickets')
        .select(
          `id, company_id, subject, status, priority, created_at, updated_at, last_message_at,
           company:companies(id, name, logo_url, email)
          `
        )
        .order('last_message_at', { ascending: false });

      if (status && status !== 'all') query = query.eq('status', status);
      if (company_id) query = query.eq('company_id', company_id);
      if (q) query = query.ilike('subject', `%${q}%`);
      if (limit) query = query.limit(Number(limit));

      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const { company_id, subject, priority } = req.body || {};
      if (!company_id || !subject) return res.status(400).json({ error: 'Missing company_id or subject.' });
      const { data, error } = await supabase
        .from('support_tickets')
        .insert({ company_id, subject, priority: priority || 'normal', status: 'open' })
        .select()
        .single();
      if (error) throw error;

      await supabase.from('activities').insert({
        type: 'ticket_created',
        company_id,
        message: `Support ticket opened: ${subject}.`,
        meta: { ticket_id: data.id },
      });

      return res.status(201).json(data);
    }

    if (req.method === 'PUT') {
      const { id, patch } = req.body || {};
      if (!id || !patch) return res.status(400).json({ error: 'Missing id or patch.' });
      const { data, error } = await supabase
        .from('support_tickets')
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;

      await supabase.from('activities').insert({
        type: 'ticket_updated',
        company_id: data.company_id,
        message: `Ticket updated by Super Admin.`,
        meta: { ticket_id: data.id, patchKeys: Object.keys(patch) },
      });

      return res.status(200).json(data);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
