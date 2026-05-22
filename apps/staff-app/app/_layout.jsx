import '../global.css';
import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts as usePTSerif, PTSerif_400Regular, PTSerif_700Bold } from '@expo-google-fonts/pt-serif';
import { useFonts as useAmiri, Amiri_400Regular, Amiri_700Bold } from '@expo-google-fonts/amiri';
import { ApiProvider, AuthProvider } from '@nms/data';
import { bootstrapI18n } from '@nms/i18n/bootstrap';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [i18nReady, setI18nReady] = useState(false);
  const [latinLoaded] = usePTSerif({
    PTSerif: PTSerif_400Regular,
    'PTSerif-Bold': PTSerif_700Bold,
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
                contentStyle: { backgroundColor: '#FBF8EC' },
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
