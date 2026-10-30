import {
  InvalidCredentialsError,
  InviteExpiredError,
  InviteUsedError,
  NotFoundError,
  EmailNotRegisteredError,
  InvalidOtpError,
  OtpExpiredError,
} from '../../errors';
import { createHttp, HttpError } from './http';

// Real REST auth client, wired to the Spring backend. Covers the whole auth
// surface the parent app uses: sign-in, the invitation accept flow, the
// OTP-based password reset flow, change-password, logout, and /me. Other data
// domains (children, attendance, …) get their own REST clients that share the
// same createHttp helper + token seam.

// Backend role enum (PARENT/TEACHER/ADMIN/SUPER_ADMIN) -> app role string.
// The parent app's (app) layout gate compares against lowercase 'parent'.
const ROLE_MAP = {
  PARENT: 'parent',
  TEACHER: 'teacher',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
};

function mapRole(role) {
  return ROLE_MAP[role] ?? String(role ?? '').toLowerCase();
}

// Shape the backend `/api/auth/me` (MeResponse) into the app's `user` object.
function buildUser(profile) {
  return {
    id: profile.id,
    email: profile.email,
    name: profile.fullName,
    role: mapRole(profile.role),
    locale: String(profile.locale ?? 'en').toLowerCase(),
    imageUrl: profile.imageUrl ?? null,
    // MeResponse does not carry a nurseryId; parent data endpoints are keyed by
    // the JWT + childId and don't need a tenant scope, so null is correct here.
    nurseryId: profile.nurseryId ?? null,
  };
}

// Assemble the `Session` AuthContext persists from a TokenResponse + profile.
function sessionFrom(tokens, profile) {
  return {
    user: buildUser(profile),
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    expiresAt: new Date(Date.now() + (tokens.expiresInSeconds ?? 1800) * 1000).toISOString(),
  };
}

function lc(body) {
  return String(body ?? '').toLowerCase();
}

export function createRestAuthClient(baseUrl, { getToken, onUnauthorized } = {}) {
  // Auth endpoints never auto-sign-out on 401 (a 401 there is a real answer,
  // e.g. bad credentials), so we don't pass onUnauthorized to this http.
  const http = createHttp(baseUrl, { getToken });
  void onUnauthorized;

  // Fetch the profile with an explicit token — used right after login/accept,
  // before the new session token is threaded through getToken.
  function fetchProfile(token) {
    return http.get('/api/auth/me', { auth: false, headers: { Authorization: `Bearer ${token}` } });
  }

  return {
    async signIn(email, password) {
      let tokens;
      try {
        tokens = await http.post('/api/auth/login', { email, password }, { auth: false });
      } catch (e) {
        if (e instanceof HttpError && (e.status === 401 || e.status === 403)) {
          throw new InvalidCredentialsError();
        }
        throw e;
      }
      const profile = await fetchProfile(tokens.accessToken);
      return sessionFrom(tokens, profile);
    },

    // Best-effort backend revocation; AuthContext clears the local session
    // regardless. With no refresh token in the body the backend revokes all of
    // this user's sessions, which is the safe default for a sign-out.
    async signOut() {
      try {
        await http.post('/api/auth/logout', {});
      } catch {
        /* offline / already-invalid token — local sign-out still proceeds */
      }
    },
    async signOutAllDevices() {
      try {
        await http.post('/api/auth/logout-all', undefined);
      } catch {
        /* best-effort */
      }
    },

    async me() {
      const profile = await http.get('/api/auth/me');
      return buildUser(profile);
    },

    async changePassword(currentPassword, newPassword) {
      try {
        await http.post('/api/auth/change-password', { currentPassword, newPassword });
      } catch (e) {
        if (e instanceof HttpError && (e.status === 400 || e.status === 401)) {
          throw new InvalidCredentialsError();
        }
        throw e;
      }
    },

    // ---- OTP password reset flow ----------------------------------------
    // The backend keys the whole flow by an opaque reset `token` returned from
    // forgot-password; the screens thread it through as `resetToken`.

    async requestPasswordResetOtp(email) {
      try {
        const r = await http.post('/api/auth/forgot-password', { email }, { auth: false });
        return { token: r.token, resendAvailableInSeconds: r.expiresInSeconds };
      } catch (e) {
        if (e instanceof HttpError && e.status === 404) throw new EmailNotRegisteredError();
        throw e;
      }
    },

    async verifyOtp(resetToken, code) {
      try {
        await http.post(
          '/api/auth/verify-reset-otp',
          { token: resetToken, otp: code },
          { auth: false },
        );
        return { resetToken };
      } catch (e) {
        if (e instanceof HttpError && e.status === 400) {
          throw lc(e.body).includes('expired') ? new OtpExpiredError() : new InvalidOtpError();
        }
        throw e;
      }
    },

    async resendResetOtp(resetToken) {
      const r = await http.post(
        '/api/auth/resend-reset-otp',
        { token: resetToken },
        { auth: false },
      );
      return { token: r.token, resendAvailableInSeconds: r.expiresInSeconds };
    },

    async completePasswordReset(resetToken, newPassword) {
      try {
        await http.post(
          '/api/auth/reset-password',
          { token: resetToken, newPassword },
          { auth: false },
        );
      } catch (e) {
        if (e instanceof HttpError && e.status === 400) {
          throw lc(e.body).includes('expired') ? new OtpExpiredError() : new InvalidOtpError();
        }
        throw e;
      }
    },

    // Legacy link-based aliases kept so any older flow keeps compiling.
    async forgotPassword() {},
    async resetPassword() {},

    // ---- Invitation accept flow -----------------------------------------

    async validateInvite(token) {
      let data;
      try {
        data = await http.get(`/api/auth/invite?token=${encodeURIComponent(token)}`, {
          auth: false,
        });
      } catch (e) {
        if (e instanceof HttpError) throw new Error(`Invite check failed (${e.status})`);
        throw e;
      }
      switch (data.status) {
        case 'VALID':
          break;
        case 'EXPIRED':
          throw new InviteExpiredError();
        case 'USED':
          throw new InviteUsedError();
        default: // INVALID or unexpected
          throw new NotFoundError('Invite not found');
      }
      return {
        nursery: { name: data.nurseryName ?? null },
        invite: {
          token,
          invitedEmail: data.email,
          invitedName: data.fullName,
          invitedRole: mapRole(data.role),
          expiresAt: data.expiresAt,
        },
      };
    },

    async acceptInvite(token, password) {
      let tokens;
      try {
        tokens = await http.post('/api/auth/accept-invite', { token, password }, { auth: false });
      } catch (e) {
        if (e instanceof HttpError) {
          const hint = lc(e.body);
          if (hint.includes('used')) throw new InviteUsedError();
          if (hint.includes('expired')) throw new InviteExpiredError();
          // A 401/403 means the invite lapsed or was used mid-flow.
          if (e.status === 401 || e.status === 403) throw new InviteExpiredError();
          throw new Error(`Accept invite failed (${e.status})`);
        }
        throw e;
      }
      const profile = await fetchProfile(tokens.accessToken);
      return sessionFrom(tokens, profile);
    },
  };
}
