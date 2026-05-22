import '../global.css';
import React, { useEffect, useState } from 'react';
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
import {
  useFonts as useAmiri,
  Amiri_400Regular,
  Amiri_700Bold,
} from '@expo-google-fonts/amiri';
import { ApiProvider, AuthProvider } from '@nms/data';
import { bootstrapI18n } from '@nms/i18n/bootstrap';

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

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ApiProvider>
          <AuthProvider>
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: '#FFFFF5' },
              }}
            >
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(app)" />
            </Stack>
          </AuthProvider>
        </ApiProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
