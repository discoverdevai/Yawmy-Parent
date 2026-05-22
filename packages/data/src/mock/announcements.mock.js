import { newId } from './db';
import { assertTenantScope, assertResourceInScope } from '../clients/tenant-scope';
import { NotFoundError } from '../errors';

export function createAnnouncementsMock(db, runtime) {
  return {
    async list(scope) {
      assertTenantScope(scope);
      return db.announcements
        .filter((a) => a.nurseryId === scope.nurseryId)
        .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
    },
    async create(scope, input) {
      assertTenantScope(scope);
      const ann = {
        id: newId('ann'),
        nurseryId: scope.nurseryId,
        authorId: runtime.activeUserId ?? db.demoAdminId,
        scope: input.scope,
        title: input.title,
        content: input.content,
        publishedAt: new Date().toISOString(),
        seenByUserIds: [],
      };
      db.announcements.push(ann);
      return ann;
    },
    async update(scope, id, patch) {
      assertTenantScope(scope);
      const a = db.announcements.find((x) => x.id === id);
      if (!a) throw new NotFoundError('Announcement not found');
      assertResourceInScope(scope, a);
      Object.assign(a, patch);
      return a;
    },
    async remove(scope, id) {
      assertTenantScope(scope);
      const idx = db.announcements.findIndex((x) => x.id === id && x.nurseryId === scope.nurseryId);
      if (idx >= 0) db.announcements.splice(idx, 1);
    },
  };
}
