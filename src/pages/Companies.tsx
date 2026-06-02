import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, Trash2, PauseCircle, PlayCircle, Eye, Pencil, LogIn } from 'lucide-react';
import { Field, Input, NeumoButton, NeumoCard, Pill, Select } from '../components/Neumo';
import { downloadText, formatDate } from '../lib/ui';
import supabase from "../lib/supabase";

type Plan = { id: string; name: string };

type CompanyRow = {
  id: string;
  name: string;
  logo_url?: string | null;
  owner_name: string;
  email: string;
  phone: string;
  status: 'active' | 'trial' | 'suspended';
  created_at: string;
  employee_count_cached: number;
  current_subscription_expiry?: string | null;
  subscriptions?: {
    id: string;
    expiry_date: string;
    status: string;
    plan?: { id: string; name: string } | null;
  } | null;
};

export default function Companies() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [rows, setRows] = useState<CompanyRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState('');
  const [status, setStatus] = useState<'all' | 'active' | 'trial' | 'suspended'>('all');
  const [planId, setPlanId] = useState<string>('all');
  const [expiryFrom, setExpiryFrom] = useState('');
  const [expiryTo, setExpiryTo] = useState('');

  const [selected, setSelected] = useState<Record<string, boolean>>({});

 const fetchPlans = async () => {
  setPlans([]);
};

const fetchCompanies = async () => {

  setLoading(true);

  try {

    const { data, error } = await supabase
      .from("companies")
      .select("*");

    if (error) throw error;

    const mapped = (data || []).map((c:any) => ({
  ...c,
  name: c.company_name,
  email: c.company_email,
  phone: c.company_phone,
 status: c.status || "active",
  employee_count_cached: 0,
}));

    setRows(mapped);

  } catch (e) {

    console.error(e);

  } finally {

    setLoading(false);

  }
};

  useEffect(() => {
   
    fetchCompanies();
  }, []);

  const selectedIds = useMemo(() => Object.keys(selected).filter((id) => selected[id]), [selected]);

  const toggleAll = (v: boolean) => {
    if (!v) return setSelected({});
    const next: Record<string, boolean> = {};
    for (const r of rows) next[r.id] = true;
    setSelected(next);
  };

  const bulk = async () => {};

const updateStatus = async (id: string, currentStatus: string) => {
  const newStatus =
    currentStatus === "suspended"
      ? "active"
      : "suspended";

  const { error } = await supabase
    .from("companies")
    .update({ status: newStatus })
    .eq("id", id);

  if (error) {
    alert(error.message);
    return;
  }

  fetchCompanies();
};

  const del = async (id: string) => {
  const ok = confirm(
    "Delete this company?"
  );

  if (!ok) return;

  const { error } = await supabase
    .from("companies")
    .delete()
    .eq("id", id);

  if (error) {
    alert(error.message);
    return;
  }

  fetchCompanies();
};

  const exportCsv = () => {
    const header = [
      'id',
      'company_name',
      'owner_name',
      'email',
      'phone',
      'plan',
      'employee_count',
      'created_date',
      'expiry_date',
      'status',
    ];
    const lines = [header.join(',')];
    for (const r of rows) {
      lines.push(
        [
          r.id,
          JSON.stringify(r.name),
          JSON.stringify(r.owner_name),
          JSON.stringify(r.email),
          JSON.stringify(r.phone),
          JSON.stringify(r.subscriptions?.plan?.name || ''),
          String(r.employee_count_cached || 0),
          JSON.stringify(r.created_at),
          JSON.stringify(r.subscriptions?.expiry_date || r.current_subscription_expiry || ''),
          JSON.stringify(r.status),
        ].join(',')
      );
    }
    downloadText(`companies_export_${new Date().toISOString().slice(0, 10)}.csv`, lines.join('\n'));
  };

 const impersonate = async () => {};

  return (
    <div className="space-y-4">
      <NeumoCard className="p-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-white">Search & Filters</div>
            <div className="text-xs text-white/45">Find companies and run bulk actions</div>
          </div>
          <div className="flex flex-wrap gap-2">
            <NeumoButton variant="ghost" onClick={exportCsv}>
              <Download className="h-4 w-4" />
              Export
            </NeumoButton>
            <Link to="/companies/new" className="rounded-2xl border border-sky-300/25 bg-sky-400/12 px-4 py-2 text-sm font-medium text-white hover:bg-sky-400/16">
              Add company
            </Link>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
          <Field label="Search company">
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. ABC Pvt Ltd" />
          </Field>
          <Field label="Status">
            <Select value={status} onChange={(e) => setStatus(e.target.value as any)}>
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="trial">Trial</option>
              <option value="suspended">Suspended</option>
            </Select>
          </Field>
          <Field label="Plan">
            <Select value={planId} onChange={(e) => setPlanId(e.target.value)}>
              <option value="all">All plans</option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Expiry from">
            <Input value={expiryFrom} onChange={(e) => setExpiryFrom(e.target.value)} type="date" />
          </Field>
          <Field label="Expiry to">
            <Input value={expiryTo} onChange={(e) => setExpiryTo(e.target.value)} type="date" />
          </Field>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <NeumoButton onClick={fetchCompanies}>Apply filters</NeumoButton>
          <NeumoButton variant="ghost" onClick={() => {
            setQ('');
            setStatus('all');
            setPlanId('all');
            setExpiryFrom('');
            setExpiryTo('');
            setTimeout(fetchCompanies, 0);
          }}>
            Reset
          </NeumoButton>

          <div className="ml-auto flex flex-wrap gap-2">
            <NeumoButton variant="ghost" disabled={selectedIds.length === 0} onClick={() => bulk()}>
              <PauseCircle className="h-4 w-4" />
              Suspend selected
            </NeumoButton>
            <NeumoButton
  variant="ghost"
  disabled={selectedIds.length === 0}
  onClick={() => bulk()}
>
              <Trash2 className="h-4 w-4" />
              Delete selected
            </NeumoButton>
          </div>
        </div>
      </NeumoCard>

      <NeumoCard className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-white">Companies</div>
            <div className="text-xs text-white/45">{loading ? 'Loading…' : `${rows.length} results`}</div>
          </div>
          <label className="flex items-center gap-2 text-xs text-white/65">
            <input
              type="checkbox"
              checked={rows.length > 0 && selectedIds.length === rows.length}
              onChange={(e) => toggleAll(e.target.checked)}
            />
            Select all
          </label>
        </div>

        <div className="overflow-auto rounded-2xl border border-white/10">
          <table className="min-w-[1200px] w-full">
            <thead className="bg-white/5">
              <tr className="text-left text-xs text-white/55">
                <th className="p-3">Sel</th>
                <th className="p-3">Company</th>
                <th className="p-3">Owner</th>
                <th className="p-3">Email</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Plan</th>
                <th className="p-3">Employees</th>
                <th className="p-3">Created</th>
                <th className="p-3">Expiry</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="p-4 text-sm text-white/50" colSpan={11}>
                    Loading companies…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td className="p-4 text-sm text-white/50" colSpan={11}>
                    No companies found.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="border-t border-white/10 text-sm text-white/80">
                    <td className="p-3">
                      <input type="checkbox" checked={!!selected[r.id]} onChange={(e) => setSelected((s) => ({ ...s, [r.id]: e.target.checked }))} />
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 place-items-center overflow-hidden rounded-2xl border border-white/10 bg-white/6">
                          {r.logo_url ? <img src={r.logo_url} alt="logo" className="h-full w-full object-cover" /> : <div className="text-xs text-white/40">LOGO</div>}
                        </div>
                        <div>
                          <div className="font-medium text-white">{r.name}</div>
                          <div className="text-xs text-white/40">#{r.id.slice(0, 8)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">{r.owner_name}</td>
                    <td className="p-3">{r.email}</td>
                    <td className="p-3">{r.phone}</td>
                    <td className="p-3">{r.subscriptions?.plan?.name || '—'}</td>
                    <td className="p-3">{r.employee_count_cached || 0}</td>
                    <td className="p-3">{formatDate(r.created_at)}</td>
                    <td className="p-3">{formatDate(r.subscriptions?.expiry_date || r.current_subscription_expiry || null)}</td>
                    <td className="p-3">
                      <Pill tone={r.status === 'active' ? 'good' : r.status === 'trial' ? 'warn' : 'bad'}>{r.status}</Pill>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          to={`/companies/${r.id}`}
                          className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/6 px-2.5 py-1.5 text-xs text-white/75 hover:bg-white/10"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View
                        </Link>

                        <Link
  to={`/companies/edit/${r.id}`}
  className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/6 px-2.5 py-1.5 text-xs text-white/75"
>
  <Pencil className="h-3.5 w-3.5" />
  Edit
</Link>
                        <button
                         onClick={() => updateStatus(r.id, r.status)}
                          className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/6 px-2.5 py-1.5 text-xs text-white/75 hover:bg-white/10"
                        >
                          {r.status === 'suspended' ? <PlayCircle className="h-3.5 w-3.5" /> : <PauseCircle className="h-3.5 w-3.5" />}
                          {r.status === 'suspended' ? 'Activate' : 'Suspend'}
                        </button>
                        <button
                          onClick={() => impersonate()}
                          className="inline-flex items-center gap-1 rounded-xl border border-sky-300/20 bg-sky-400/10 px-2.5 py-1.5 text-xs text-white/85 hover:bg-sky-400/14"
                        >
                          <LogIn className="h-3.5 w-3.5" />
                          Login as
                        </button>
                        <button
                          onClick={() => del(r.id)}
                          className="inline-flex items-center gap-1 rounded-xl border border-rose-400/20 bg-rose-500/10 px-2.5 py-1.5 text-xs text-rose-100 hover:bg-rose-500/14"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-3 text-xs text-white/45">
          Edit & extend subscription available from Company Details page.
        </div>
      </NeumoCard>
    </div>
  );
}
