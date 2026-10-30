import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from 'react';
import {
  useApi,
  useApiTokenSink,
  useApiAuthFailureSink,
  useApiRefreshSink,
  useClearApiCache,
} from './ApiContext';
import { NotParentAccountError } from '../errors';

let secureStore = null;
try {
  secureStore = require('expo-secure-store');
} catch {
  secureStore = null;
}

const AuthContext = createContext(null);
const SESSION_KEY = 'nms.session';

// Keep the session on this device only: not in iCloud/Google backups, not
// restored onto a new phone, unreadable while the device is locked.
const STORE_OPTIONS = secureStore?.WHEN_UNLOCKED_THIS_DEVICE_ONLY
  ? { keychainAccessible: secureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY }
  : undefined;

async function readStoredSession() {
  if (!secureStore?.getItemAsync) return null;
  try {
    const raw = await secureStore.getItemAsync(SESSION_KEY, STORE_OPTIONS);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

async function writeStoredSession(session) {
  if (!secureStore?.setItemAsync) return;
  try {
    if (session) {
      await secureStore.setItemAsync(SESSION_KEY, JSON.stringify(session), STORE_OPTIONS);
    } else {
      await secureStore.deleteItemAsync?.(SESSION_KEY, STORE_OPTIONS);
    }
  } catch {
    /* storage unavailable (e.g. web without SecureStore) — memory session still works */
  }
}

// This app is for parents only. Staff accounts belong in the Staff app; letting
// them in here used to bounce between the two route guards forever.
function assertParent(session) {
  if (session?.user?.role && session.user.role !== 'parent') {
    throw new NotParentAccountError();
  }
}

export function AuthProvider({ children }) {
  const api = useApi();
  const setActiveToken = useApiTokenSink();
  const setAuthFailureHandler = useApiAuthFailureSink();
  const setRefreshHandler = useApiRefreshSink();
  const clearCache = useClearApiCache();
  const [session, setSessionState] = useState(null);
  const [bootstrapping, setBootstrapping] = useState(true);
  const sessionRef = useRef(null);
  const refreshInFlight = useRef(null);

  // One place that updates memory, the REST token seam and storage together.
  // The token seam is updated synchronously so a request replayed right after a
  // refresh already carries the new token.
  const applySession = useCallback(
    async (next) => {
      sessionRef.current = next ?? null;
      setActiveToken(next?.accessToken ?? null);
      setSessionState(next ?? null);
      await writeStoredSession(next ?? null);
    },
    [setActiveToken],
  );

  const endSessionLocally = useCallback(async () => {
    refreshInFlight.current = null;
    await applySession(null);
    clearCache();
  }, [applySession, clearCache]);

  useEffect(() => {
    (async () => {
      const stored = await readStoredSession();
      if (stored && stored.user?.role === 'parent') {
        sessionRef.current = stored;
        setActiveToken(stored.accessToken ?? null);
        setSessionState(stored);
      } else if (stored) {
        await writeStoredSession(null);
      }
      setBootstrapping(false);
    })();
  }, [setActiveToken]);

  // Single-flight renewal: every request that hits an expired token waits on
  // the same refresh instead of each rotating the refresh token in turn.
  useEffect(() => {
    const refresh = () => {
      if (refreshInFlight.current) return refreshInFlight.current;
      const current = sessionRef.current;
      if (!current?.refreshToken || typeof api.auth.refresh !== 'function') {
        return Promise.resolve(null);
      }
      refreshInFlight.current = (async () => {
        try {
          const next = await api.auth.refresh(current);
          if (!next) return null;
          await applySession(next);
          return next.accessToken;
        } catch {
          return null;
        } finally {
          refreshInFlight.current = null;
        }
      })();
      return refreshInFlight.current;
    };
    setRefreshHandler(refresh);
    return () => setRefreshHandler(null);
  }, [api, applySession, setRefreshHandler]);

  // The session could not be renewed: end it locally (the tokens are dead, so
  // there is nothing to revoke on the backend).
  useEffect(() => {
    setAuthFailureHandler(() => {
      endSessionLocally();
    });
    return () => setAuthFailureHandler(null);
  }, [setAuthFailureHandler, endSessionLocally]);

  const signIn = useCallback(
    async (email, password) => {
      const next = await api.auth.signIn(email, password);
      try {
        assertParent(next);
      } catch (e) {
        await api.auth.signOut?.(next.refreshToken);
        throw e;
      }
      clearCache();
      await applySession(next);
      return next;
    },
    [api, applySession, clearCache],
  );

  const signOut = useCallback(async () => {
    const current = sessionRef.current;
    await api.auth.signOut(current?.refreshToken);
    await endSessionLocally();
  }, [api, endSessionLocally]);

  const signOutAllDevices = useCallback(async () => {
    await api.auth.signOutAllDevices();
    await endSessionLocally();
  }, [api, endSessionLocally]);

  const acceptInvite = useCallback(
    async (token, password) => {
      const next = await api.auth.acceptInvite(token, password);
      try {
        assertParent(next);
      } catch (e) {
        await api.auth.signOut?.(next.refreshToken);
        throw e;
      }
      clearCache();
      await applySession(next);
      return next;
    },
    [api, applySession, clearCache],
  );

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      bootstrapping,
      signIn,
      signOut,
      signOutAllDevices,
      acceptInvite,
    }),
    [session, bootstrapping, signIn, signOut, signOutAllDevices, acceptInvite],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

export function useSession() {
  return useAuth().session;
}
