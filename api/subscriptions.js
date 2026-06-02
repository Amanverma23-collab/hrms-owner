import supabase from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { company_id, status, from, to, limit } = req.query;
      let query = supabase
        .from('subscriptions')
        .select(
          `id, company_id, plan_id, start_date, expiry_date, status, employee_limit, storage_limit_gb, trial_days, created_at,
           plan:plans(id, name, price_monthly, price_annual, currency),
           company:companies(id, name, email, status)
          `
        )
        .order('created_at', { ascending: false });

      if (company_id) query = query.eq('company_id', company_id);
      if (status && status !== 'all') query = query.eq('status', status);
      if (from) query = query.gte('created_at', from);
      if (to) query = query.lte('created_at', to);
      if (limit) query = query.limit(Number(limit));

      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const { company_id, plan_id, start_date, expiry_date, status, employee_limit, storage_limit_gb, trial_days } = req.body || {};
      if (!company_id || !plan_id || !start_date || !expiry_date) {
        return res.status(400).json({ error: 'Missing required fields.' });
      }
      const { data, error } = await supabase
        .from('subscriptions')
        .insert({
          company_id,
          plan_id,
          start_date,
          expiry_date,
          status: status || 'active',
          employee_limit: employee_limit ?? null,
          storage_limit_gb: storage_limit_gb ?? null,
          trial_days: trial_days ?? 0,
        })
        .select()
        .single();
      if (error) throw error;

      await supabase
        .from('companies')
        .update({ current_plan_id: plan_id, current_subscription_id: data.id, current_subscription_expiry: expiry_date })
        .eq('id', company_id);

      await supabase.from('activities').insert({
        type: 'subscription_created',
        company_id,
        message: `Subscription created/changed by Super Admin.`,
        meta: { plan_id, expiry_date },
      });

      return res.status(201).json(data);
    }

    if (req.method === 'PUT') {
      const { id, patch } = req.body || {};
      if (!id || !patch) return res.status(400).json({ error: 'Missing id or patch.' });
      const { data, error } = await supabase
        .from('subscriptions')
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
