import { assertTenantScope } from '../clients/tenant-scope';
import { NotFoundError } from '../errors';

export function createDailyLogsMock(db) {
  return {
    /** All published logs for a child, newest first. */
    async listByChild(scope, childId) {
      assertTenantScope(scope);
      const child = db.children.find((c) => c.id === childId);
      if (!child) throw new NotFoundError('Child not found');
      if (child.nurseryId !== scope.nurseryId) {
        throw new NotFoundError('Child not found');
      }
      return db.dailyLogs
        .filter((l) => l.childId === childId && l.publishedAt)
        .sort((a, b) => (a.date < b.date ? 1 : -1));
    },

    /** Single log for a child on a given YYYY-MM-DD, or null if none exists. */
    async getByDate(scope, childId, date) {
      assertTenantScope(scope);
      const log = db.dailyLogs.find(
        (l) => l.childId === childId && l.date === date && l.publishedAt,
      );
      return log ?? null;
    },
  };
}
