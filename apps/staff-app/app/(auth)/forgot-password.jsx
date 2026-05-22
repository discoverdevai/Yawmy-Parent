import React, { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Mail, MailCheck } from 'lucide-react-native';
import { Screen, Text, Button, FormInput, BackButton } from '@nms/ui';
import { useApi } from '@nms/data';
import { forms } from '@nms/schemas';

export default function ForgotPassword() {
  const { t } = useTranslation(['auth', 'common']);
  const api = useApi();
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { control, handleSubmit } = useForm({
    resolver: zodResolver(forms.ForgotPasswordForm),
    defaultValues: { email: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true);
    try {
      await api.auth.forgotPassword(values.email);
      setSent(true);
    } finally {
      setSubmitting(false);
    }
  });

  if (sent) {
    return (
      <Screen
        footer={
          <Button block onPress={() => router.replace('/(auth)/sign-in')}>
            {t('common:actions.continue')}
          </Button>
        }
      >
        <View className="flex-1 items-center justify-center pt-20">
          <View className="h-40 w-40 items-center justify-center rounded-full bg-brand-primary-50 mb-6">
            <MailCheck size={72} color="#84A664" />
          </View>
          <Text variant="heading" weight="bold" className="mb-2 text-center">
            {t('auth:forgotPassword.successTitle')}
          </Text>
          <Text tone="muted" className="text-center px-2">
            {t('auth:forgotPassword.successBody')}
          </Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen
      footer={
        <Button block onPress={onSubmit} loading={submitting}>
          {t('auth:forgotPassword.submit')}
        </Button>
      }
    >
      <View className="flex-row items-center gap-3 mb-6">
        <BackButton />
        <Text variant="heading" weight="bold">
          {t('auth:forgotPassword.title')}
        </Text>
      </View>

      <Text tone="muted" className="mb-8">
        {t('auth:forgotPassword.subtitle')}
      </Text>

      <FormInput
        control={control}
        name="email"
        label={t('auth:forgotPassword.email')}
        placeholder={t('auth:forgotPassword.email')}
        leadingIcon={<Mail size={18} color="#84A664" />}
        autoCapitalize="none"
        keyboardType="email-address"
      />
    </Screen>
  );
}
