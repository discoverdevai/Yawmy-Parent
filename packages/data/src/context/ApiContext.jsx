import React, { createContext, useContext, useMemo, useRef, useCallback } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { createMockClients } from '../mock';
import { createRestAuthClient } from '../clients/rest/auth.rest';
import { createRestParentClient } from '../clients/rest/parent.rest';
import { createQueryClient, attachPersistence } from '../query';

const ApiContext = createContext(null);

/**
 * Provides the API clients + QueryClient to the React tree. In dev / when
 * NMS_USE_MOCKS=true, this constructs the mock adapter; otherwise a real REST
 * client adapter is plugged in here without touching screens.
 *
 * When `apiBaseUrl` is set, the real REST clients are wired in (auth today;
 * data domains as they come online). Every other client still serves mock data
 * until its REST adapter lands.
 *
 * Token seam: the access token only exists after sign-in, but the clients are
 * built here up front. So we hold the live token in a ref and hand the REST
 * clients a lazy `getToken` getter; `AuthProvider` pushes the token into the
 * ref via `useApiTokenSink()` whenever the session changes. This lets any REST
 * client attach `Authorization: Bearer …` without the provider tree being
 * reordered around the session.
 */
export function ApiProvider({ children, useMocks = true, apiBaseUrl = null, mockOptions }) {
  const tokenRef = useRef(null);
  const authFailureRef = useRef(null);

  const setActiveToken = useCallback((token) => {
    tokenRef.current = token ?? null;
  }, []);

  const setAuthFailureHandler = useCallback((fn) => {
    authFailureRef.current = typeof fn === 'function' ? fn : null;
  }, []);

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
      const getToken = () => tokenRef.current;
      // A 401/403 on an authenticated data call means the session is no longer
      // valid (backend revokes by disabling the user) — end it.
      const onUnauthorized = () => authFailureRef.current?.();
      clients.auth = createRestAuthClient(apiBaseUrl, { getToken });
      clients.parent = createRestParentClient(apiBaseUrl, { getToken, onUnauthorized });
      // Further REST data domains plug in here as they come online.
    }
    return {
      clients,
      db,
      queryClient,
      setActiveToken,
      setAuthFailureHandler,
      // The chat socket cannot go through the REST clients: its handshake is a
      // WebSocket upgrade, not a fetch, and it needs the token in the query
      // string. Both come from here so the screens have one source for them.
      apiBaseUrl,
      getAccessToken: () => tokenRef.current,
    };
  }, [useMocks, apiBaseUrl, mockOptions, setActiveToken, setAuthFailureHandler]);

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

/**
 * Returns the setter that pushes the current access token into the REST client
 * token seam. AuthProvider calls this whenever the session changes so REST
 * clients can attach the bearer token to their requests.
 */
export function useApiTokenSink() {
  const ctx = useContext(ApiContext);
  if (!ctx) throw new Error('useApiTokenSink must be used inside <ApiProvider>');
  return ctx.setActiveToken;
}

/**
 * Returns the setter for the handler invoked when a REST data call gets a
 * 401/403 (session no longer valid). AuthProvider registers its sign-out here.
 */
export function useApiAuthFailureSink() {
  const ctx = useContext(ApiContext);
  if (!ctx) throw new Error('useApiAuthFailureSink must be used inside <ApiProvider>');
  return ctx.setAuthFailureHandler;
}

/**
 * What the chat socket needs and the REST clients cannot supply: the API origin
 * and a lazy token getter. Returns a null baseUrl in mock mode, which the socket
 * treats as "no server" and the screens handle by polling nothing.
 */
export function useChatSocketConfig() {
  const ctx = useContext(ApiContext);
  if (!ctx) throw new Error('useChatSocketConfig must be used inside <ApiProvider>');
  return { baseUrl: ctx.apiBaseUrl, getToken: ctx.getAccessToken };
}

/**
 * Auth headers for loaders that bypass the REST clients — `<Image source>`, the
 * audio player, a file download.
 *
 * Every `/api/files/**` path requires authentication, and none of those loaders
 * go through `createHttp`. Without the header they get a 403 and render as an
 * empty box or refuse to play, with nothing on screen to say why.
 *
 * Returns undefined when there is no session, which is also the right value to
 * spread into a source object: no header rather than an empty one.
 */
export function useAuthFileHeaders() {
  const ctx = useContext(ApiContext);
  if (!ctx) throw new Error('useAuthFileHeaders must be used inside <ApiProvider>');
  const token = ctx.getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}
