import supabase from './_supabase.js';

function startOfMonth(d) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)).toISOString();
}
function startOfYear(d) {
  return new Date(Date.UTC(d.getUTCFullYear(), 0, 1)).toISOString();
}
function addMonths(d, n) {
  const dt = new Date(d);
  dt.setUTCMonth(dt.getUTCMonth() + n);
  return dt;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    const now = new Date();
    const monthStart = startOfMonth(now);
    const yearStart = startOfYear(now);

    const [companiesRes, paymentsMonthRes, paymentsYearRes, subsRes] = await Promise.all([
      supabase.from('companies').select('id,status,employee_count_cached,created_at,current_subscription_expiry'),
      supabase
        .from('payments')
        .select('amount,status,created_at')
        .eq('status', 'paid')
        .gte('created_at', monthStart),
      supabase
        .from('payments')
        .select('amount,status,created_at')
        .eq('status', 'paid')
        .gte('created_at', yearStart),
      supabase.from('subscriptions').select('id,status,created_at'),
    ]);

    if (companiesRes.error) throw companiesRes.error;
    if (paymentsMonthRes.error) throw paymentsMonthRes.error;
    if (paymentsYearRes.error) throw paymentsYearRes.error;
    if (subsRes.error) throw subsRes.error;

    const companies = companiesRes.data || [];
    const totalCompanies = companies.length;
    const activeCompanies = companies.filter((c) => c.status === 'active').length;
    const trialCompanies = companies.filter((c) => c.status === 'trial').length;
    const suspendedCompanies = companies.filter((c) => c.status === 'suspended').length;

    const expiredCompanies = companies.filter((c) => {
      if (!c.current_subscription_expiry) return false;
      return new Date(c.current_subscription_expiry).getTime() < now.getTime();
    }).length;

    const totalEmployees = companies.reduce((sum, c) => sum + (c.employee_count_cached || 0), 0);

    const monthlyRevenue = (paymentsMonthRes.data || []).reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const annualRevenue = (paymentsYearRes.data || []).reduce((sum, p) => sum + Number(p.amount || 0), 0);

    // Chart series (last 12 months)
    const points = [];
    for (let i = 11; i >= 0; i--) {
      const dt = addMonths(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)), -i);
      const start = new Date(Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth(), 1));
      const end = new Date(Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth() + 1, 1));
      const label = `${String(start.getUTCMonth() + 1).padStart(2, '0')}/${String(start.getUTCFullYear()).slice(-2)}`;

      const companiesCreated = companies.filter((c) => {
        const t = new Date(c.created_at).getTime();
        return t >= start.getTime() && t < end.getTime();
      }).length;

      const revenue = (paymentsYearRes.data || [])
        .filter((p) => {
          const t = new Date(p.created_at).getTime();
          return t >= start.getTime() && t < end.getTime();
        })
        .reduce((sum, p) => sum + Number(p.amount || 0), 0);

      const activeSubs = (subsRes.data || []).filter((s) => {
        const t = new Date(s.created_at).getTime();
        return t >= start.getTime() && t < end.getTime() && s.status === 'active';
      }).length;

      points.push({ label, companiesCreated, revenue, activeSubs });
    }

    return res.status(200).json({
      kpis: {
        totalCompanies,
        activeCompanies,
        trialCompanies,
        suspendedCompanies,
        expiredCompanies,
        totalEmployees,
        monthlyRevenue,
        annualRevenue,
      },
      series: points,
    });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
