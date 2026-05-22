import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@nms/data';

export default function AdminLayout() {
  const { user } = useAuth();
  if (user && user.role !== 'admin') {
    return <Redirect href="/(app)" />;
  }
  return <Stack screenOptions={{ headerShown: false }} />;
}
