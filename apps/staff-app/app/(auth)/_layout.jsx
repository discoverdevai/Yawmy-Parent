import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@nms/data';

export default function AuthLayout() {
  const { session, bootstrapping } = useAuth();
  if (bootstrapping) return null;
  if (session) return <Redirect href="/(app)" />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
