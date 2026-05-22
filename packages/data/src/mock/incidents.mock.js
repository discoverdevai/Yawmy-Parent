import { assertTenantScope, assertResourceInScope } from '../clients/tenant-scope';
import { NotFoundError } from '../errors';

export function createIncidentsMock(db) {
  return {
    async list(scope) {
      assertTenantScope(scope);
      return db.incidents.filter((i) => i.nurseryId === scope.nurseryId);
    },
    async get(scope, id) {
      assertTenantScope(scope);
      const i = db.incidents.find((x) => x.id === id);
      if (!i) throw new NotFoundError('Incident not found');
      return assertResourceInScope(scope, i);
    },
  };
}
