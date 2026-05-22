import React, { createContext, useContext, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { createTenantScope } from '../clients/tenant-scope';

const TenantContext = createContext(null);

/**
 * Constructs a TenantScope from the current session and exposes it through
 * context. createTenantScope is module-private to this package; screens cannot
 * fabricate a scope by themselves.
 */
export function TenantProvider({ children }) {
  const { user } = useAuth();
  const scope = useMemo(() => {
    if (!user?.nurseryId) return null;
    return createTenantScope(user.nurseryId);
  }, [user?.nurseryId]);

  return <TenantContext.Provider value={scope}>{children}</TenantContext.Provider>;
}

export function useTenantScope() {
  const scope = useContext(TenantContext);
  if (!scope) throw new Error('useTenantScope requires an active session');
  return scope;
}

export function useOptionalTenantScope() {
  return useContext(TenantContext);
}
