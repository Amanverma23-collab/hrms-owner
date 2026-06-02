import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell, Search, Menu } from 'lucide-react';
import { NeumoCard, Input } from './Neumo';

const titleByPath: Array<[RegExp, string]> = [
  [/^\/$/, 'Dashboard'],
  [/^\/companies$/, 'Company Management'],
  [/^\/companies\/new$/, 'Add Company'],
  [/^\/companies\/.+/, 'Company Details'],
  [/^\/billing$/, 'Billing & Subscriptions'],
  [/^\/support$/, 'Support Center'],
  [/^\/notifications$/, 'Notifications'],
  [/^\/settings$/, 'Platform Settings'],
];

export function Topbar({ onOpenMobileNav }: { onOpenMobileNav: () => void }) {
  const loc = useLocation();
  const title = titleByPath.find(([re]) => re.test(loc.pathname))?.[1] ?? 'Owner Console';

  return (
    <NeumoCard className="mb-4 flex items-center justify-between gap-3 p-3">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileNav}
          className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/6 text-white/80 lg:hidden"
          aria-label="Open navigation"
        >
          <Menu className="h-4 w-4" />
        </button>
        <div>
          <div className="text-sm font-semibold text-white">{title}</div>
          <div className="text-xs text-white/40">Enterprise-grade HRMS platform controls</div>
        </div>
      </div>

      <div className="hidden w-[520px] items-center gap-3 md:flex">
        <div className="relative w-full">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
          <Input placeholder="Quick search (companies, invoices, tickets)…" className="pl-9" />
        </div>
        <Link
          to="/notifications"
          className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/6 text-white/80 hover:bg-white/10"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
        </Link>
      </div>
    </NeumoCard>
  );
}
