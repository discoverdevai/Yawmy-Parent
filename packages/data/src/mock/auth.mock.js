import { newId } from './db';
import {
  EmailNotRegisteredError,
  InvalidCredentialsError,
  InvalidOtpError,
  InviteExpiredError,
  InviteUsedError,
  NotFoundError,
  OtpExpiredError,
} from '../errors';

const ACCESS_TTL_MS = 24 * 60 * 60 * 1000;
const OTP_TTL_MS = 5 * 60 * 1000;

// In-memory store of pending password-reset OTPs. Real backend will hold
// these server-side and rotate / invalidate per the security spec.
const otpStore = new Map();

const RESET_TOKEN_PREFIX = 'reset_';

export function createAuthMock(db, runtime) {
  return {
    async signIn(email, password) {
      const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (!user) throw new InvalidCredentialsError();
      if (email === db.DEMO_ADMIN_EMAIL && password !== db.DEMO_ADMIN_PASSWORD) {
        throw new InvalidCredentialsError();
      }
      // Demo: any other user accepts password "password123"
      if (email !== db.DEMO_ADMIN_EMAIL && password !== 'password123') {
        throw new InvalidCredentialsError();
      }
      const session = {
        user,
        accessToken: `mock_${user.id}_${Date.now()}`,
        refreshToken: `mock_refresh_${user.id}`,
        expiresAt: new Date(Date.now() + ACCESS_TTL_MS).toISOString(),
      };
      runtime.activeUserId = user.id;
      return session;
    },

    async signOut() {
      runtime.activeUserId = null;
    },

    async signOutAllDevices() {
      runtime.activeUserId = null;
    },

    async changePassword(currentPassword, _newPassword) {
      // Demo: the current password must match the seeded credential.
      const id = runtime.activeUserId;
      const user = id ? db.users.find((u) => u.id === id) : null;
      const expected =
        user && user.email === db.DEMO_ADMIN_EMAIL ? db.DEMO_ADMIN_PASSWORD : 'password123';
      if (currentPassword !== expected) throw new InvalidCredentialsError();
    },

    /**
     * Step 1 of forgot-password: confirms the email is registered, then
     * "sends" an OTP. Mirrors the backend, which keys the whole flow by an
     * opaque reset `token` (not the email). Mock always issues code "1234".
     */
    async requestPasswordResetOtp(email) {
      const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (!user) throw new EmailNotRegisteredError();
      const token = `${RESET_TOKEN_PREFIX}${newId('rst').slice(4)}`;
      otpStore.set(token, {
        email: email.toLowerCase(),
        code: '1234',
        expiresAt: Date.now() + OTP_TTL_MS,
        verified: false,
      });
      return { token, resendAvailableInSeconds: 30 };
    },

    /**
     * Step 2: verify the 4-digit code against the reset token. Marks the token
     * verified; echoes it back so the screen can carry it to set-password.
     */
    async verifyOtp(resetToken, code) {
      const entry = otpStore.get(resetToken);
      if (!entry) throw new InvalidOtpError();
      if (Date.now() > entry.expiresAt) {
        otpStore.delete(resetToken);
        throw new OtpExpiredError();
      }
      if (entry.code !== code) throw new InvalidOtpError();
      entry.verified = true;
      return { resetToken };
    },

    /**
     * Re-issue an OTP for the same reset token (the "Resend code" action).
     */
    async resendResetOtp(resetToken) {
      const entry = otpStore.get(resetToken);
      if (!entry) throw new InvalidOtpError();
      entry.code = '1234';
      entry.expiresAt = Date.now() + OTP_TTL_MS;
      entry.verified = false;
      return { token: resetToken, resendAvailableInSeconds: 30 };
    },

    /**
     * Step 3: complete the reset using the verified reset token.
     */
    async completePasswordReset(resetToken, _newPassword) {
      const entry = otpStore.get(resetToken);
      if (!entry) throw new InvalidOtpError();
      if (Date.now() > entry.expiresAt) {
        otpStore.delete(resetToken);
        throw new OtpExpiredError();
      }
      // Mock backend silently accepts the new password — no real DB change.
      otpStore.delete(resetToken);
    },

    async forgotPassword(_email) {
      // Legacy alias for the older link-based flow. Kept so admin auth keeps
      // working unchanged.
    },

    async resetPassword(_token, _newPassword) {
      // No-op in mock.
    },

    async validateInvite(token) {
      const invite = db.invites.find((i) => i.token === token);
      if (!invite) throw new NotFoundError('Invite not found');
      if (invite.consumedAt) throw new InviteUsedError();
      if (new Date(invite.expiresAt).getTime() < Date.now()) throw new InviteExpiredError();
      const nursery = db.nurseries.find((n) => n.id === invite.nurseryId);
      return { nursery, invite };
    },

    async acceptInvite(token, _password) {
      const invite = db.invites.find((i) => i.token === token);
      if (!invite) throw new NotFoundError('Invite not found');
      if (invite.consumedAt) throw new InviteUsedError();
      if (new Date(invite.expiresAt).getTime() < Date.now()) throw new InviteExpiredError();
      invite.consumedAt = new Date().toISOString();
      const user = {
        id: newId('usr'),
        nurseryId: invite.nurseryId,
        role: invite.invitedRole,
        email: invite.invitedEmail,
        name: invite.invitedName,
        phone: null,
        locale: 'en',
        active: true,
        createdAt: new Date().toISOString(),
      };
      db.users.push(user);
      runtime.activeUserId = user.id;
      return {
        user,
        accessToken: `mock_${user.id}_${Date.now()}`,
        refreshToken: `mock_refresh_${user.id}`,
        expiresAt: new Date(Date.now() + ACCESS_TTL_MS).toISOString(),
      };
    },

    async me() {
      const id = runtime.activeUserId;
      if (!id) throw new NotFoundError('No active session');
      const user = db.users.find((u) => u.id === id);
      if (!user) throw new NotFoundError('User not found');
      return user;
    },
  };
}
