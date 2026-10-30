import React, { createContext, useContext, useMemo, useRef, useCallback } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { createRestAuthClient } from '../clients/rest/auth.rest';
import { createRestParentClient } from '../clients/rest/parent.rest';
import { createQueryClient, purgePersistedCache } from '../query';

const ApiContext = createContext(null);
const isDev = typeof __DEV__ !== 'undefined' && __DEV__;

/** Origin ("https://host:port") of a URL, or null when it isn't an absolute http(s) URL. */
function originOf(url) {
  const m = /^(https?:\/\/[^/?#]+)/i.exec(String(url ?? ''));
  return m ? m[1].toLowerCase() : null;
}

/**
 * Provides the API clients + QueryClient to the React tree.
 *
 * With `apiBaseUrl` set, only the real REST clients exist (auth + parent data,
 * which includes chat). The mock adapter is a development convenience: it is
 * used only in a dev build with no API URL, and a release build without an API
 * URL fails loudly instead of silently showing fake children to real parents.
 *
 * Token seam: the access token only exists after sign-in, but the clients are
 * built up front. So we hold the live token in a ref and hand the REST clients a
 * lazy `getToken` getter; `AuthProvider` pushes the token into the ref via
 * `useApiTokenSink()`, registers how to renew the session via
 * `useApiRefreshSink()`, and what to do when renewal fails via
 * `useApiAuthFailureSink()`.
 */
export function ApiProvider({ children, apiBaseUrl = null, mockOptions }) {
  const tokenRef = useRef(null);
  const authFailureRef = useRef(null);
  const refreshRef = useRef(null);

  const setActiveToken = useCallback((token) => {
    tokenRef.current = token ?? null;
  }, []);

  const setAuthFailureHandler = useCallback((fn) => {
    authFailureRef.current = typeof fn === 'function' ? fn : null;
  }, []);

  const setRefreshHandler = useCallback((fn) => {
    refreshRef.current = typeof fn === 'function' ? fn : null;
  }, []);

  const value = useMemo(() => {
    const queryClient = createQueryClient();
    // The query cache holds children's medical notes, incidents and chat. It is
    // kept in memory only; any copy an older build wrote to disk is removed.
    purgePersistedCache();

    const getToken = () => tokenRef.current;
    let clients;
    let db = null;
    if (typeof apiBaseUrl === 'string' && apiBaseUrl) {
      const onUnauthorized = () => authFailureRef.current?.();
      const refreshAuth = () => (refreshRef.current ? refreshRef.current() : Promise.resolve(null));
      clients = {
        auth: createRestAuthClient(apiBaseUrl, { getToken }),
        parent: createRestParentClient(apiBaseUrl, { getToken, onUnauthorized, refreshAuth }),
      };
    } else if (isDev) {
      // Required lazily so the faker-backed mock DB is only built in dev.
      const { createMockClients } = require('../mock');
      ({ clients, db } = createMockClients(mockOptions ?? {}));
    } else {
      throw new Error(
        'API base URL is not configured. Set EXPO_PUBLIC_API_BASE_URL for this build.',
      );
    }

    const apiOrigin = originOf(apiBaseUrl);
    // Headers for loaders that bypass the REST clients (<Image>, audio, file
    // download). The token is attached ONLY when the URL points at our own
    // backend, so a URL from a deep link or message can never receive it.
    const authHeadersFor = (url) => {
      const token = tokenRef.current;
      if (!token || !apiOrigin || originOf(url) !== apiOrigin) return undefined;
      return { Authorization: `Bearer ${token}` };
    };

    return {
      clients,
      db,
      queryClient,
      setActiveToken,
      setAuthFailureHandler,
      setRefreshHandler,
      apiBaseUrl,
      apiOrigin,
      getAccessToken: getToken,
      authHeadersFor,
      // Stable identity: screens put this in effect deps, and a fresh object per
      // render used to tear down and reopen the chat socket in a loop.
      socketConfig: { baseUrl: apiBaseUrl, getToken },
      clearCache: () => {
        queryClient.cancelQueries();
        queryClient.clear();
        purgePersistedCache();
      },
    };
  }, [apiBaseUrl, mockOptions, setActiveToken, setAuthFailureHandler, setRefreshHandler]);

  return (
    <ApiContext.Provider value={value}>
      <QueryClientProvider client={value.queryClient}>{children}</QueryClientProvider>
    </ApiContext.Provider>
  );
}

function useApiContext(name) {
  const ctx = useContext(ApiContext);
  if (!ctx) throw new Error(`${name} must be used inside <ApiProvider>`);
  return ctx;
}

export function useApi() {
  return useApiContext('useApi').clients;
}

export function useMockDb() {
  const ctx = useContext(ApiContext);
  return ctx?.db ?? null;
}

/** Setter that pushes the current access token into the REST client token seam. */
export function useApiTokenSink() {
  return useApiContext('useApiTokenSink').setActiveToken;
}

/** Setter for the handler invoked when the session can no longer be renewed. */
export function useApiAuthFailureSink() {
  return useApiContext('useApiAuthFailureSink').setAuthFailureHandler;
}

/** Setter for the single-flight session renewal (returns the new access token or null). */
export function useApiRefreshSink() {
  return useApiContext('useApiRefreshSink').setRefreshHandler;
}

/** Clears every cached query (memory and any disk copy). Used on sign-out. */
export function useClearApiCache() {
  return useApiContext('useClearApiCache').clearCache;
}

/**
 * What the chat socket needs and the REST clients cannot supply: the API origin
 * and a lazy token getter. The object identity is stable for the app's life.
 */
export function useChatSocketConfig() {
  return useApiContext('useChatSocketConfig').socketConfig;
}

/**
 * Returns `headersFor(url)`: auth headers for a URL on our backend, undefined for
 * any other URL. Use it for `<Image source>`, the audio player and downloads.
 */
export function useAuthHeadersFor() {
  return useApiContext('useAuthHeadersFor').authHeadersFor;
}

/** The backend origin, for code that needs to tell our URLs from foreign ones. */
export function useApiOrigin() {
  return useApiContext('useApiOrigin').apiOrigin;
}

/**
 * @deprecated Attaches the token regardless of host. Use `useAuthHeadersFor()`
 * and pass the URL, so the token is only ever sent to the backend.
 */
export function useAuthFileHeaders() {
  const ctx = useApiContext('useAuthFileHeaders');
  const token = ctx.getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}
