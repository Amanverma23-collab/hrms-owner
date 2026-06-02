import supabase from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { ticket_id } = req.query;
      if (!ticket_id) return res.status(400).json({ error: 'Missing ticket_id.' });
      const { data, error } = await supabase
        .from('support_messages')
        .select('*')
        .eq('ticket_id', ticket_id)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const { ticket_id, sender, body } = req.body || {};
      if (!ticket_id || !sender || !body) return res.status(400).json({ error: 'Missing fields.' });

      const { data, error } = await supabase
        .from('support_messages')
        .insert({ ticket_id, sender, body })
        .select()
        .single();
      if (error) throw error;

      await supabase
        .from('support_tickets')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', ticket_id);

      return res.status(201).json(data);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
