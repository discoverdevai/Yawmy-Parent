import { Redirect, Stack } from 'expo-router';
import { useAuth, TenantProvider } from '@nms/data';

export default function AppLayout() {
  const { session, bootstrapping, user } = useAuth();
  if (bootstrapping) return null;
  if (!session) return <Redirect href="/(auth)/sign-in" />;

  // Role-aware initial route. Teacher route group will be added in Phase 2.
  const initialRoute = user?.role === 'admin' ? '(admin)' : '(admin)';

  return (
    <TenantProvider>
      <Stack screenOptions={{ headerShown: false }} initialRouteName={initialRoute} />
    </TenantProvider>
  );
}
