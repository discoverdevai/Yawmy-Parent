import '../global.css';
import React, { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts as useLora,
  Lora_400Regular,
  Lora_500Medium,
  Lora_700Bold,
} from '@expo-google-fonts/lora';
import { useFonts as useAmiri, Amiri_400Regular, Amiri_700Bold } from '@expo-google-fonts/amiri';
import Constants from 'expo-constants';
import { ApiProvider, AuthProvider, useAuth } from '@nms/data';
import { bootstrapI18n } from '@nms/i18n/bootstrap';

// Dev-only demo mode: with no API URL in a development build, silently open a
// seeded mock parent session so the UI can be browsed offline. Never runs in a
// release build, and never when a real API is configured.
function DemoSessionGate({ children, enabled }) {
  const { session, bootstrapping, signIn } = useAuth();
  const [ready, setReady] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    // Only seed a demo session in mock mode. When a real API base URL is set,
    // auto-logging in with demo creds would (best case) fail with a pointless
    // network round-trip on every boot, or (worst case, if such a user exists
    // in the real DB) silently sign someone in — so skip it entirely and let
    // the normal sign-in / invitation flow drive.
    if (!enabled) {
      setReady(true);
      return;
    }
    if (bootstrapping || started.current) return;
    started.current = true;
    if (session) {
      setReady(true);
      return;
    }
    (async () => {
      try {
        await signIn('parent@nms.local', 'password123');
      } catch (e) {
        if (__DEV__) console.warn('[demo] auto sign-in failed', e);
      } finally {
        setReady(true);
      }
    })();
  }, [enabled, bootstrapping, session, signIn]);

  if (!ready) return null;
  return children;
}

// Resolve the API base URL for the real auth client. Prefer an inlined
// EXPO_PUBLIC_ env var (most reliable across platforms — Metro statically
// inlines it), then fall back to the value surfaced via app.config.js -> extra.
// Both are guarded to a non-empty string so a misconfigured value can never
// reach fetch() as "[object Object]". Unset => fully mock (auth + data).
function resolveApiBaseUrl() {
  const fromEnv = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (typeof fromEnv === 'string' && fromEnv.trim()) return fromEnv.trim();

  const fromExtra = Constants.expoConfig?.extra?.apiBaseUrl;
  if (typeof fromExtra === 'string' && fromExtra.trim()) return fromExtra.trim();

  if (fromExtra != null && __DEV__) {
    console.warn('[config] extra.apiBaseUrl is not a usable string:', fromExtra);
  }
  return null;
}

const API_BASE_URL = resolveApiBaseUrl();
if (__DEV__) console.log('[config] API_BASE_URL =', API_BASE_URL ?? '(none — using mock auth)');

SplashScreen.preventAutoHideAsync().catch(() => {});

// We register Lora under multiple aliases so legacy code that references
// `PTSerif` keeps working without a change. Recoleta (the Figma font) is a
// paid commercial face; Lora is the closest free Google Fonts equivalent
// and shares similar humanist proportions.
export default function RootLayout() {
  const [i18nReady, setI18nReady] = useState(false);
  const [latinLoaded] = useLora({
    PTSerif: Lora_400Regular,
    'PTSerif-Bold': Lora_700Bold,
    Lora: Lora_400Regular,
    'Lora-Medium': Lora_500Medium,
    'Lora-Bold': Lora_700Bold,
  });
  const [arabicLoaded] = useAmiri({
    Amiri: Amiri_400Regular,
    'Amiri-Bold': Amiri_700Bold,
  });

  useEffect(() => {
    (async () => {
      try {
        const { reloading } = await bootstrapI18n();
        if (reloading) return;
      } catch (e) {
        console.warn('i18n bootstrap failed', e);
      } finally {
        setI18nReady(true);
      }
    })();
  }, []);

  const ready = i18nReady && latinLoaded && arabicLoaded;
  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  if (!ready) return null;

  // A release build must talk to the real backend. Without an API URL it would
  // otherwise have nothing to show, so say so instead of failing silently.
  if (!API_BASE_URL && !__DEV__) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          backgroundColor: '#FFFFF5',
        }}
      >
        <Text style={{ fontSize: 16, textAlign: 'center', color: '#333333' }}>
          This build is missing its server address. Please install the latest version of the app.
        </Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ApiProvider apiBaseUrl={API_BASE_URL}>
          <AuthProvider>
            <DemoSessionGate enabled={__DEV__ && !API_BASE_URL}>
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: '#FFFFF5' },
                }}
              >
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(app)" />
              </Stack>
            </DemoSessionGate>
          </AuthProvider>
        </ApiProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
