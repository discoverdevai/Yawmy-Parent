import { newId } from './db';
import { assertTenantScope, assertResourceInScope } from '../clients/tenant-scope';
import { NotFoundError } from '../errors';

export function createEventsMock(db) {
  return {
    async list(scope) {
      assertTenantScope(scope);
      return db.events
        .filter((e) => e.nurseryId === scope.nurseryId)
        .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
    },
    async create(scope, input) {
      assertTenantScope(scope);
      const e = {
        id: newId('evt'),
        nurseryId: scope.nurseryId,
        kind: input.kind,
        title: input.title,
        description: input.description ?? '',
        startsAt: input.startsAt,
        endsAt: input.endsAt ?? null,
        recurrenceRule: input.recurrenceRule ?? null,
        scopeRoomIds: input.scopeRoomIds ?? null,
        createdAt: new Date().toISOString(),
      };
      db.events.push(e);
      return e;
    },
    async update(scope, id, patch) {
      assertTenantScope(scope);
      const e = db.events.find((x) => x.id === id);
      if (!e) throw new NotFoundError('Event not found');
      assertResourceInScope(scope, e);
      Object.assign(e, patch);
      return e;
    },
    async remove(scope, id) {
      assertTenantScope(scope);
      const idx = db.events.findIndex((x) => x.id === id && x.nurseryId === scope.nurseryId);
      if (idx >= 0) db.events.splice(idx, 1);
    },
  };
}
