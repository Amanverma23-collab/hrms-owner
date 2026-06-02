import supabase from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { q, status, plan_id, expiry_from, expiry_to, limit } = req.query;
      let query = supabase
        .from('companies')
        .select(
          `id, name, logo_url, owner_name, email, phone, industry, created_at, status,
           legal_cin, legal_gst, legal_pan, legal_tan, pf_number, esic_number, pt_number, lwf_number,
           website,
           address_country, address_state, address_city, address_pincode, address_full,
           bank_name, bank_account_holder, bank_account_number, bank_ifsc, bank_branch,
           employee_count_cached, attendance_count_cached, storage_used_gb_cached, last_login_at,
           subscriptions:subscriptions!companies_current_subscription_id_fkey(
             id, start_date, expiry_date, status, employee_limit, storage_limit_gb, trial_days,
             plan:plans(id, name, price_monthly, price_annual, currency)
           )
          `
        )
        .order('created_at', { ascending: false });

      if (q) query = query.ilike('name', `%${q}%`);
      if (status && status !== 'all') query = query.eq('status', status);
      if (plan_id && plan_id !== 'all') query = query.eq('current_plan_id', plan_id);
      if (expiry_from) query = query.gte('current_subscription_expiry', expiry_from);
      if (expiry_to) query = query.lte('current_subscription_expiry', expiry_to);
      if (limit) query = query.limit(Number(limit));

      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const body = req.body || {};

      const {
        name,
        logo_url,
        industry,
        owner_name,
        email,
        phone,
        website,
        legal_cin,
        legal_gst,
        legal_pan,
        legal_tan,
        pf_number,
        esic_number,
        pt_number,
        lwf_number,
        address_country,
        address_state,
        address_city,
        address_pincode,
        address_full,
        bank_name,
        bank_account_holder,
        bank_account_number,
        bank_ifsc,
        bank_branch,
        admin_email,
        admin_phone,
        admin_temp_password,
        plan_id,
        employee_limit,
        storage_limit_gb,
        trial_days,
        start_date,
        expiry_date,
        subscription_status,
      } = body;

      if (!name || !owner_name || !email || !phone) {
        return res.status(400).json({ error: 'Missing required fields (name, owner_name, email, phone).' });
      }
      if (!plan_id || !start_date || !expiry_date) {
        return res.status(400).json({ error: 'Missing subscription fields (plan_id, start_date, expiry_date).' });
      }

      const { data: company, error: cErr } = await supabase
        .from('companies')
        .insert({
          name,
          logo_url: logo_url || null,
          industry: industry || null,
          owner_name,
          email,
          phone,
          website: website || null,
          legal_cin: legal_cin || null,
          legal_gst: legal_gst || null,
          legal_pan: legal_pan || null,
          legal_tan: legal_tan || null,
          pf_number: pf_number || null,
          esic_number: esic_number || null,
          pt_number: pt_number || null,
          lwf_number: lwf_number || null,
          address_country: address_country || null,
          address_state: address_state || null,
          address_city: address_city || null,
          address_pincode: address_pincode || null,
          address_full: address_full || null,
          bank_name: bank_name || null,
          bank_account_holder: bank_account_holder || null,
          bank_account_number: bank_account_number || null,
          bank_ifsc: bank_ifsc || null,
          bank_branch: bank_branch || null,
          status: 'active',
        })
        .select('*')
        .single();
      if (cErr) throw cErr;

      const { data: sub, error: sErr } = await supabase
        .from('subscriptions')
        .insert({
          company_id: company.id,
          plan_id,
          start_date,
          expiry_date,
          status: subscription_status || 'active',
          employee_limit: employee_limit ?? null,
          storage_limit_gb: storage_limit_gb ?? null,
          trial_days: trial_days ?? 0,
        })
        .select('*')
        .single();
      if (sErr) throw sErr;

      const { error: upErr } = await supabase
        .from('companies')
        .update({
          current_plan_id: plan_id,
          current_subscription_id: sub.id,
          current_subscription_expiry: expiry_date,
        })
        .eq('id', company.id);
      if (upErr) throw upErr;

      // Create a company admin placeholder row (not platform auth; used for impersonation/audit)
      if (admin_email) {
        const { error: aErr } = await supabase
          .from('company_admins')
          .insert({
            company_id: company.id,
            name: owner_name,
            email: admin_email,
            phone: admin_phone || null,
            temp_password: admin_temp_password || null,
            status: 'active',
          });
        if (aErr) throw aErr;
      }

      // Activity
      await supabase.from('activities').insert({
        type: 'company_created',
        company_id: company.id,
        message: `${company.name} registered (created by Super Admin).`,
        meta: { source: 'super-admin', plan_id },
      });

      return res.status(201).json({ company_id: company.id });
    }

    if (req.method === 'PUT') {
      const body = req.body || {};
      const { id, patch } = body;
      if (!id || !patch) return res.status(400).json({ error: 'Missing id or patch.' });

      const allowed = {
        name: true,
        logo_url: true,
        owner_name: true,
        email: true,
        phone: true,
        industry: true,
        website: true,
        legal_cin: true,
        legal_gst: true,
        legal_pan: true,
        legal_tan: true,
        pf_number: true,
        esic_number: true,
        pt_number: true,
        lwf_number: true,
        address_country: true,
        address_state: true,
        address_city: true,
        address_pincode: true,
        address_full: true,
        bank_name: true,
        bank_account_holder: true,
        bank_account_number: true,
        bank_ifsc: true,
        bank_branch: true,
        status: true,
      };

      const update = {};
      for (const k of Object.keys(patch)) {
        if (allowed[k]) update[k] = patch[k];
      }

      const { data, error } = await supabase
        .from('companies')
        .update(update)
        .eq('id', id)
        .select('*')
        .single();
      if (error) throw error;

      await supabase.from('activities').insert({
        type: 'company_updated',
        company_id: id,
        message: `Company updated by Super Admin.`,
        meta: { patchKeys: Object.keys(update) },
      });

      return res.status(200).json(data);
    }

    if (req.method === 'DELETE') {
      const { id } = req.body || {};
      if (!id) return res.status(400).json({ error: 'Missing id.' });

      const { error } = await supabase.from('companies').delete().eq('id', id);
      if (error) throw error;

      await supabase.from('activities').insert({
        type: 'company_deleted',
        company_id: id,
        message: `Company deleted by Super Admin.`,
        meta: {},
      });

      return res.status(200).json({ ok: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
