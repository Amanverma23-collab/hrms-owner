import supabase from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase.from('platform_settings').select('*').eq('id', 1).single();
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'PUT') {
      const patch = req.body || {};
      const { data, error } = await supabase
        .from('platform_settings')
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq('id', 1)
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
