import { newId } from './db';
import { assertTenantScope, assertResourceInScope } from '../clients/tenant-scope';
import { NotFoundError } from '../errors';

export function createChildrenMock(db) {
  return {
    async list(scope, params = {}) {
      assertTenantScope(scope);
      let items = db.children.filter((c) => c.nurseryId === scope.nurseryId && c.enrolled);
      if (params.roomId) items = items.filter((c) => c.roomId === params.roomId);
      return items;
    },
    async get(scope, id) {
      assertTenantScope(scope);
      const c = db.children.find((x) => x.id === id);
      if (!c) throw new NotFoundError('Child not found');
      return assertResourceInScope(scope, c);
    },
    async create(scope, input) {
      assertTenantScope(scope);
      const child = {
        id: newId('chd'),
        nurseryId: scope.nurseryId,
        roomId: input.roomId ?? null,
        name: input.name,
        photoUrl: input.photoUrl ?? null,
        dateOfBirth: input.dateOfBirth,
        allergies: input.allergies ?? [],
        medicalNotes: input.medicalNotes ?? '',
        immunization: input.immunization ?? [],
        pickupContacts: input.pickupContacts ?? [],
        guardianIds: input.guardianIds ?? [],
        enrolled: true,
        createdAt: new Date().toISOString(),
      };
      db.children.push(child);
      if (child.roomId) {
        const room = db.rooms.find((r) => r.id === child.roomId);
        if (room) room.childIds.push(child.id);
      }
      return child;
    },
    async update(scope, id, patch) {
      const child = await this.get(scope, id);
      Object.assign(child, patch);
      return child;
    },
    async unenroll(scope, id) {
      const child = await this.get(scope, id);
      child.enrolled = false;
    },
    async addPickupContact(scope, id, contact) {
      const child = await this.get(scope, id);
      const created = { id: newId('pkc'), ...contact };
      child.pickupContacts.push(created);
      return created;
    },
    async removePickupContact(scope, id, contactId) {
      const child = await this.get(scope, id);
      child.pickupContacts = child.pickupContacts.filter((p) => p.id !== contactId);
    },
  };
}
