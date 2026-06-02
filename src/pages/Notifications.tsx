import React, { useEffect, useState } from 'react';
import { NeumoButton, NeumoCard, Pill } from '../components/Neumo';
import { formatDateTime } from '../lib/ui';

type Notif = any;

export default function Notifications() {
  const [rows, setRows] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRows = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/notifications?limit=50');
      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRows();
  }, []);

  const markRead = async (id: number) => {
    const res = await fetch('/api/notifications', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, is_read: true }),
    });
    if (res.ok) fetchRows();
  };

  return (
    <div className="space-y-4">
      <NeumoCard className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-white">Notifications</div>
            <div className="text-xs text-white/45">Expiry alerts, failed payments, support signals</div>
          </div>
          <NeumoButton variant="ghost" onClick={fetchRows} disabled={loading}>
            Refresh
          </NeumoButton>
        </div>
      </NeumoCard>

      <NeumoCard className="p-4">
        {loading ? (
          <div className="text-sm text-white/45">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="text-sm text-white/45">No notifications.</div>
        ) : (
          <div className="space-y-2">
            {rows.map((n) => (
              <div key={n.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                <div>
                  <div className="text-sm text-white/85">{n.title}</div>
                  <div className="text-xs text-white/45">{n.body}</div>
                  <div className="mt-1 text-[11px] text-white/40">{formatDateTime(n.created_at)}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Pill tone={n.severity === 'high' ? 'bad' : n.severity === 'medium' ? 'warn' : 'neutral'}>{n.severity}</Pill>
                  {n.is_read ? <Pill tone="good">read</Pill> : <Pill tone="warn">unread</Pill>}
                  {!n.is_read ? (
                    <button
                      onClick={() => markRead(n.id)}
                      className="rounded-xl border border-white/10 bg-white/6 px-3 py-2 text-xs text-white/75 hover:bg-white/10"
                    >
                      Mark read
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </NeumoCard>
    </div>
  );
}
