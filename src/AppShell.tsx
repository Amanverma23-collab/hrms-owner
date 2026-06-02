import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { MobileNav } from './components/MobileNav';
import { getAuth, signOut } from './lib/auth';

export default function AppShell() {
  const nav = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const a = getAuth();
    if (!a) nav('/login');
  }, []);

  const onSignOut = () => {
    signOut();
    nav('/login');
  };

  return (
    <div className="min-h-screen bg-[#070a12] text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -left-40 top-[-140px] h-[520px] w-[520px] rounded-full bg-sky-500/16 blur-[90px]" />
        <div className="absolute -right-40 top-[120px] h-[520px] w-[520px] rounded-full bg-violet-500/14 blur-[90px]" />
        <div className="absolute left-[25%] top-[65%] h-[620px] w-[620px] rounded-full bg-emerald-500/8 blur-[110px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_20%,rgba(255,255,255,0.09),transparent_42%),radial-gradient(circle_at_80%_40%,rgba(56,189,248,0.10),transparent_50%),radial-gradient(circle_at_20%_90%,rgba(139,92,246,0.10),transparent_48%)]" />
      </div>

      <div className="relative mx-auto max-w-[1400px] px-4 py-4">
        <div className="flex items-start gap-4">
          <Sidebar onSignOut={onSignOut} />
          <div className="min-w-0 flex-1">
            <Topbar onOpenMobileNav={() => setMobileOpen(true)} />
            <Outlet />
          </div>
        </div>
      </div>

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </div>
  );
}
