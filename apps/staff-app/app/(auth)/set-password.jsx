import React, { useState } from 'react';
import { View, Image, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { router, useLocalSearchParams } from 'expo-router';
import { Lock, Eye, EyeOff } from 'lucide-react-native';
import { Screen, Text, Button, FormInput, BackButton, Dialog } from '@nms/ui';
import { useAuth, useApi } from '@nms/data';
import { forms } from '@nms/schemas';

export default function SetPassword() {
  const { t } = useTranslation(['auth', 'common', 'errors']);
  const { acceptInvite } = useAuth();
  const api = useApi();
  const params = useLocalSearchParams();
  const inviteToken = params.token;

  const [hidePw1, setHidePw1] = useState(true);
  const [hidePw2, setHidePw2] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activated, setActivated] = useState(false);

  const { control, handleSubmit } = useForm({
    resolver: zodResolver(forms.SetPasswordForm),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true);
    try {
      if (inviteToken) {
        await acceptInvite(inviteToken, values.newPassword);
      } else {
        await api.auth.resetPassword('reset-token-stub', values.newPassword);
      }
      setActivated(true);
    } catch (e) {
      Alert.alert(t('errors:generic'), e.message ?? '');
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <Screen>
      <View className="flex-row items-center gap-3 mb-6">
        <BackButton />
        <Text variant="heading" weight="bold">
          {t('auth:setPassword.title')}
        </Text>
      </View>

      <View className="items-center mb-6">
        <View className="h-48 w-48 items-center justify-center rounded-full bg-brand-primary-50">
          <Lock size={72} color="#84A664" />
        </View>
      </View>

      <View className="self-center rounded-3xl bg-surface-card px-6 py-3 mb-4 border border-neutral-200">
        <Text weight="bold" className="tracking-wider">
          {t('auth:setPassword.title').toUpperCase()}
        </Text>
      </View>

      <Text tone="muted" className="text-center mb-8">
        {t('auth:setPassword.subtitle', 'Create a secure password to access your account.')}
      </Text>

      <FormInput
        control={control}
        name="newPassword"
        label={t('auth:setPassword.newPassword')}
        placeholder={t('auth:setPassword.newPassword')}
        secureTextEntry={hidePw1}
        leadingIcon={<Lock size={18} color="#84A664" />}
        trailingIcon={
          <Eye
            size={18}
            color="#A1A1AA"
            onPress={() => setHidePw1((v) => !v)}
          />
        }
        className="mb-4"
      />
      <FormInput
        control={control}
        name="confirmPassword"
        label={t('auth:setPassword.confirmPassword')}
        placeholder={t('auth:setPassword.confirmPassword')}
        secureTextEntry={hidePw2}
        leadingIcon={<Lock size={18} color="#84A664" />}
        trailingIcon={
          <EyeOff
            size={18}
            color="#A1A1AA"
            onPress={() => setHidePw2((v) => !v)}
          />
        }
        className="mb-8"
      />

      <Button block onPress={onSubmit} loading={submitting}>
        {t('auth:setPassword.submit')}
      </Button>

      <Dialog visible={activated}>
        <View className="items-center">
          <View className="h-20 w-20 items-center justify-center rounded-full bg-brand-accent-50 mb-4">
            <Text variant="display">{'👍'}</Text>
          </View>
          <Text variant="title" weight="bold" className="mb-2 text-center">
            {t('auth:setPassword.successTitle')}
          </Text>
          <Text tone="muted" className="text-center mb-6">
            {t('auth:setPassword.successBody')}
          </Text>
          <Button
            block
            onPress={() => {
              setActivated(false);
              router.replace('/(app)');
            }}
          >
            {t('common:actions.continue')}
          </Button>
        </View>
      </Dialog>
    </Screen>
  );
}
