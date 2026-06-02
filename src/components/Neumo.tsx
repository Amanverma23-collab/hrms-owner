import React from 'react';
import { cn } from '../lib/ui';

export function NeumoPanel({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        'rounded-3xl border border-white/10 bg-white/6 backdrop-blur-xl',
        'shadow-[18px_18px_45px_rgba(0,0,0,0.35),-18px_-18px_45px_rgba(255,255,255,0.06)]',
        'dark:shadow-[18px_18px_45px_rgba(0,0,0,0.45),-18px_-18px_45px_rgba(255,255,255,0.05)]',
        className
      )}
    >
      {children}
    </div>
  );
}

export function NeumoCard({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-white/10 bg-white/8 backdrop-blur-xl',
        'shadow-[12px_12px_30px_rgba(0,0,0,0.35),-12px_-12px_30px_rgba(255,255,255,0.06)]',
        className
      )}
    >
      {children}
    </div>
  );
}

export function NeumoButton({
  className,
  children,
  variant = 'primary',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost' | 'danger';
}) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium transition active:translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed';
  const variants: Record<string, string> = {
    primary:
      'bg-white/10 text-white hover:bg-white/14 border border-white/12 shadow-[10px_10px_24px_rgba(0,0,0,0.35),-10px_-10px_24px_rgba(255,255,255,0.06)]',
    ghost: 'bg-transparent text-white/85 hover:bg-white/8 border border-white/10',
    danger:
      'bg-rose-500/15 text-rose-100 hover:bg-rose-500/22 border border-rose-400/20 shadow-[10px_10px_24px_rgba(0,0,0,0.35),-10px_-10px_24px_rgba(255,255,255,0.06)]',
  };
  return (
    <button className={cn(base, variants[variant], className)} {...props}>
      {children}
    </button>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-1 flex items-end justify-between">
        <div className="text-xs font-medium text-white/70">{label}</div>
        {hint ? <div className="text-[11px] text-white/35">{hint}</div> : null}
      </div>
      {children}
    </label>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        'w-full rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/35',
        'outline-none focus:border-sky-300/40 focus:ring-2 focus:ring-sky-400/15',
        props.className
      )}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        'w-full rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white',
        'outline-none focus:border-sky-300/40 focus:ring-2 focus:ring-sky-400/15',
        props.className
      )}
    />
  );
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        'w-full min-h-[90px] rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/35',
        'outline-none focus:border-sky-300/40 focus:ring-2 focus:ring-sky-400/15',
        props.className
      )}
    />
  );
}

export function Pill({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'good' | 'warn' | 'bad' | 'neutral' }) {
  const tones: Record<string, string> = {
    good: 'bg-emerald-500/15 text-emerald-100 border-emerald-400/20',
    warn: 'bg-amber-500/15 text-amber-100 border-amber-400/20',
    bad: 'bg-rose-500/15 text-rose-100 border-rose-400/20',
    neutral: 'bg-white/10 text-white/80 border-white/12',
  };
  return <span className={cn('inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium', tones[tone])}>{children}</span>;
}
