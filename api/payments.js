import supabase from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { status, company_id, from, to, limit } = req.query;
      let query = supabase
        .from('payments')
        .select(
          `id, company_id, subscription_id, invoice_id, amount, currency, status, paid_at, due_at, created_at, payment_method,
           company:companies(id, name),
           invoice:invoices(id, invoice_number)
          `
        )
        .order('created_at', { ascending: false });

      if (status && status !== 'all') query = query.eq('status', status);
      if (company_id) query = query.eq('company_id', company_id);
      if (from) query = query.gte('created_at', from);
      if (to) query = query.lte('created_at', to);
      if (limit) query = query.limit(Number(limit));

      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const { company_id, subscription_id, amount, currency, status, paid_at, due_at, payment_method } = req.body || {};
      if (!company_id || amount == null) return res.status(400).json({ error: 'Missing company_id or amount.' });
      const { data, error } = await supabase
        .from('payments')
        .insert({
          company_id,
          subscription_id: subscription_id || null,
          amount,
          currency: currency || 'INR',
          status: status || 'paid',
          paid_at: paid_at || null,
          due_at: due_at || null,
          payment_method: payment_method || 'manual',
        })
        .select()
        .single();
      if (error) throw error;

      await supabase.from('activities').insert({
        type: 'payment_recorded',
        company_id,
        message: `Payment recorded: ${amount} ${currency || 'INR'}.`,
        meta: { payment_id: data.id, status: data.status },
      });

      return res.status(201).json(data);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
