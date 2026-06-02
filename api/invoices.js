import supabase from './_supabase.js';

function buildInvoiceNumber(id, createdAt) {
  const d = new Date(createdAt);
  const yy = String(d.getUTCFullYear()).slice(-2);
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  return `INV-${yy}${mm}-${String(id).padStart(6, '0')}`;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { status, company_id, limit } = req.query;
      let query = supabase
        .from('invoices')
        .select(
          `id, company_id, subscription_id, invoice_number, status, currency, subtotal, tax, total, issued_at, due_at, paid_at, notes, created_at,
           company:companies(id, name, email),
           subscription:subscriptions(id, plan_id, start_date, expiry_date, status, plan:plans(id, name))
          `
        )
        .order('created_at', { ascending: false });

      if (status && status !== 'all') query = query.eq('status', status);
      if (company_id) query = query.eq('company_id', company_id);
      if (limit) query = query.limit(Number(limit));

      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const { company_id, subscription_id, currency, subtotal, tax, total, issued_at, due_at, notes } = req.body || {};
      if (!company_id || total == null) return res.status(400).json({ error: 'Missing company_id or total.' });

      const { data: invoice, error: iErr } = await supabase
        .from('invoices')
        .insert({
          company_id,
          subscription_id: subscription_id || null,
          status: 'issued',
          currency: currency || 'INR',
          subtotal: subtotal ?? total,
          tax: tax ?? 0,
          total,
          issued_at: issued_at || new Date().toISOString(),
          due_at: due_at || null,
          notes: notes || null,
        })
        .select()
        .single();
      if (iErr) throw iErr;

      const invoice_number = buildInvoiceNumber(invoice.id, invoice.created_at);
      const { data: updated, error: uErr } = await supabase
        .from('invoices')
        .update({ invoice_number })
        .eq('id', invoice.id)
        .select()
        .single();
      if (uErr) throw uErr;

      await supabase.from('activities').insert({
        type: 'invoice_generated',
        company_id,
        message: `Invoice generated: ${invoice_number}.`,
        meta: { invoice_id: updated.id },
      });

      return res.status(201).json(updated);
    }

    if (req.method === 'PUT') {
      const { id, patch } = req.body || {};
      if (!id || !patch) return res.status(400).json({ error: 'Missing id or patch.' });
      const { data, error } = await supabase
        .from('invoices')
        .update(patch)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return res.status(200).json(data);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
