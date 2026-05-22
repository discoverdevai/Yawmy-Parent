import { assertResourceInScope, assertTenantScope } from '../clients/tenant-scope';
import { NotFoundError } from '../errors';

export function createNurseryMock(db) {
  function lookup(scope) {
    assertTenantScope(scope);
    const n = db.nurseries.find((x) => x.id === scope.nurseryId);
    if (!n) throw new NotFoundError('Nursery not found');
    return n;
  }
  return {
    async get(scope) {
      return assertResourceInScope(scope, lookup(scope));
    },
    async update(scope, patch) {
      const n = lookup(scope);
      Object.assign(n, patch);
      return n;
    },
    async updateGeofence(scope, geofence) {
      const n = lookup(scope);
      n.geofence = geofence;
      return n;
    },
  };
}
