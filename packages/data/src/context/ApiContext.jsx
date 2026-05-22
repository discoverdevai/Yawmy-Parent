import React, { createContext, useContext, useMemo } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { createMockClients } from '../mock';
import { createQueryClient, attachPersistence } from '../query';

const ApiContext = createContext(null);

/**
 * Provides the API clients + QueryClient to the React tree. In dev / when
 * NMS_USE_MOCKS=true, this constructs the mock adapter; otherwise (future) a
 * real REST client adapter would be plugged in here without touching screens.
 */
export function ApiProvider({ children, useMocks = true, mockOptions }) {
  const value = useMemo(() => {
    const queryClient = createQueryClient();
    attachPersistence(queryClient);
    const { clients, db } = useMocks
      ? createMockClients(mockOptions ?? {})
      : { clients: null, db: null };
    if (!clients) {
      throw new Error('Real API client not yet wired. Set NMS_USE_MOCKS=true.');
    }
    return { clients, db, queryClient };
  }, [useMocks, mockOptions]);

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
