import supabase from './_supabase.js';

function escapeHtml(s) {
  return String(s || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'Missing id.' });

    const { data: invoice, error } = await supabase
      .from('invoices')
      .select(
        `id, invoice_number, status, currency, subtotal, tax, total, issued_at, due_at, paid_at, notes,
         company:companies(id, name, email, phone, address_full, address_city, address_state, address_pincode, address_country, legal_gst),
         subscription:subscriptions(id, plan_id, start_date, expiry_date, plan:plans(id, name))
        `
      )
      .eq('id', id)
      .single();
    if (error) throw error;

    // Minimal HTML invoice. Browser print-to-PDF is supported.
    const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(invoice.invoice_number || 'Invoice')}</title>
  <style>
    body{font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial; padding:32px; color:#0b1220;}
    .row{display:flex; justify-content:space-between; gap:24px;}
    .card{border:1px solid #e7e9ef; border-radius:16px; padding:18px;}
    h1{margin:0 0 6px 0; font-size:22px;}
    .muted{color:#6b7280; font-size:12px;}
    table{width:100%; border-collapse:collapse; margin-top:16px;}
    th,td{padding:10px 8px; border-bottom:1px solid #eef1f6; text-align:left;}
    .total{font-size:18px; font-weight:700;}
    @media print { body{padding:0} .card{border:none} }
  </style>
</head>
<body>
  <div class="row">
    <div>
      <h1>Invoice ${escapeHtml(invoice.invoice_number || String(invoice.id))}</h1>
      <div class="muted">Status: ${escapeHtml(invoice.status)}</div>
      <div class="muted">Issued: ${escapeHtml(invoice.issued_at)}</div>
      ${invoice.due_at ? `<div class="muted">Due: ${escapeHtml(invoice.due_at)}</div>` : ''}
    </div>
    <div class="card" style="min-width:280px">
      <div style="font-weight:700; margin-bottom:8px;">Billed To</div>
      <div>${escapeHtml(invoice.company?.name)}</div>
      <div class="muted">${escapeHtml(invoice.company?.email)} • ${escapeHtml(invoice.company?.phone || '')}</div>
      <div class="muted">${escapeHtml(invoice.company?.address_full || '')}</div>
      <div class="muted">GST: ${escapeHtml(invoice.company?.legal_gst || '—')}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th>Period</th>
        <th>Amount</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>${escapeHtml(invoice.subscription?.plan?.name || 'Subscription')}</td>
        <td>${escapeHtml(invoice.subscription?.start_date || '')} → ${escapeHtml(invoice.subscription?.expiry_date || '')}</td>
        <td>${escapeHtml(invoice.currency)} ${escapeHtml(invoice.subtotal)}</td>
      </tr>
      <tr>
        <td>Tax</td>
        <td></td>
        <td>${escapeHtml(invoice.currency)} ${escapeHtml(invoice.tax)}</td>
      </tr>
      <tr>
        <td class="total">Total</td>
        <td></td>
        <td class="total">${escapeHtml(invoice.currency)} ${escapeHtml(invoice.total)}</td>
      </tr>
    </tbody>
  </table>

  ${invoice.notes ? `<div class="card" style="margin-top:16px"><div style="font-weight:700">Notes</div><div class="muted">${escapeHtml(invoice.notes)}</div></div>` : ''}
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(html);
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
