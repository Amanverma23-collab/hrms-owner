import React, { useEffect, useMemo, useState } from 'react';
import { NeumoButton, NeumoCard, Field, Input, Pill, Select, Textarea } from '../components/Neumo';
import { formatDateTime } from '../lib/ui';

type Ticket = any;

type Msg = any;

export default function Support() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'all' | 'open' | 'resolved' | 'closed'>('all');
  const [q, setQ] = useState('');

  const [active, setActive] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [reply, setReply] = useState('');

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('status', status);
      if (q) params.set('q', q);
      const res = await fetch(`/api/tickets?${params.toString()}`);
      const data = await res.json();
      setTickets(Array.isArray(data) ? data : []);
      if (active) {
        const refreshed = (Array.isArray(data) ? data : []).find((t) => t.id === active.id);
        setActive(refreshed || null);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (ticket_id: number) => {
    const res = await fetch(`/api/ticket_messages?ticket_id=${ticket_id}`);
    const data = await res.json();
    setMessages(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    fetchTickets();
  }, [status]);

  const openTicket = async (t: Ticket) => {
    setActive(t);
    await fetchMessages(t.id);
  };

  const sendReply = async () => {
    if (!active || !reply.trim()) return;
    const res = await fetch('/api/ticket_messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticket_id: active.id, sender: 'super_admin', body: reply.trim() }),
    });
    if (res.ok) {
      setReply('');
      await fetchMessages(active.id);
      await fetchTickets();
    }
  };

  const updateTicket = async (patch: any) => {
    if (!active) return;
    const res = await fetch('/api/tickets', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: active.id, patch }),
    });
    if (res.ok) {
      await fetchTickets();
    }
  };

  const statusTone = (s: string) => (s === 'open' ? 'warn' : s === 'resolved' ? 'good' : 'neutral');

  return (
    <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
      <NeumoCard className="p-4 xl:col-span-1">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-white">Support tickets</div>
            <div className="text-xs text-white/45">Reply, resolve, close</div>
          </div>
          <NeumoButton variant="ghost" onClick={fetchTickets}>
            Refresh
          </NeumoButton>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3">
          <Field label="Search">
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Subject contains…" />
          </Field>
          <Field label="Status">
            <Select value={status} onChange={(e) => setStatus(e.target.value as any)}>
              <option value="all">All</option>
              <option value="open">Open</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </Select>
          </Field>
          <NeumoButton onClick={fetchTickets}>Apply</NeumoButton>
        </div>

        <div className="mt-4 space-y-2">
          {loading ? (
            <div className="text-sm text-white/45">Loading…</div>
          ) : tickets.length === 0 ? (
            <div className="text-sm text-white/45">No tickets.</div>
          ) : (
            tickets.map((t) => (
              <button
                key={t.id}
                onClick={() => openTicket(t)}
                className={`w-full rounded-2xl border p-3 text-left transition ${
                  active?.id === t.id ? 'border-sky-300/25 bg-sky-400/10' : 'border-white/10 bg-white/5 hover:bg-white/8'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-sm font-medium text-white">{t.subject}</div>
                    <div className="text-xs text-white/40">{t.company?.name || '—'}</div>
                  </div>
                  <Pill tone={statusTone(t.status) as any}>{t.status}</Pill>
                </div>
                <div className="mt-2 text-xs text-white/40">Last: {formatDateTime(t.last_message_at || t.updated_at || t.created_at)}</div>
              </button>
            ))
          )}
        </div>
      </NeumoCard>

      <NeumoCard className="p-4 xl:col-span-2">
        {!active ? (
          <div className="text-sm text-white/55">Select a ticket to view conversation.</div>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-white">{active.subject}</div>
                <div className="text-xs text-white/45">
                  Company: {active.company?.name || '—'} • Ticket #{active.id}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <NeumoButton variant="ghost" onClick={() => updateTicket({ status: 'resolved' })}>
                  Resolve
                </NeumoButton>
                <NeumoButton variant="ghost" onClick={() => updateTicket({ status: 'closed' })}>
                  Close
                </NeumoButton>
                <NeumoButton variant="ghost" onClick={() => updateTicket({ status: 'open' })}>
                  Reopen
                </NeumoButton>
              </div>
            </div>

            <div className="h-[360px] overflow-auto rounded-2xl border border-white/10 bg-white/4 p-3">
              {messages.length === 0 ? (
                <div className="text-sm text-white/45">No messages.</div>
              ) : (
                <div className="space-y-2">
                  {messages.map((m) => (
                    <div key={m.id} className={`max-w-[80%] rounded-2xl border p-3 ${m.sender === 'super_admin' ? 'ml-auto border-sky-300/25 bg-sky-400/10' : 'border-white/10 bg-white/6'}`}>
                      <div className="text-xs text-white/45">{m.sender}</div>
                      <div className="text-sm text-white/85">{m.body}</div>
                      <div className="mt-1 text-[11px] text-white/40">{formatDateTime(m.created_at)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Field label="Reply">
                <Textarea value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Type your response…" />
              </Field>
              <div className="mt-2 flex justify-end">
                <NeumoButton onClick={sendReply}>Send</NeumoButton>
              </div>
            </div>
          </div>
        )}
      </NeumoCard>
    </div>
  );
}
