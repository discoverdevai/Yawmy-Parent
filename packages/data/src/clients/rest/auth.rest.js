import { InvalidCredentialsError } from '../../errors';

// Real REST auth client. Validates credentials against the Spring backend
// (`POST /api/auth/login` then `GET /api/auth/me`) and assembles the `Session`
// shape AuthContext expects ({ user, accessToken, refreshToken, expiresAt }).
//
// This is intentionally narrow: only sign-in is wired to the real backend so
// we can test the login flow end-to-end. Every other data call still goes
// through the in-memory mock layer until the full REST adapter lands.

// Backend role enum (PARENT/TEACHER/ADMIN/SUPER_ADMIN) -> app role string.
// The parent app's (app) layout gate compares against lowercase 'parent'.
const ROLE_MAP = {
  PARENT: 'parent',
  TEACHER: 'teacher',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
};

export function createRestAuthClient(baseUrl) {
  const root = String(baseUrl).replace(/\/+$/, '');

  async function getJson(path, token) {
    const res = await fetch(`${root}${path}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error(`GET ${path} failed (${res.status})`);
    return res.json();
  }

  const notWired = (name) => async () => {
    throw new Error(`auth.${name} is not wired to the real backend yet`);
  };

  return {
    async signIn(email, password) {
      let res;
      try {
        res = await fetch(`${root}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
      } catch (e) {
        // Network/DNS/refused — almost always the backend isn't reachable at
        // the configured base URL (wrong host for the platform, server down).
        console.warn(`[auth] login request failed — backend reachable at ${root}? ${e?.message}`);
        throw new Error('Cannot reach the server.');
      }

      if (res.status === 401 || res.status === 403) {
        throw new InvalidCredentialsError();
      }
      if (!res.ok) {
        console.warn(`[auth] login returned HTTP ${res.status}`);
        throw new Error(`Login failed (${res.status})`);
      }

      // { accessToken, refreshToken, tokenType, expiresInSeconds }
      const tokens = await res.json();
      // { id, email, fullName, role, locale }
      const profile = await getJson('/api/auth/me', tokens.accessToken);

      const user = {
        id: profile.id,
        email: profile.email,
        name: profile.fullName,
        role: ROLE_MAP[profile.role] ?? String(profile.role ?? '').toLowerCase(),
        locale: String(profile.locale ?? 'en').toLowerCase(),
        // /me doesn't return a nurseryId; left null so TenantProvider yields a
        // null scope rather than a bogus one.
        nurseryId: profile.nurseryId ?? null,
      };

      return {
        user,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: new Date(Date.now() + (tokens.expiresInSeconds ?? 1800) * 1000).toISOString(),
      };
    },

    // Local sign-out is enough for testing; the bearer token isn't threaded
    // here, so we skip the optional `POST /api/auth/logout` call. AuthContext
    // clears the stored session regardless.
    async signOut() {},
    async signOutAllDevices() {},

    me: notWired('me'),
    forgotPassword: notWired('forgotPassword'),
    resetPassword: notWired('resetPassword'),
    validateInvite: notWired('validateInvite'),
    acceptInvite: notWired('acceptInvite'),
  };
}
