import React, { createContext, useContext, useMemo } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { createMockClients } from '../mock';
import { createRestAuthClient } from '../clients/rest/auth.rest';
import { createQueryClient, attachPersistence } from '../query';

const ApiContext = createContext(null);

/**
 * Provides the API clients + QueryClient to the React tree. In dev / when
 * NMS_USE_MOCKS=true, this constructs the mock adapter; otherwise (future) a
 * real REST client adapter would be plugged in here without touching screens.
 *
 * When `apiBaseUrl` is set, we run a hybrid mode: the `auth` client talks to
 * the real backend (so we can test the real login flow) while every other
 * client still serves mock data. This lets us validate `/api/auth/login`
 * before the full REST adapter is built.
 */
export function ApiProvider({ children, useMocks = true, apiBaseUrl = null, mockOptions }) {
  const value = useMemo(() => {
    const queryClient = createQueryClient();
    attachPersistence(queryClient);
    const { clients, db } = useMocks
      ? createMockClients(mockOptions ?? {})
      : { clients: null, db: null };
    if (!clients) {
      throw new Error('Real API client not yet wired. Set NMS_USE_MOCKS=true.');
    }
    if (typeof apiBaseUrl === 'string' && apiBaseUrl) {
      clients.auth = createRestAuthClient(apiBaseUrl);
    }
    return { clients, db, queryClient };
  }, [useMocks, apiBaseUrl, mockOptions]);

  return (
    <ApiContext.Provider value={value}>
      <QueryClientProvider client={value.queryClient}>{children}</QueryClientProvider>
    </ApiContext.Provider>
  );
}

export function useApi() {
  const ctx = useContext(ApiContext);
  if (!ctx) throw new Error('useApi must be used inside <ApiProvider>');
  return ctx.clients;
}

export function useMockDb() {
  const ctx = useContext(ApiContext);
  return ctx?.db ?? null;
}
