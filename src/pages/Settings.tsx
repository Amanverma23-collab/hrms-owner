import React, { useEffect, useState } from 'react';
import { NeumoButton, NeumoCard, Field, Input, Select, Textarea, Pill } from '../components/Neumo';

type Settings = any;

export default function Settings() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [patch, setPatch] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const fetchSettings = async () => {
    setLoading(true);
    const res = await fetch('/api/settings');
    const data = await res.json();
    setSettings(data);
    setPatch(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const save = async () => {
    setSaving(true);
    setMsg(null);
    setErr(null);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed');
      setMsg('Settings saved.');
      setSettings(data);
    } catch (ex: any) {
      setErr(ex.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <NeumoCard className="p-4 text-sm text-white/55">Loading settings…</NeumoCard>;

  return (
    <div className="space-y-4">
      <NeumoCard className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-white">Platform Settings</div>
            <div className="text-xs text-white/45">Logo, SMTP, branding and payment gateway</div>
          </div>
          <NeumoButton onClick={save} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </NeumoButton>
        </div>
        {err ? <div className="mt-3 rounded-2xl border border-rose-400/20 bg-rose-500/10 p-3 text-sm text-rose-100">{err}</div> : null}
        {msg ? <div className="mt-3 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-3 text-sm text-emerald-100">{msg}</div> : null}
      </NeumoCard>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
        <NeumoCard className="p-4 xl:col-span-1">
          <div className="text-sm font-semibold text-white">Branding</div>
          <div className="mt-3 space-y-3">
            <Field label="Platform logo URL">
              <Input value={patch.platform_logo_url || ''} onChange={(e) => setPatch((p: any) => ({ ...p, platform_logo_url: e.target.value }))} placeholder="https://…" />
            </Field>
            <Field label="Brand name">
              <Input value={patch.brand_name || ''} onChange={(e) => setPatch((p: any) => ({ ...p, brand_name: e.target.value }))} placeholder="Your HRMS" />
            </Field>
            <Field label="Theme mode">
              <Select value={patch.theme_mode || 'system'} onChange={(e) => setPatch((p: any) => ({ ...p, theme_mode: e.target.value }))}>
                <option value="system">System</option>
                <option value="dark">Dark</option>
                <option value="light">Light</option>
              </Select>
            </Field>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <div className="text-xs text-white/45">2FA</div>
              <div className="mt-1 flex items-center justify-between">
                <div className="text-sm text-white/80">Optional 2FA</div>
                <Pill tone={patch.super_admin_twofa_enabled ? 'good' : 'neutral'}>{patch.super_admin_twofa_enabled ? 'enabled' : 'disabled'}</Pill>
              </div>
              <div className="mt-2 text-xs text-white/45">Demo code is stored for this MVP. Production should use TOTP.</div>
              <div className="mt-2 flex gap-2">
                <NeumoButton
                  variant="ghost"
                  onClick={() => setPatch((p: any) => ({ ...p, super_admin_twofa_enabled: !p.super_admin_twofa_enabled }))}
                >
                  Toggle 2FA
                </NeumoButton>
              </div>
            </div>
          </div>
        </NeumoCard>

        <NeumoCard className="p-4 xl:col-span-1">
          <div className="text-sm font-semibold text-white">SMTP</div>
          <div className="mt-3 space-y-3">
            <Field label="SMTP Host">
              <Input value={patch.smtp_host || ''} onChange={(e) => setPatch((p: any) => ({ ...p, smtp_host: e.target.value }))} placeholder="smtp.example.com" />
            </Field>
            <Field label="SMTP Port">
              <Input value={patch.smtp_port || 587} onChange={(e) => setPatch((p: any) => ({ ...p, smtp_port: Number(e.target.value) }))} type="number" />
            </Field>
            <Field label="SMTP Username">
              <Input value={patch.smtp_username || ''} onChange={(e) => setPatch((p: any) => ({ ...p, smtp_username: e.target.value }))} />
            </Field>
            <Field label="SMTP From Email">
              <Input value={patch.smtp_from_email || ''} onChange={(e) => setPatch((p: any) => ({ ...p, smtp_from_email: e.target.value }))} type="email" />
            </Field>
          </div>
        </NeumoCard>

        <NeumoCard className="p-4 xl:col-span-1">
          <div className="text-sm font-semibold text-white">Payments</div>
          <div className="mt-3 space-y-3">
            <Field label="Gateway">
              <Select value={patch.payment_gateway || 'razorpay'} onChange={(e) => setPatch((p: any) => ({ ...p, payment_gateway: e.target.value }))}>
                <option value="razorpay">Razorpay</option>
                <option value="stripe">Stripe</option>
                <option value="manual">Manual</option>
              </Select>
            </Field>
            <Field label="Gateway Key">
              <Input value={patch.payment_gateway_key || ''} onChange={(e) => setPatch((p: any) => ({ ...p, payment_gateway_key: e.target.value }))} placeholder="••••••" />
            </Field>
            <Field label="Webhook Secret">
              <Input value={patch.payment_webhook_secret || ''} onChange={(e) => setPatch((p: any) => ({ ...p, payment_webhook_secret: e.target.value }))} placeholder="••••••" />
            </Field>
            <Field label="Invoice footer note">
              <Textarea value={patch.invoice_footer_note || ''} onChange={(e) => setPatch((p: any) => ({ ...p, invoice_footer_note: e.target.value }))} placeholder="Thank you…" />
            </Field>
          </div>
        </NeumoCard>
      </div>

      <NeumoCard className="p-4">
        <div className="text-sm font-semibold text-white">Advanced</div>
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
          <Field label="Branding JSON">
            <Textarea value={patch.branding_json || ''} onChange={(e) => setPatch((p: any) => ({ ...p, branding_json: e.target.value }))} />
          </Field>
          <Field label="Notes (internal)">
            <Textarea value={patch.internal_notes || ''} onChange={(e) => setPatch((p: any) => ({ ...p, internal_notes: e.target.value }))} />
          </Field>
        </div>
      </NeumoCard>
    </div>
  );
}
