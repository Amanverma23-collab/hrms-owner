import React from 'react';
import { NeumoCard } from './Neumo';
import { cn } from '../lib/ui';

type Point = { label: string; value: number };

export function MiniBarChart({ points, tone = 'sky' }: { points: Point[]; tone?: 'sky' | 'emerald' | 'amber' | 'violet' }) {
  const max = Math.max(1, ...points.map((p) => p.value));
  const color: Record<string, string> = {
    sky: 'from-sky-400/45 to-sky-200/10',
    emerald: 'from-emerald-400/45 to-emerald-200/10',
    amber: 'from-amber-400/45 to-amber-200/10',
    violet: 'from-violet-400/45 to-violet-200/10',
  };
  return (
    <div className="flex h-28 items-end gap-1">
      {points.map((p) => (
        <div key={p.label} className="flex-1">
          <div
            className={cn('w-full rounded-xl bg-gradient-to-t', color[tone])}
            style={{ height: `${Math.max(6, Math.round((p.value / max) * 100))}%` }}
            title={`${p.label}: ${p.value}`}
          />
        </div>
      ))}
    </div>
  );
}

export function ChartCard({
  title,
  subtitle,
  right,
  children,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <NeumoCard className="p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-white">{title}</div>
          {subtitle ? <div className="text-xs text-white/45">{subtitle}</div> : null}
        </div>
        {right ? <div className="text-xs text-white/55">{right}</div> : null}
      </div>
      {children}
    </NeumoCard>
  );
}
