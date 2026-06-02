import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './AppShell';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Companies from './pages/Companies';
import AddCompany from './pages/AddCompany';
import CompanyDetails from './pages/CompanyDetails';
import Billing from './pages/Billing';
import Support from './pages/Support';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import { getAuth } from './lib/auth';
import EditCompany from './pages/EditCompany';

export default function App() {
  const [authed, setAuthed] = useState<boolean>(() => !!getAuth());

  useEffect(() => {
    const onStorage = () => setAuthed(!!getAuth());
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            authed ? (
              <Navigate to="/" replace />
            ) : (
              <Login
                onAuthed={() => {
                  setAuthed(true);
                }}
              />
            )
          }
        />

        <Route
          path="/"
          element={authed ? <AppShell /> : <Navigate to="/login" replace />}
        >
          <Route index element={<Dashboard />} />
          <Route path="companies" element={<Companies />} />
          <Route path="companies/new" element={<AddCompany />} />
          <Route path="companies/edit/:id" element={<EditCompany />} />
          <Route path="companies/:id" element={<CompanyDetails />} />
          <Route path="billing" element={<Billing />} />
          <Route path="support" element={<Support />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to={authed ? '/' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
