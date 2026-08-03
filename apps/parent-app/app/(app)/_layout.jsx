import { Redirect, Stack } from 'expo-router';
import { useAuth, TenantProvider } from '@nms/data';
import { ActiveChildProvider } from '../../lib/active-child';

export default function AppLayout() {
  const { session, bootstrapping, user } = useAuth();
  if (bootstrapping) return null;
  if (!session) return <Redirect href="/(auth)/sign-in" />;
  // Single-role app — anyone signed in here is treated as a parent. Defensive
  // redirect: a non-parent user (e.g. admin) should not land in the parent app.
  if (user && user.role !== 'parent') {
    return <Redirect href="/(auth)/sign-in" />;
  }
  return (
    <TenantProvider>
      <ActiveChildProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </ActiveChildProvider>
    </TenantProvider>
  );
}
