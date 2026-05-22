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

    /**
     * Step 1 of forgot-password: confirms the email is registered, then
     * "sends" an OTP. Mock always issues code "1234" with a 5-minute TTL.
     */
    async requestPasswordResetOtp(email) {
      const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (!user) throw new EmailNotRegisteredError();
      otpStore.set(email.toLowerCase(), {
        code: '1234',
        expiresAt: Date.now() + OTP_TTL_MS,
      });
      return { resendAvailableInSeconds: 30 };
    },

    /**
     * Step 2: verify the 4-digit code. Returns a short-lived reset token
     * that must be presented when the user submits a new password.
     */
    async verifyOtp(email, code) {
      const entry = otpStore.get(email.toLowerCase());
      if (!entry) throw new InvalidOtpError();
      if (Date.now() > entry.expiresAt) {
        otpStore.delete(email.toLowerCase());
        throw new OtpExpiredError();
      }
      if (entry.code !== code) throw new InvalidOtpError();
      const resetToken = `${RESET_TOKEN_PREFIX}${newId('rst').slice(4)}`;
      entry.resetToken = resetToken;
      entry.resetTokenExpiresAt = Date.now() + OTP_TTL_MS;
      return { resetToken };
    },

    /**
     * Step 3: complete the reset using the token returned from verifyOtp.
     */
    async completePasswordReset(resetToken, _newPassword) {
      let matchedEntry = null;
      let matchedEmail = null;
      for (const [email, entry] of otpStore.entries()) {
        if (entry.resetToken === resetToken) {
          matchedEntry = entry;
          matchedEmail = email;
          break;
        }
      }
      if (!matchedEntry || !matchedEntry.resetTokenExpiresAt) throw new InvalidOtpError();
      if (Date.now() > matchedEntry.resetTokenExpiresAt) throw new OtpExpiredError();
      // Mock backend silently accepts the new password — no real DB change.
      otpStore.delete(matchedEmail);
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
