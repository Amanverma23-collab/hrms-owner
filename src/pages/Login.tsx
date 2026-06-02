import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, KeyRound, Mail, Sparkles, Lock, ArrowRight } from 'lucide-react';
import { Field, Input, NeumoButton, NeumoCard, NeumoPanel } from '../components/Neumo';
import { getAuth, setAuth } from '../lib/auth';
import supabase from "../lib/supabase";



async function apiVerify2fa(code: string) {
  const res = await fetch('/api/super_admin_2fa', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || '2FA failed');
  return data as { ok: boolean };
}

export default function Login({ onAuthed }: { onAuthed: () => void }) {
  const existing = useMemo(() => getAuth(), []);
  const [email, setEmail] = useState(existing?.email || '');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(existing?.remember ?? true);
  const [forgotEmail, setForgotEmail] = useState('');
  const [mode, setMode] = useState<'login' | 'forgot' | '2fa'>('login');
  const [twoFactor, setTwoFactor] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setErr(null);
    setLoading(true);
    try {
     const { data, error } = await supabase.auth.signInWithPassword({
  email: email.trim(),
  password,
});

if (error) throw error;
     if (false) {
        setMode('2fa');
      } else {
        setAuth({ email: email.trim(), remember, issuedAt: Date.now() });
        onAuthed();
      }
    } catch (ex: any) {
      setErr(ex.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  const submit2fa = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setErr(null);
    setLoading(true);
    try {
      await apiVerify2fa(twoFactor.trim());
      setAuth({ email: email.trim(), remember, issuedAt: Date.now() });
      onAuthed();
    } catch (ex: any) {
      setErr(ex.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  const forgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch('/api/super_admin_forgot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed');
      setMsg('Password reset instructions were sent (simulated).');
    } catch (ex: any) {
      setErr(ex.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#070a12] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 top-[-120px] h-[520px] w-[520px] rounded-full bg-sky-500/20 blur-[80px]" />
        <div className="absolute -right-40 top-[120px] h-[520px] w-[520px] rounded-full bg-violet-500/18 blur-[90px]" />
        <div className="absolute left-[35%] top-[55%] h-[620px] w-[620px] rounded-full bg-emerald-500/10 blur-[100px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_20%,rgba(255,255,255,0.10),transparent_40%),radial-gradient(circle_at_80%_40%,rgba(56,189,248,0.14),transparent_45%),radial-gradient(circle_at_20%_90%,rgba(139,92,246,0.12),transparent_45%)]" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-10">
        <div className="grid w-full grid-cols-1 items-center gap-8 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="hidden lg:block"
          >
            <NeumoPanel className="p-6">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/10">
                  <Sparkles className="h-5 w-5 text-sky-200" />
                </div>
                <div>
                  <div className="text-sm font-semibold">HRMS Super Admin</div>
                  <div className="text-xs text-white/45">Premium owner console</div>
                </div>
              </div>
              <div className="mt-6 grid gap-3">
                {[{ icon: ShieldCheck, t: 'Enterprise audit trail', d: 'Every critical action is recorded in activity timeline.' }, { icon: KeyRound, t: 'Single owner account', d: 'Hardened access with optional 2FA challenge.' }, { icon: Lock, t: 'Platform settings', d: 'SMTP, branding, and payment gateway configuration.' }].map(
                  (f) => {
                    const Icon = f.icon;
                    return (
                      <NeumoCard key={f.t} className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/8">
                            <Icon className="h-5 w-5 text-white/85" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-white">{f.t}</div>
                            <div className="text-xs text-white/45">{f.d}</div>
                          </div>
                        </div>
                      </NeumoCard>
                    );
                  }
                )}
              </div>
            </NeumoPanel>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.05 }}>
            <NeumoPanel className="p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-lg font-semibold">Secure Login</div>
                  <div className="text-sm text-white/45">Sign in as platform owner</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/6 px-3 py-2 text-xs text-white/55">Neumo • Glass</div>
              </div>

              {mode === 'login' ? (
                <form onSubmit={submit} className="mt-5 space-y-4">
                  <Field label="Email">
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                      <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="owner@domain.com" className="pl-9" required />
                    </div>
                  </Field>
                  <Field label="Password">
                    <div className="relative">
                      <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                      <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="••••••••" className="pl-9" required />
                    </div>
                  </Field>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-xs text-white/65">
                      <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                      Remember me
                    </label>
                    <button type="button" className="text-xs text-sky-200 hover:text-sky-100" onClick={() => setMode('forgot')}>
                      Forgot password?
                    </button>
                  </div>

                  {err ? <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 p-3 text-sm text-rose-100">{err}</div> : null}
                  {msg ? <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-3 text-sm text-emerald-100">{msg}</div> : null}

                  <NeumoButton disabled={loading} className="w-full justify-center" type="submit">
                    {loading ? 'Signing in…' : 'Sign in'}
                    <ArrowRight className="h-4 w-4" />
                  </NeumoButton>

                  <div className="text-xs text-white/45">
                    Tip: 2FA is optional. Enable it from Settings once signed in.
                  </div>
                </form>
              ) : mode === '2fa' ? (
                <form onSubmit={submit2fa} className="mt-5 space-y-4">
                  <div className="rounded-2xl border border-white/10 bg-white/6 p-3 text-sm text-white/70">
                    2FA challenge enabled. Enter the 6-digit code from your authenticator.
                  </div>
                  <Field label="2FA Code" hint="Demo code: 123456">
                    <Input value={twoFactor} onChange={(e) => setTwoFactor(e.target.value)} placeholder="123456" inputMode="numeric" />
                  </Field>
                  {err ? <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 p-3 text-sm text-rose-100">{err}</div> : null}
                  <div className="flex gap-2">
                    <NeumoButton type="button" variant="ghost" className="w-full justify-center" onClick={() => setMode('login')}>
                      Back
                    </NeumoButton>
                    <NeumoButton disabled={loading} className="w-full justify-center" type="submit">
                      {loading ? 'Verifying…' : 'Verify'}
                    </NeumoButton>
                  </div>
                </form>
              ) : (
                <form onSubmit={forgot} className="mt-5 space-y-4">
                  <div className="rounded-2xl border border-white/10 bg-white/6 p-3 text-sm text-white/70">
                    Forgot password will generate a reset request (demo simulation stored in database activity).
                  </div>
                  <Field label="Email">
                    <Input value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} type="email" placeholder="owner@domain.com" required />
                  </Field>
                  {err ? <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 p-3 text-sm text-rose-100">{err}</div> : null}
                  {msg ? <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-3 text-sm text-emerald-100">{msg}</div> : null}
                  <div className="flex gap-2">
                    <NeumoButton type="button" variant="ghost" className="w-full justify-center" onClick={() => setMode('login')}>
                      Back
                    </NeumoButton>
                    <NeumoButton disabled={loading} className="w-full justify-center" type="submit">
                      {loading ? 'Sending…' : 'Send reset link'}
                    </NeumoButton>
                  </div>
                </form>
              )}
            </NeumoPanel>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
