import { Redirect } from 'expo-router';
import { useAuth } from '@nms/data';

export default function Index() {
  const { session, bootstrapping } = useAuth();
  if (bootstrapping) return null;
  return <Redirect href={session ? '/(app)' : '/(auth)/sign-in'} />;
}
