import React, { useEffect, useMemo, useState } from 'react';
import { NeumoButton, NeumoCard, Field, Input, Pill, Select } from '../components/Neumo';
import { formatCurrency, formatDate } from '../lib/ui';

type Invoice = any;

type Payment = any;

type Metrics = any;

export default function Billing() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const [invStatus, setInvStatus] = useState<'all' | 'issued' | 'paid' | 'overdue' | 'void'>('all');
  const [payStatus, setPayStatus] = useState<'all' | 'paid' | 'failed' | 'pending'>('all');

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [mRes, iRes, pRes] = await Promise.all([
        fetch('/api/metrics'),
        fetch(`/api/invoices?status=${invStatus}&limit=30`),
        fetch(`/api/payments?status=${payStatus}&limit=30`),
      ]);
      setMetrics(await mRes.json());
      const inv = await iRes.json();
      const pay = await pRes.json();
      setInvoices(Array.isArray(inv) ? inv : []);
      setPayments(Array.isArray(pay) ? pay : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [invStatus, payStatus]);

  const currency = 'INR';
  const monthlyRevenue = metrics?.kpis?.monthlyRevenue ?? 0;
  const annualRevenue = metrics?.kpis?.annualRevenue ?? 0;

  const pendingInvoices = useMemo(() => invoices.filter((i) => i.status === 'issued' || i.status === 'overdue'), [invoices]);

  return (
    <div className="space-y-4">
      <NeumoCard className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-white">Revenue overview</div>
            <div className="text-xs text-white/45">Payments, pending invoices, renewals & expiry alerts</div>
          </div>
          <NeumoButton onClick={fetchAll} disabled={loading}>
            Refresh
          </NeumoButton>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          <Stat label="Monthly revenue" value={formatCurrency(monthlyRevenue, currency)} />
          <Stat label="Annual revenue" value={formatCurrency(annualRevenue, currency)} />
          <Stat label="Pending invoices" value={String(pendingInvoices.length)} />
        </div>
      </NeumoCard>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        <NeumoCard className="p-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-white">Invoices</div>
              <div className="text-xs text-white/45">Generate from Company Details; download via print</div>
            </div>
            <Field label="Status">
              <Select value={invStatus} onChange={(e) => setInvStatus(e.target.value as any)}>
                <option value="all">All</option>
                <option value="issued">Issued</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
                <option value="void">Void</option>
              </Select>
            </Field>
          </div>

          <div className="mt-3 overflow-auto rounded-2xl border border-white/10">
            <table className="min-w-[840px] w-full">
              <thead className="bg-white/5">
                <tr className="text-left text-xs text-white/55">
                  <th className="p-3">Invoice</th>
                  <th className="p-3">Company</th>
                  <th className="p-3">Issued</th>
                  <th className="p-3">Due</th>
                  <th className="p-3">Total</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-4 text-sm text-white/50">
                      Loading…
                    </td>
                  </tr>
                ) : invoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-4 text-sm text-white/50">
                      No invoices.
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv) => (
                    <tr key={inv.id} className="border-t border-white/10 text-sm text-white/80">
                      <td className="p-3">{inv.invoice_number || `#${inv.id}`}</td>
                      <td className="p-3">{inv.company?.name || '—'}</td>
                      <td className="p-3">{formatDate(inv.issued_at)}</td>
                      <td className="p-3">{formatDate(inv.due_at)}</td>
                      <td className="p-3">{formatCurrency(Number(inv.total || 0), inv.currency || currency)}</td>
                      <td className="p-3">
                        <Pill tone={inv.status === 'paid' ? 'good' : inv.status === 'overdue' ? 'bad' : 'neutral'}>{inv.status}</Pill>
                      </td>
                      <td className="p-3">
                        <a
                          href={`/api/invoice_pdf?id=${inv.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-xl border border-white/10 bg-white/6 px-3 py-2 text-xs text-white/75 hover:bg-white/10"
                        >
                          Open
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </NeumoCard>

        <NeumoCard className="p-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-white">Payments</div>
              <div className="text-xs text-white/45">Paid/failed/pending transactions</div>
            </div>
            <Field label="Status">
              <Select value={payStatus} onChange={(e) => setPayStatus(e.target.value as any)}>
                <option value="all">All</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
                <option value="pending">Pending</option>
              </Select>
            </Field>
          </div>

          <div className="mt-3 overflow-auto rounded-2xl border border-white/10">
            <table className="min-w-[720px] w-full">
              <thead className="bg-white/5">
                <tr className="text-left text-xs text-white/55">
                  <th className="p-3">Company</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Method</th>
                  <th className="p-3">Paid</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-sm text-white/50">
                      Loading…
                    </td>
                  </tr>
                ) : payments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-sm text-white/50">
                      No payments.
                    </td>
                  </tr>
                ) : (
                  payments.map((p) => (
                    <tr key={p.id} className="border-t border-white/10 text-sm text-white/80">
                      <td className="p-3">{p.company?.name || '—'}</td>
                      <td className="p-3">{formatCurrency(Number(p.amount || 0), p.currency || currency)}</td>
                      <td className="p-3">{p.payment_method || '—'}</td>
                      <td className="p-3">{formatDate(p.paid_at)}</td>
                      <td className="p-3">
                        <Pill tone={p.status === 'paid' ? 'good' : p.status === 'failed' ? 'bad' : 'warn'}>{p.status}</Pill>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </NeumoCard>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
      <div className="text-xs text-white/45">{label}</div>
      <div className="mt-1 text-lg font-semibold text-white">{value}</div>
    </div>
  );
}
