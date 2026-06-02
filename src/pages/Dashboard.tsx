import React, { useEffect, useMemo, useState } from 'react';
import { Building2, Users, CreditCard, TrendingUp, Sparkles, Activity as ActivityIcon } from 'lucide-react';
import { NeumoCard, NeumoPanel, Pill } from '../components/Neumo';
import { ChartCard, MiniBarChart } from '../components/ChartCard';
import { formatCurrency, formatDateTime } from '../lib/ui';
import supabase from "../lib/supabase";

type Metrics = {
  kpis: {
    totalCompanies: number;
    activeCompanies: number;
    trialCompanies: number;
    suspendedCompanies: number;
    expiredCompanies: number;
    totalEmployees: number;
    monthlyRevenue: number;
    annualRevenue: number;
  };
  series: Array<{ label: string; companiesCreated: number; revenue: number; activeSubs: number }>;
};

type ActivityRow = {
  id: number;
  type: string;
  message: string;
  created_at: string;
  company?: { id: string; name: string; logo_url?: string | null } | null;
};

export default function Dashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [activity, setActivity] = useState<ActivityRow[]>([]);
  const [loading, setLoading] = useState(true);

 const fetchAll = async () => {
  setLoading(true);

  try {
    const { data: companies, error } = await supabase
      .from("companies")
      .select("*");

    if (error) throw error;

    const totalCompanies = companies?.length || 0;

    setMetrics({
      kpis: {
        totalCompanies,
        activeCompanies: totalCompanies,
        trialCompanies: 0,
        suspendedCompanies: 0,
        expiredCompanies: 0,
        totalEmployees: 0,
        monthlyRevenue: 0,
        annualRevenue: 0,
      },
      series: [],
    });

    setActivity([]);

  } catch (e) {
    console.error(e);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchAll();
  }, []);

  const currency = 'INR';

  const growthPoints = useMemo(() => {
    const s = metrics?.series || [];
    return {
      companies: s.map((p) => ({ label: p.label, value: p.companiesCreated })),
      revenue: s.map((p) => ({ label: p.label, value: p.revenue })),
      subs: s.map((p) => ({ label: p.label, value: p.activeSubs })),
    };
  }, [metrics]);

  const kpi = metrics?.kpis;

  return (
    <div className="space-y-4">
      <NeumoPanel className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Sparkles className="h-4 w-4 text-sky-200" />
              Executive Analytics
            </div>
            <div className="text-xs text-white/45">Companies, subscriptions, revenue, and platform activity</div>
          </div>
          <button
            onClick={fetchAll}
            className="rounded-2xl border border-white/10 bg-white/6 px-3 py-2 text-xs text-white/70 hover:bg-white/10"
          >
            Refresh
          </button>
        </div>
      </NeumoPanel>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard icon={Building2} label="Total Companies" value={loading ? '…' : String(kpi?.totalCompanies ?? 0)} />
        <KpiCard icon={TrendingUp} label="Active Companies" value={loading ? '…' : String(kpi?.activeCompanies ?? 0)} tone="good" />
        <KpiCard icon={Users} label="Total Employees" value={loading ? '…' : String(kpi?.totalEmployees ?? 0)} />
        <KpiCard icon={CreditCard} label="Monthly Revenue" value={loading ? '…' : formatCurrency(kpi?.monthlyRevenue ?? 0, currency)} tone="sky" />

        <KpiSplit
          a={{ label: 'Trial', value: loading ? '…' : String(kpi?.trialCompanies ?? 0), tone: 'warn' }}
          b={{ label: 'Suspended', value: loading ? '…' : String(kpi?.suspendedCompanies ?? 0), tone: 'bad' }}
        />
        <KpiSplit
          a={{ label: 'Expired', value: loading ? '…' : String(kpi?.expiredCompanies ?? 0), tone: 'bad' }}
          b={{ label: 'Annual Revenue', value: loading ? '…' : formatCurrency(kpi?.annualRevenue ?? 0, currency), tone: 'good' }}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
        <ChartCard title="Company growth" subtitle="New registrations per month" right="Last 12 months">
          <MiniBarChart points={growthPoints.companies} tone="violet" />
        </ChartCard>
        <ChartCard title="Revenue analytics" subtitle="Paid payments per month" right="Last 12 months">
          <MiniBarChart points={growthPoints.revenue} tone="sky" />
        </ChartCard>
        <ChartCard title="Subscription analytics" subtitle="Active subscriptions created" right="Last 12 months">
          <MiniBarChart points={growthPoints.subs} tone="emerald" />
        </ChartCard>
      </div>

      <NeumoCard className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <ActivityIcon className="h-4 w-4 text-white/75" />
              Recent Activity
            </div>
            <div className="text-xs text-white/45">A live timeline of important platform events</div>
          </div>
        </div>

        <div className="space-y-2">
          {loading ? (
            <div className="text-sm text-white/45">Loading timeline…</div>
          ) : activity.length === 0 ? (
            <div className="text-sm text-white/45">No activity yet.</div>
          ) : (
            activity.map((a) => (
              <div key={a.id} className="flex items-start justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                <div>
                  <div className="text-sm text-white/85">{a.message}</div>
                  <div className="text-xs text-white/40">{formatDateTime(a.created_at)}</div>
                </div>
                <div className="text-right">
                  <Pill tone="neutral">{a.type}</Pill>
                  {a.company?.name ? <div className="mt-1 text-xs text-white/40">{a.company.name}</div> : null}
                </div>
              </div>
            ))
          )}
        </div>
      </NeumoCard>
    </div>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: any;
  label: string;
  value: string;
  tone?: 'good' | 'bad' | 'warn' | 'sky';
}) {
  const toneCls: Record<string, string> = {
    good: 'bg-emerald-500/14 border-emerald-400/20',
    bad: 'bg-rose-500/14 border-rose-400/20',
    warn: 'bg-amber-500/14 border-amber-400/20',
    sky: 'bg-sky-500/14 border-sky-400/20',
  };
  return (
    <NeumoCard className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs text-white/45">{label}</div>
          <div className="mt-1 text-xl font-semibold text-white">{value}</div>
        </div>
        <div className={(tone ? toneCls[tone] : 'bg-white/8 border-white/10') + ' grid h-10 w-10 place-items-center rounded-2xl border'}>
          <Icon className="h-5 w-5 text-white/85" />
        </div>
      </div>
    </NeumoCard>
  );
}

function KpiSplit({
  a,
  b,
}: {
  a: { label: string; value: string; tone: 'good' | 'bad' | 'warn' };
  b: { label: string; value: string; tone: 'good' | 'bad' | 'warn' };
}) {
  return (
    <NeumoCard className="p-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-xs text-white/45">{a.label}</div>
          <div className="mt-1 text-lg font-semibold text-white">{a.value}</div>
          <div className="mt-2">
            <Pill tone={a.tone === 'good' ? 'good' : a.tone === 'bad' ? 'bad' : 'warn'}>{a.tone}</Pill>
          </div>
        </div>
        <div>
          <div className="text-xs text-white/45">{b.label}</div>
          <div className="mt-1 text-lg font-semibold text-white">{b.value}</div>
          <div className="mt-2">
            <Pill tone={b.tone === 'good' ? 'good' : b.tone === 'bad' ? 'bad' : 'warn'}>{b.tone}</Pill>
          </div>
        </div>
      </div>
    </NeumoCard>
  );
}
