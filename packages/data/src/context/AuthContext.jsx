import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useApi, useApiTokenSink, useApiAuthFailureSink } from './ApiContext';

let secureStore = null;
try {
  secureStore = require('expo-secure-store');
} catch {
  secureStore = null;
}

const AuthContext = createContext(null);
const SESSION_KEY = 'nms.session';

async function readStoredSession() {
  if (!secureStore?.getItemAsync) return null;
  try {
    const raw = await secureStore.getItemAsync(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

async function writeStoredSession(session) {
  if (!secureStore?.setItemAsync) return;
  if (session) {
    await secureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
  } else {
    await secureStore.deleteItemAsync?.(SESSION_KEY);
  }
}

export function AuthProvider({ children }) {
  const api = useApi();
  const setActiveToken = useApiTokenSink();
  const setAuthFailureHandler = useApiAuthFailureSink();
  const [session, setSession] = useState(null);
  const [bootstrapping, setBootstrapping] = useState(true);

  useEffect(() => {
    (async () => {
      const stored = await readStoredSession();
      if (stored) {
        setSession(stored);
      }
      setBootstrapping(false);
    })();
  }, []);

  // Keep the REST client token seam in sync with the session so data clients
  // can attach the bearer token. Covers bootstrap, sign-in, accept-invite, and
  // sign-out (token becomes null).
  useEffect(() => {
    setActiveToken(session?.accessToken ?? null);
  }, [session, setActiveToken]);

  // Clear the session locally when a data call reports the token is no longer
  // valid (no backend logout call — the token is already dead).
  useEffect(() => {
    const onFailure = () => {
      setSession(null);
      writeStoredSession(null);
    };
    setAuthFailureHandler(onFailure);
    return () => setAuthFailureHandler(null);
  }, [setAuthFailureHandler]);

  const signIn = useCallback(
    async (email, password) => {
      const next = await api.auth.signIn(email, password);
      setSession(next);
      await writeStoredSession(next);
      return next;
    },
    [api],
  );

  const signOut = useCallback(async () => {
    await api.auth.signOut();
    setSession(null);
    await writeStoredSession(null);
  }, [api]);

  const signOutAllDevices = useCallback(async () => {
    await api.auth.signOutAllDevices();
    setSession(null);
    await writeStoredSession(null);
  }, [api]);

  const acceptInvite = useCallback(
    async (token, password) => {
      const next = await api.auth.acceptInvite(token, password);
      setSession(next);
      await writeStoredSession(next);
      return next;
    },
    [api],
  );

  const value = {
    session,
    user: session?.user ?? null,
    bootstrapping,
    signIn,
    signOut,
    signOutAllDevices,
    acceptInvite,
  };
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
