import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { NeumoButton, NeumoCard, Field, Input, Pill, Select, Textarea } from '../components/Neumo';
import { formatCurrency, formatDate, formatDateTime } from '../lib/ui';
import supabase from "../lib/supabase";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type Plan = { id: string; name: string; currency: string; price_monthly: number; employee_limit: number | null; storage_limit_gb: number | null };

type Company = any;

type ActivityRow = { id: number; type: string; message: string; created_at: string };

type Invoice = any;

export default function CompanyDetails() {
  const { id } = useParams();
  const [company, setCompany] = useState<Company | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [activity, setActivity] = useState<ActivityRow[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const downloadCompanyPDF = () => {
  const doc = new jsPDF();

  doc.setFontSize(20);
  doc.text("Company Profile Report", 14, 20);

  doc.setFontSize(11);
  doc.text(`Company: ${company.company_name || "-"}`, 14, 35);
  doc.text(`Owner: ${company.owner_name || "-"}`, 14, 43);
  doc.text(`Email: ${company.company_email || "-"}`, 14, 51);
  doc.text(`Phone: ${company.company_phone || "-"}`, 14, 59);

  autoTable(doc, {
    startY: 70,
    head: [["Field", "Value"]],
    body: [
      ["Website", company.website || "-"],
      ["Industry", company.industry || "-"],
      ["Status", company.status || "-"],

      ["CIN", company.cin || "-"],
      ["GST", company.gst || "-"],
      ["PAN", company.pan || "-"],
      ["TAN", company.tan || "-"],

      ["PF No", company.pf_no || "-"],
      ["ESIC No", company.esic_no || "-"],
      ["PT No", company.pt_no || "-"],
      ["LWF", company.lwf || "-"],

      ["Country", company.country || "-"],
      ["State", company.state || "-"],
      ["City", company.city || "-"],
      ["Pincode", company.pincode || "-"],
      ["Address", company.address || "-"],

      ["Bank Name", company.bank_name || "-"],
      ["Account Holder", company.account_holder || "-"],
      ["Account Number", company.account_number || "-"],
      ["IFSC", company.ifsc_code || "-"],
      ["Branch", company.branch_name || "-"],

      ["Admin Email", company.admin_email || "-"],
      ["Admin Phone", company.admin_phone || "-"],

      ["Plan Type", company.plan_type || "-"],
      ["Created At", company.created_at || "-"],
    ],
  });

  doc.save(`${company.company_name}.pdf`);
};
  const downloadExcel = () => {
  const rows = [
    ["Field", "Value"],
    ["Company Name", company.company_name],
    ["Owner Name", company.owner_name],
    ["Email", company.company_email],
    ["Phone", company.company_phone],
    ["Website", company.website],
    ["Industry", company.industry],
    ["GST", company.gst],
    ["PAN", company.pan],
    ["TAN", company.tan],
    ["CIN", company.cin],
    ["Admin Email", company.admin_email],
    ["Admin Phone", company.admin_phone],
  ];

  const csv = rows.map(r => r.join(",")).join("\n");

  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;"
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `${company.company_name}.csv`;
  link.click();
};

const downloadInvoicePDF = (inv: any) => {
  const doc = new jsPDF();

  doc.setFontSize(20);
  doc.text("TAX INVOICE", 14, 20);

  doc.setFontSize(11);

  doc.text(`Invoice No: ${inv.invoice_no || inv.id}`, 14, 40);
  doc.text(`Company: ${company.company_name}`, 14, 50);
  doc.text(`Plan: ${inv.plan_name || company.plan_type}`, 14, 60);

  doc.text(`Issue Date: ${inv.issue_date || "-"}`, 14, 70);
  doc.text(`Due Date: ${inv.due_date || "-"}`, 14, 80);

  autoTable(doc, {
    startY: 95,
    head: [["Description", "Amount"]],
    body: [
      ["Subscription Plan", inv.amount || 0],
      ["GST", inv.gst_amount || 0],
      ["Total", inv.total_amount || 0],
    ],
  });

  doc.save(`Invoice-${inv.invoice_no || inv.id}.pdf`);
};


const loadInvoices = async () => {
  const { data } = await supabase
    .from("invoices")
    .select("*")
    .eq("company_id", id);

  setInvoices(data || []);
};
  const fetchAll = async () => {
  setLoading(true);

  try {
    const { data, error } = await supabase
      .from("companies")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    const mapped = {
      ...data,
      name: data.company_name,
      email: data.company_email,
      phone: data.company_phone,
    };

    setCompany(mapped);
    await loadInvoices();
    setPlans([]);
    setActivity([]);
   

  } catch (e) {
    console.error(e);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchAll();
  }, [id]);

  const plan = company?.subscriptions?.plan as Plan | null;
  const currency = plan?.currency || 'INR';

  const [patch, setPatch] = useState<any>({});
  useEffect(() => {
    if (!company) return;
    setPatch({
      name: company.name,
      owner_name: company.owner_name,
      email: company.email,
      phone: company.phone,
      website: company.website,
      industry: company.industry,
      status: company.status,
      address_full: company.address_full,
    });
  }, [company]);

  const saveCompany = async () => {
  if (!id) return;

  setSaving(true);
  setMsg(null);
  setErr(null);

  try {
    const { error } = await supabase
      .from("companies")
      .update({
        company_name: patch.name,
        owner_name: patch.owner_name,
        company_email: patch.email,
        company_phone: patch.phone,
        website: patch.website,
        industry: patch.industry,
        status: patch.status,
        address: patch.address_full,
      })
      .eq("id", id);

    if (error) throw error;

    setMsg("Company updated successfully");
    await fetchAll();

  } catch (ex: any) {
    setErr(ex.message || "Failed");
  } finally {
    setSaving(false);
  }
};

  const extendSubscription = async (days: number) => {
    if (!company?.subscriptions?.id) return;
    const current = company.subscriptions.expiry_date;
    const base = new Date(current);
    base.setDate(base.getDate() + days);
    const next = base.toISOString().slice(0, 10);

    const res = await fetch('/api/subscriptions', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: company.subscriptions.id, patch: { expiry_date: next } }),
    });
    if (res.ok) {
      setMsg(`Subscription extended by ${days} days.`);
      await fetchAll();
    }
  };

 const generateInvoice = async () => {
  if (!company) return;

  const invoiceNo = `INV-${Date.now()}`;

  const { error } = await supabase
    .from("invoices")
    .insert([
      {
        company_id: company.id,
        invoice_no: invoiceNo,
        plan_name: company.plan_type || "Starter",
        amount: 999,
        gst_amount: 180,
        total_amount: 1179,
        issue_date: new Date().toISOString().slice(0,10),
        due_date: new Date().toISOString().slice(0,10),
        status: "Pending"
      }
    ]);

  if (error) {
    alert(error.message);
    return;
  }

  alert("Invoice Generated");
  loadInvoices();
};

  const upgradePlan = async (plan_id: string) => {
    if (!id || !plan_id) return;
    const p = plans.find((x) => x.id === plan_id);
    const start_date = new Date().toISOString().slice(0, 10);
    const exp = new Date();
    exp.setMonth(exp.getMonth() + 1);
    const expiry_date = exp.toISOString().slice(0, 10);

    const res = await fetch('/api/subscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        company_id: id,
        plan_id,
        start_date,
        expiry_date,
        status: 'active',
        employee_limit: p?.employee_limit ?? null,
        storage_limit_gb: p?.storage_limit_gb ?? null,
        trial_days: 0,
      }),
    });
    if (res.ok) {
      setMsg('Plan changed and new subscription created.');
      await fetchAll();
    }
  };

  const header = useMemo(() => {
    if (!company) return null;
    return (
      <NeumoCard className="p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center overflow-hidden rounded-2xl border border-white/10 bg-white/6">
              {company.logo_url ? <img src={company.logo_url} className="h-full w-full object-cover" alt="logo" /> : <div className="text-xs text-white/40">LOGO</div>}
            </div>
            <div>
              <div className="text-lg font-semibold text-white">{company.name}</div>
              <div className="text-xs text-white/45">Company ID: {company.id}</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link to="/companies" className="rounded-2xl border border-white/10 bg-white/6 px-4 py-2 text-sm text-white/75 hover:bg-white/10">
              Back
            </Link>
           <Link
  to={`/companies/edit/${company.id}`}
  className="rounded-2xl border border-white/10 bg-white/6 px-4 py-2 text-sm text-white/75"
>
  Edit Company
</Link>

<NeumoButton
  type="button"
  onClick={downloadCompanyPDF}
>
  Download PDF
</NeumoButton>

<NeumoButton
  type="button"
  onClick={downloadExcel}
>
  Download Excel
</NeumoButton>
          </div>
        </div>
        {err ? <div className="mt-3 rounded-2xl border border-rose-400/20 bg-rose-500/10 p-3 text-sm text-rose-100">{err}</div> : null}
        {msg ? <div className="mt-3 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-3 text-sm text-emerald-100">{msg}</div> : null}
      </NeumoCard>
    );
  }, [company, msg, err, saving, patch]);

  if (loading) {
    return <NeumoCard className="p-4 text-sm text-white/55">Loading company…</NeumoCard>;
  }

  if (!company) {
    return <NeumoCard className="p-4 text-sm text-white/55">Company not found.</NeumoCard>;
  }

  return (
    <div className="space-y-4">
      {header}

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
        <NeumoCard className="p-4 xl:col-span-2">
          <div className="text-sm font-semibold text-white">Company Profile</div>
          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
            <Field label="Company Name">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-white">
  {company.company_name}
</div>
            </Field>
           <Field label="Owner Name">
  <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-white">
    {company.owner_name}
  </div>
</Field>
           <Field label="Email">
  <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-white">
    {company.company_email}
  </div>
</Field>
            <Field label="Phone">
  <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-white">
    {company.company_phone}
  </div>
</Field>
            <Field label="Website">
  <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-white">
    {company.website}
  </div>
</Field>
           <Field label="Industry">
  <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-white">
    {company.industry}
  </div>
</Field>
           <Field label="Status">
  <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-white">
    {company.status}
  </div>
</Field>
            <div className="md:col-span-2">
             <Field label="Full Address">
  <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-white min-h-[100px]">
    {company.address}
  </div>
</Field>
            </div>
          </div>
        </NeumoCard>

        <NeumoCard className="p-4">
  <div className="text-sm font-semibold text-white mb-3">
    Legal Information
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
    <Stat label="CIN" value={company.cin || "-"} />
    <Stat label="GST" value={company.gst || "-"} />
    <Stat label="PAN" value={company.pan || "-"} />
    <Stat label="TAN" value={company.tan || "-"} />
    <Stat label="PF No" value={company.pf_no || "-"} />
    <Stat label="ESIC No" value={company.esic_no || "-"} />
    <Stat label="PT No" value={company.pt_no || "-"} />
    <Stat label="LWF" value={company.lwf || "-"} />
  </div>
</NeumoCard>

<NeumoCard className="p-4">
  <div className="text-sm font-semibold text-white mb-3">
    Address Information
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
    <Stat label="Country" value={company.country || "-"} />
    <Stat label="State" value={company.state || "-"} />
    <Stat label="City" value={company.city || "-"} />
    <Stat label="Pincode" value={company.pincode || "-"} />
  </div>
</NeumoCard>

<NeumoCard className="p-4">
  <div className="text-sm font-semibold text-white mb-3">
    Bank & Admin Information
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

    <Stat label="Bank Name" value={company.bank_name || "-"} />
    <Stat label="Account Holder" value={company.account_holder || "-"} />
    <Stat label="Account Number" value={company.account_number || "-"} />
    <Stat label="IFSC Code" value={company.ifsc_code || "-"} />
    <Stat label="Branch Name" value={company.branch_name || "-"} />

    <Stat label="Admin Email" value={company.admin_email || "-"} />
    <Stat label="Admin Phone" value={company.admin_phone || "-"} />

    <Stat label="Plan Type" value={company.plan_type || "-"} />
    <Stat label="Status" value={company.status || "-"} />

  </div>
</NeumoCard>

     <NeumoCard className="p-4">
          <div className="text-sm font-semibold text-white">Subscription</div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Pill tone={company.subscriptions?.status === 'active' ? 'good' : company.subscriptions?.status === 'trial' ? 'warn' : 'bad'}>
              {company.subscriptions?.status || '—'}
            </Pill>
            <Pill tone="neutral">{plan?.name || '—'}</Pill>
          </div>

          <div className="mt-3 space-y-2 text-sm text-white/70">
            <div className="flex items-center justify-between">
              <span className="text-white/45">Start</span>
              <span>{formatDate(company.subscriptions?.start_date)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/45">Expiry</span>
              <span>{formatDate(company.subscriptions?.expiry_date)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/45">Employee limit</span>
              <span>{company.subscriptions?.employee_limit ?? '—'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/45">Storage limit</span>
              <span>{company.subscriptions?.storage_limit_gb ? `${company.subscriptions.storage_limit_gb} GB` : '—'}</span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => extendSubscription(30)}
              className="rounded-2xl border border-white/10 bg-white/6 px-3 py-2 text-xs text-white/75 hover:bg-white/10"
            >
              +30 days
            </button>
            <button
              type="button"
              onClick={() => extendSubscription(90)}
              className="rounded-2xl border border-white/10 bg-white/6 px-3 py-2 text-xs text-white/75 hover:bg-white/10"
            >
              +90 days
            </button>
          </div>

          <div className="mt-3">
            <div className="text-xs font-medium text-white/70">Change plan</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {plans.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => upgradePlan(p.id)}
                  className="rounded-2xl border border-sky-300/20 bg-sky-400/10 px-3 py-2 text-xs text-white/85 hover:bg-sky-400/14"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <NeumoButton type="button" className="w-full justify-center" onClick={generateInvoice} disabled={saving}>
              Generate invoice
            </NeumoButton>
          </div>
        </NeumoCard>
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        <NeumoCard className="p-4">
          <div className="text-sm font-semibold text-white">Usage & Signals</div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Stat label="Employee count" value={String(company.employee_count_cached || 0)} />
            <Stat label="Attendance count" value={String(company.attendance_count_cached || 0)} />
            <Stat label="Storage used" value={company.storage_used_gb_cached ? `${company.storage_used_gb_cached} GB` : '—'} />
            <Stat label="Last login" value={formatDateTime(company.last_login_at)} />
          </div>
        </NeumoCard>

        <NeumoCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-white">Recent Activity</div>
              <div className="text-xs text-white/45">Company-specific timeline</div>
            </div>
          </div>
          <div className="mt-3 space-y-2">
            {activity.length === 0 ? (
              <div className="text-sm text-white/45">No activity recorded.</div>
            ) : (
              activity.map((a) => (
                <div key={a.id} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className="text-sm text-white/85">{a.message}</div>
                  <div className="mt-1 flex items-center justify-between text-xs text-white/40">
                    <span>{a.type}</span>
                    <span>{formatDateTime(a.created_at)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </NeumoCard>
      </div>

      <NeumoCard className="p-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-white">Invoices</div>
            <div className="text-xs text-white/45">Generate & download invoice HTML (print to PDF)</div>
          </div>
        </div>

        <div className="mt-3 overflow-auto rounded-2xl border border-white/10">
          <table className="min-w-[900px] w-full">
            <thead className="bg-white/5">
              <tr className="text-left text-xs text-white/55">
                <th className="p-3">Invoice</th>
                <th className="p-3">Issued</th>
                <th className="p-3">Total</th>
                <th className="p-3">Status</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 ? (
                <tr>
                  <td className="p-4 text-sm text-white/50" colSpan={5}>
                    No invoices.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="border-t border-white/10 text-sm text-white/80">
                    <td className="p-3">{inv.invoice_no|| `#${inv.id}`}</td>
                    <td className="p-3">{formatDate(inv.issued_date)}</td>
                    <td className="p-3">{formatCurrency(Number(inv.total_amount || 0), inv.currency || currency)}</td>
                    <td className="p-3">
                      <Pill tone={inv.status === 'paid' ? 'good' : inv.status === 'overdue' ? 'bad' : 'neutral'}>{inv.status}</Pill>
                    </td>
                    <td className="p-3">
                   <button
  type="button"
  onClick={() => downloadInvoicePDF(inv)}
  className="rounded-xl border border-white/10 bg-white/6 px-3 py-2 text-xs text-white/75 hover:bg-white/10"
>
  Download PDF
</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </NeumoCard>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
      <div className="text-xs text-white/45">{label}</div>
<div className="text-white font-semibold break-all">
  {value}
</div>
    </div>
  );
}
