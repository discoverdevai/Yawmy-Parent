import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { router, useLocalSearchParams } from 'expo-router';
import { ImageIcon, ClipboardX } from 'lucide-react-native';
import { Screen, Text, Button } from '@nms/ui';
import { useApi } from '@nms/data';

export default function InviteLanding() {
  const { t } = useTranslation(['auth', 'common', 'errors']);
  const api = useApi();
  const params = useLocalSearchParams();
  const token = String(params.token ?? '');

  const [state, setState] = useState({ kind: 'loading' });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!token) {
        if (!cancelled) setState({ kind: 'error', code: 'missing' });
        return;
      }
      try {
        const result = await api.auth.validateInvite(token);
        if (!cancelled) setState({ kind: 'ready', nursery: result.nursery, invite: result.invite });
      } catch (e) {
        if (!cancelled) setState({ kind: 'error', code: e.code ?? 'invalid' });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [api, token]);

  if (state.kind === 'loading') {
    return (
      <Screen scrollable={false}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#84A664" />
          <Text tone="muted" className="mt-3">
            {t('auth:invite.loading')}
          </Text>
        </View>
      </Screen>
    );
  }

  if (state.kind === 'error') {
    return (
      <Screen
        scrollable={false}
        footer={
          <Button block variant="primary" onPress={() => router.replace('/(auth)/sign-in')}>
            {t('common:actions.back')}
          </Button>
        }
      >
        <View className="flex-1 items-center justify-center px-2">
          <View className="h-56 w-56 items-center justify-center rounded-full bg-brand-accent-50 mb-6">
            <ClipboardX size={96} color="#D85540" />
          </View>
          <Text variant="heading" weight="bold" className="mb-2 text-center">
            {t('auth:invite.expiredTitle')}
          </Text>
          <Text tone="muted" className="text-center px-4">
            {t('auth:invite.expiredBody')}
          </Text>
        </View>
      </Screen>
    );
  }

  // Ready: Welcome to <nursery name>
  return (
    <Screen
      scrollable={false}
      footer={
        <Button
          block
          onPress={() => router.replace({ pathname: '/(auth)/set-password', params: { token } })}
        >
          {t('common:actions.continue')}
        </Button>
      }
    >
      <View className="flex-1 items-center justify-center px-2">
        <View className="h-72 w-72 items-center justify-center rounded-3xl bg-neutral-200 mb-8">
          <ImageIcon size={96} color="#71717A" strokeWidth={1.5} />
        </View>
        <Text variant="heading" weight="bold" className="mb-2 text-center">
          {t('auth:invite.welcome', { nurseryName: state.nursery.name })}
        </Text>
        <Text tone="muted" className="text-center px-4">
          {t('auth:invite.subtitle')}
        </Text>
      </View>
    </Screen>
  );
}
