import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NeumoButton, NeumoCard, Field, Input, Select, Textarea } from '../components/Neumo';
import supabase from "../lib/supabase";

type Plan = { id: string; name: string; employee_limit: number | null; storage_limit_gb: number | null; currency: string; price_monthly: number };

function addDaysISO(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export default function AddCompany() {
  const nav = useNavigate();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const [form, setForm] = useState<any>({
    logo_url: '',
    name: '',
    industry: 'Software',
    owner_name: '',
    email: '',
    phone: '',
    website: '',
    legal_cin: '',
    legal_gst: '',
    legal_pan: '',
    legal_tan: '',
    pf_number: '',
    esic_number: '',
    pt_number: '',
    lwf_number: '',
    address_country: 'India',
    address_state: '',
    address_city: '',
    address_pincode: '',
    address_full: '',
    bank_name: '',
    bank_account_holder: '',
    bank_account_number: '',
    bank_ifsc: '',
    bank_branch: '',
    admin_email: '',
    admin_phone: '',
    admin_password: '',

    plan_id: '',
    employee_limit: 50,
    storage_limit_gb: 10,
    trial_days: 14,
    start_date: new Date().toISOString().slice(0, 10),
    expiry_date: addDaysISO(30),
    subscription_status: 'active',
  });

  // const selectedPlan = useMemo(() => plans.find((p) => p.id === form.plan_id) || null, [plans, form.plan_id]);

  const fetchPlans = async () => {

  setPlans([
    {
      id: "starter",
      name: "Starter",
      employee_limit: 50,
      storage_limit_gb: 10,
      currency: "₹",
      price_monthly: 999
    },
    {
      id: "business",
      name: "Business",
      employee_limit: 200,
      storage_limit_gb: 50,
      currency: "₹",
      price_monthly: 2499
    }
  ]);

  setLoading(false);
};

  useEffect(() => {
    fetchPlans();
  }, []);

 

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

 const submit = async (e: React.FormEvent) => {
  e.preventDefault();

  setErr(null);
  setOk(null);
  setSaving(true);

  try {
    const { data: authData, error: authError } =
await supabase.auth.signUp({
  email: form.admin_email,
  password: form.admin_password,
});
if (authError) throw authError;
    const { data: companyData, error } = await supabase
  .from("companies")
  .insert([
        {
          company_name: form.name,
          company_email: form.email,
          company_phone: form.phone,
          website: form.website,
          industry: form.industry,

          cin: form.legal_cin,
          gst: form.legal_gst,
          pan: form.legal_pan,
          tan: form.legal_tan,

          pf_no: form.pf_number,
          esic_no: form.esic_number,
          pt_no: form.pt_number,
          lwf: form.lwf_number,

          country: form.address_country,
          state: form.address_state,
          city: form.address_city,
          pincode: form.address_pincode,
          address: form.address_full,

          bank_name: form.bank_name,
          account_holder: form.bank_account_holder,
          account_number: form.bank_account_number,
          ifsc_code: form.bank_ifsc,
          branch_name: form.bank_branch,

          owner_name: form.owner_name,
          admin_email: form.admin_email,
          admin_phone: form.admin_phone,

          plan_type: "Starter"
        }
      ])
.select()
.single();

    if (error) throw error;

   await supabase
  .from("profiles")
  .insert([
    {
      id: authData.user?.id,
      email: form.admin_email,
      name: form.owner_name,
      role: "hr",
      company_id: companyData.id
    }
  ]);
  
    setOk("Company Created");
    nav("/companies");

  } catch (ex: any) {
    setErr(ex.message || "Failed");
  } finally {
    setSaving(false);
  }
};

  return (
   <form onSubmit={submit} autoComplete="off">
      <NeumoCard className="p-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-white">Add Company</div>
            <div className="text-xs text-white/45">Create company workspace + admin placeholder + subscription</div>
          </div>
          <div className="flex gap-2">
            <NeumoButton type="submit" disabled={saving || loading}>
              {saving ? 'Creating…' : 'Create company'}
            </NeumoButton>
          </div>
        </div>
        {err ? <div className="mt-3 rounded-2xl border border-rose-400/20 bg-rose-500/10 p-3 text-sm text-rose-100">{err}</div> : null}
        {ok ? <div className="mt-3 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-3 text-sm text-emerald-100">{ok}</div> : null}
      </NeumoCard>

      <Section title="Company Details">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          <Field label="Company Logo URL" hint="Upload handled by HRMS product; use URL here">
            <Input value={form.logo_url} onChange={(e) => set('logo_url', e.target.value)} placeholder="https://…" />
          </Field>
          <Field label="Company Name">
            <Input value={form.name} onChange={(e) => set('name', e.target.value)} required />
          </Field>
          <Field label="Industry">
            <Input value={form.industry} onChange={(e) => set('industry', e.target.value)} />
          </Field>
          <Field label="Owner/HR Name">
            <Input value={form.owner_name} onChange={(e) => set('owner_name', e.target.value)} required />
          </Field>
          <Field label="Company Email">
           <Input
  type="email"
  value={form.email}
  onChange={(e) => set('email', e.target.value)}
  autoComplete="off"
/>
          </Field>
          <Field label="Company Phone">
            <Input value={form.phone} onChange={(e) => set('phone', e.target.value)} required />
          </Field>
          <Field label="Website">
            <Input value={form.website} onChange={(e) => set('website', e.target.value)} placeholder="https://…" />
          </Field>
          <Field label="CIN">
            <Input value={form.legal_cin} onChange={(e) => set('legal_cin', e.target.value)} />
          </Field>
          <Field label="GST">
            <Input value={form.legal_gst} onChange={(e) => set('legal_gst', e.target.value)} />
          </Field>
          <Field label="PAN">
            <Input value={form.legal_pan} onChange={(e) => set('legal_pan', e.target.value)} />
          </Field>
          <Field label="TAN">
            <Input value={form.legal_tan} onChange={(e) => set('legal_tan', e.target.value)} />
          </Field>
          <Field label="PF Number">
            <Input value={form.pf_number} onChange={(e) => set('pf_number', e.target.value)} />
          </Field>
          <Field label="ESIC Number">
            <Input value={form.esic_number} onChange={(e) => set('esic_number', e.target.value)} />
          </Field>
          <Field label="PT Number">
            <Input value={form.pt_number} onChange={(e) => set('pt_number', e.target.value)} />
          </Field>
          <Field label="LWF Number">
            <Input value={form.lwf_number} onChange={(e) => set('lwf_number', e.target.value)} />
          </Field>
        </div>
      </Section>

      <Section title="Address">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          <Field label="Country">
            <Input value={form.address_country} onChange={(e) => set('address_country', e.target.value)} />
          </Field>
          <Field label="State">
            <Input value={form.address_state} onChange={(e) => set('address_state', e.target.value)} />
          </Field>
          <Field label="City">
            <Input value={form.address_city} onChange={(e) => set('address_city', e.target.value)} />
          </Field>
          <Field label="Pincode">
            <Input value={form.address_pincode} onChange={(e) => set('address_pincode', e.target.value)} />
          </Field>
          <div className="md:col-span-2 xl:col-span-2">
            <Field label="Full Address">
              <Textarea value={form.address_full} onChange={(e) => set('address_full', e.target.value)} placeholder="Street, area, landmark…" />
            </Field>
          </div>
        </div>
      </Section>

      <Section title="Bank Details">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          <Field label="Bank Name">
            <Input value={form.bank_name} onChange={(e) => set('bank_name', e.target.value)} />
          </Field>
          <Field label="Account Holder Name">
            <Input value={form.bank_account_holder} onChange={(e) => set('bank_account_holder', e.target.value)} />
          </Field>
          <Field label="Account Number">
            <Input value={form.bank_account_number} onChange={(e) => set('bank_account_number', e.target.value)} />
          </Field>
          <Field label="IFSC Code">
            <Input value={form.bank_ifsc} onChange={(e) => set('bank_ifsc', e.target.value)} />
          </Field>
          <Field label="Branch Name">
            <Input value={form.bank_branch} onChange={(e) => set('bank_branch', e.target.value)} />
          </Field>
        </div>
      </Section>

      <Section title="Admin Details">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          <Field label="Admin Email">
           <Input
  type="email"
  value={form.admin_email}
  onChange={(e) => set('admin_email', e.target.value)}
  autoComplete="new-email"
/>
          </Field>
          <Field label="Admin Phone">
            <Input value={form.admin_phone} onChange={(e) => set('admin_phone', e.target.value)} />
          </Field>
          <Field label="Admin Password">
<Input
  type="password"
  value={form.admin_password}
  onChange={(e) => set('admin_password', e.target.value)}
  autoComplete="new-password"
/>
</Field>
         
        </div>
      </Section>

      <Section title="Subscription">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          <Field label="Plan Type">
            <Select value={form.plan_id} onChange={(e) => set('plan_id', e.target.value)} required>
              <option value="" disabled>
                Select a plan
              </option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} • {p.currency} {Math.round(p.price_monthly)}/mo
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Employee Limit">
            <Input value={form.employee_limit} onChange={(e) => set('employee_limit', Number(e.target.value))} type="number" min={1} />
          </Field>
          <Field label="Storage Limit (GB)">
            <Input value={form.storage_limit_gb} onChange={(e) => set('storage_limit_gb', Number(e.target.value))} type="number" min={1} />
          </Field>
          <Field label="Trial Days">
            <Input value={form.trial_days} onChange={(e) => set('trial_days', Number(e.target.value))} type="number" min={0} />
          </Field>
          <Field label="Start Date">
            <Input value={form.start_date} onChange={(e) => set('start_date', e.target.value)} type="date" required />
          </Field>
          <Field label="Expiry Date">
            <Input value={form.expiry_date} onChange={(e) => set('expiry_date', e.target.value)} type="date" required />
          </Field>
          <Field label="Status">
            <Select value={form.subscription_status} onChange={(e) => set('subscription_status', e.target.value)}>
              <option value="active">Active</option>
              <option value="trial">Trial</option>
              <option value="expired">Expired</option>
              <option value="suspended">Suspended</option>
            </Select>
          </Field>
        </div>
      </Section>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <NeumoCard className="p-4">
      <div className="mb-3">
        <div className="text-sm font-semibold text-white">{title}</div>
        <div className="text-xs text-white/45">All data is stored in Supabase</div>
      </div>
      {children}
    </NeumoCard>
  );
}
