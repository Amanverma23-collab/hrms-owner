import React from 'react';
import { NavLink } from 'react-router-dom';
import { X, LayoutDashboard, Building2, PlusCircle, CreditCard, LifeBuoy, Bell, Settings } from 'lucide-react';
import { cn } from '../lib/ui';

const items = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/companies', label: 'Companies', icon: Building2 },
  { to: '/companies/new', label: 'Add Company', icon: PlusCircle },
  { to: '/billing', label: 'Billing', icon: CreditCard },
  { to: '/support', label: 'Support', icon: LifeBuoy },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function MobileNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute left-3 top-3 h-[calc(100%-24px)] w-[86vw] max-w-[340px] overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020]/85 shadow-[24px_24px_70px_rgba(0,0,0,0.55)]">
        <div className="flex items-center justify-between p-4">
          <div>
            <div className="text-sm font-semibold text-white">HRMS Super Admin</div>
            <div className="text-xs text-white/40">Owner Console</div>
          </div>
          <button
            className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/6 text-white/80"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-1 px-3 pb-4">
          {items.map((it) => {
            const Icon = it.icon;
            return (
              <NavLink
                key={it.to}
                to={it.to}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-2xl border px-3 py-2 text-sm transition',
                    isActive ? 'border-sky-300/25 bg-sky-400/12 text-white' : 'border-white/0 text-white/70 hover:border-white/10 hover:bg-white/6'
                  )
                }
              >
                <Icon className="h-4 w-4" />
                <span>{it.label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </div>
  );
}
