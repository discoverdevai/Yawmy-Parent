import { newId } from './db';
import { assertTenantScope, assertResourceInScope } from '../clients/tenant-scope';
import { NotFoundError } from '../errors';

export function createRoomsMock(db) {
  return {
    async list(scope) {
      assertTenantScope(scope);
      return db.rooms.filter((r) => r.nurseryId === scope.nurseryId);
    },
    async get(scope, id) {
      assertTenantScope(scope);
      const r = db.rooms.find((x) => x.id === id);
      if (!r) throw new NotFoundError('Room not found');
      return assertResourceInScope(scope, r);
    },
    async create(scope, input) {
      assertTenantScope(scope);
      const room = {
        id: newId('rm'),
        nurseryId: scope.nurseryId,
        name: input.name,
        ageRange: input.ageRange ?? null,
        capacity: input.capacity ?? null,
        teacherIds: input.teacherIds ?? [],
        childIds: [],
        archived: false,
        createdAt: new Date().toISOString(),
      };
      db.rooms.push(room);
      return room;
    },
    async update(scope, id, patch) {
      const room = await this.get(scope, id);
      Object.assign(room, patch);
      return room;
    },
    async archive(scope, id) {
      const room = await this.get(scope, id);
      room.archived = true;
    },
    async assignTeachers(scope, id, teacherIds) {
      const room = await this.get(scope, id);
      room.teacherIds = teacherIds;
      return room;
    },
  };
}
