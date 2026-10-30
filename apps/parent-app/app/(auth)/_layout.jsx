import { Redirect, Stack, useSegments } from 'expo-router';
import { useAuth } from '@nms/data';

// Invite routes must stay reachable even when a session already exists: an
// invitation deep link (nurseryparent://invitation?token=…) can arrive while a
// stale/previous session is active, and accepting the invite replaces that
// session. Without this exemption the gate below would bounce the deep link to
// /(app) before the invite screen ever renders. Everything else in (auth) is
// sign-in-only and redirects to the app once authenticated.
const SESSION_EXEMPT = new Set(['invitation', 'invite']);

export default function AuthLayout() {
  const { session, bootstrapping } = useAuth();
  const segments = useSegments();
  if (bootstrapping) return null;
  // e.g. ['(auth)', 'invitation'] or ['(auth)', 'invite', '[token]']
  const onInviteRoute = SESSION_EXEMPT.has(segments[1]);
  // Only a parent session is sent into the app; anything else would bounce
  // straight back here and loop.
  if (session && session.user?.role === 'parent' && !onInviteRoute)
    return <Redirect href="/(app)" />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
