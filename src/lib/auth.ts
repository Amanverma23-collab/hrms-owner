const AUTH_KEY = 'saas_super_admin_session_v1';

export type AuthState = {
  email: string;
  remember: boolean;
  issuedAt: number;
};

export function getAuth(): AuthState | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.email) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function setAuth(state: AuthState | null) {
  if (!state) {
    localStorage.removeItem(AUTH_KEY);
    return;
  }
  localStorage.setItem(AUTH_KEY, JSON.stringify(state));
}

export function signOut() {
  setAuth(null);
}
