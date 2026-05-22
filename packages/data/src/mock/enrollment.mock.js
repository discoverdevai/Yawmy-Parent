import { newId } from './db';
import { assertTenantScope } from '../clients/tenant-scope';

const INVITE_TTL_HOURS = 48;

function randomInviteToken() {
  return Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10);
}

export function createEnrollmentMock(db) {
  return {
    async inviteStaff(scope, input) {
      assertTenantScope(scope);
      const invite = {
        token: randomInviteToken(),
        nurseryId: scope.nurseryId,
        invitedRole: input.role,
        invitedEmail: input.email,
        invitedName: input.name,
        expiresAt: new Date(Date.now() + INVITE_TTL_HOURS * 3600 * 1000).toISOString(),
        consumedAt: null,
      };
      db.invites.push(invite);
      return invite;
    },
    async inviteParent(scope, input) {
      assertTenantScope(scope);
      const invite = {
        token: randomInviteToken(),
        nurseryId: scope.nurseryId,
        invitedRole: 'parent',
        invitedEmail: input.email,
        invitedName: input.name,
        expiresAt: new Date(Date.now() + INVITE_TTL_HOURS * 3600 * 1000).toISOString(),
        consumedAt: null,
      };
      db.invites.push(invite);
      // Note: child linking happens when the parent accepts the invite. For
      // simplicity in mock, we link immediately.
      for (const childId of input.childIds) {
        const child = db.children.find((c) => c.id === childId);
        if (child) {
          // We can't add a guardianId yet because the user hasn't been
          // created. Stub by creating a placeholder user.
          const placeholder = {
            id: newId('usr'),
            nurseryId: scope.nurseryId,
            role: 'parent',
            email: input.email,
            name: input.name,
            phone: input.phone ?? null,
            locale: 'en',
            active: false,
            createdAt: new Date().toISOString(),
          };
          db.users.push(placeholder);
          child.guardianIds.push(placeholder.id);
        }
      }
      return invite;
    },
    async listUsers(scope) {
      assertTenantScope(scope);
      return db.users.filter((u) => u.nurseryId === scope.nurseryId);
    },
  };
}
