import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  PlusCircle,
  CreditCard,
  LifeBuoy,
  Bell,
  Settings,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { cn } from '../lib/ui';
import { NeumoPanel, NeumoButton } from './Neumo';

const items = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/companies', label: 'Companies', icon: Building2 },
  { to: '/companies/new', label: 'Add Company', icon: PlusCircle },
  { to: '/billing', label: 'Billing', icon: CreditCard },
  { to: '/support', label: 'Support', icon: LifeBuoy },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ onSignOut }: { onSignOut: () => void }) {
  return (
    <NeumoPanel className="sticky top-4 hidden h-[calc(100vh-2rem)] w-[280px] flex-col p-4 lg:flex">
      <div className="flex items-center gap-3 px-2">
        <div className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/10 shadow-[10px_10px_24px_rgba(0,0,0,0.35),-10px_-10px_24px_rgba(255,255,255,0.06)]">
          <Sparkles className="h-5 w-5 text-sky-200" />
        </div>
        <div>
          <div className="text-sm font-semibold text-white">HRMS Super Admin</div>
          <div className="text-xs text-white/45">Owner Console</div>
        </div>
      </div>

      <div className="mt-5 space-y-1">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <NavLink
              key={it.to}
              to={it.to}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-3 rounded-2xl border px-3 py-2 text-sm transition',
                  isActive
                    ? 'border-sky-300/25 bg-sky-400/12 text-white shadow-[10px_10px_24px_rgba(0,0,0,0.35),-10px_-10px_24px_rgba(255,255,255,0.06)]'
                    : 'border-white/0 text-white/70 hover:border-white/10 hover:bg-white/6'
                )
              }
            >
              <Icon className="h-4 w-4" />
              <span>{it.label}</span>
            </NavLink>
          );
        })}
      </div>

      <div className="mt-auto">
        <div className="mb-3 rounded-2xl border border-white/10 bg-white/6 p-3">
          <div className="text-xs font-medium text-white/70">System</div>
          <div className="mt-1 text-xs text-white/45">Neumo + Glass UI • v1</div>
        </div>
        <NeumoButton variant="ghost" className="w-full justify-center" onClick={onSignOut}>
          <LogOut className="h-4 w-4" />
          Sign out
        </NeumoButton>
      </div>
    </NeumoPanel>
  );
}
