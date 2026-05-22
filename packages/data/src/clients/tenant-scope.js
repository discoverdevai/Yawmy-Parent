import { TenantViolationError } from '../errors';

const TENANT_BRAND = Symbol('TenantScope');

/**
 * @typedef {Readonly<{ nurseryId: string, [TENANT_BRAND]: true }>} TenantScope
 */

/**
 * Construct a TenantScope. Only call this from inside TenantContext, after the
 * server has validated the session — never from screens. The Symbol brand is
 * module-private, so client code that imports the type cannot fabricate one.
 *
 * @param {string} nurseryId
 * @returns {TenantScope}
 */
export function createTenantScope(nurseryId) {
  if (typeof nurseryId !== 'string' || nurseryId.length === 0) {
    throw new TenantViolationError('createTenantScope requires a nurseryId');
  }
  return Object.freeze({ nurseryId, [TENANT_BRAND]: true });
}

/**
 * @param {unknown} scope
 * @returns {asserts scope is TenantScope}
 */
export function assertTenantScope(scope) {
  if (!scope || scope[TENANT_BRAND] !== true) {
    throw new TenantViolationError('TenantScope was not created via createTenantScope');
  }
}

/**
 * Validates a resource belongs to the active tenant.
 *
 * @template T
 * @param {TenantScope} scope
 * @param {{ nurseryId: string } | null | undefined} resource
 * @returns {T}
 */
export function assertResourceInScope(scope, resource) {
  assertTenantScope(scope);
  if (!resource) return resource;
  if (resource.nurseryId && resource.nurseryId !== scope.nurseryId) {
    throw new TenantViolationError(
      `Resource ${resource.nurseryId} does not belong to tenant ${scope.nurseryId}`,
    );
  }
  return resource;
}
