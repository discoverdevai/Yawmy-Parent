import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { Screen, Text, Button, FormInput } from '@nms/ui';
import { useAuth } from '@nms/data';
import { forms } from '@nms/schemas';
import { changeLocale } from '@nms/i18n/bootstrap';

export default function SignIn() {
  const { t, i18n } = useTranslation(['auth', 'common', 'errors']);
  const { signIn } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [hidePw, setHidePw] = useState(true);

  const { control, handleSubmit } = useForm({
    resolver: zodResolver(forms.SignInForm),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true);
    try {
      await signIn(values.email, values.password);
      router.replace('/(app)');
    } catch {
      Alert.alert(t('errors:generic'), t('auth:signIn.errorInvalid'));
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <Screen
      footer={
        <View>
          <Button block onPress={onSubmit} loading={submitting}>
            {t('auth:signIn.submit')}
          </Button>
          <Button
            variant="link"
            block
            onPress={() => router.push('/(auth)/forgot-password')}
            className="mt-2"
          >
            {t('auth:signIn.forgotPassword')}
          </Button>
        </View>
      }
    >
      <Text variant="display" weight="bold" className="mb-2 mt-4">
        {t('auth:signIn.title')}
      </Text>
      <Text tone="muted" className="mb-8">
        {t('auth:signIn.subtitle')}
      </Text>

      <FormInput
        control={control}
        name="email"
        label={t('auth:signIn.email')}
        placeholder={t('auth:signIn.email')}
        leadingIcon={<Mail size={18} color="#84A664" />}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        className="mb-4"
      />
      <FormInput
        control={control}
        name="password"
        label={t('auth:signIn.password')}
        placeholder={t('auth:signIn.password')}
        leadingIcon={<Lock size={18} color="#84A664" />}
        trailingIcon={
          hidePw ? (
            <Eye size={18} color="#A1A1AA" onPress={() => setHidePw(false)} />
          ) : (
            <EyeOff size={18} color="#A1A1AA" onPress={() => setHidePw(true)} />
          )
        }
        secureTextEntry={hidePw}
        className="mb-4"
      />

      <Button
        variant="ghost"
        block
        className="mt-4"
        onPress={async () => {
          const next = i18n.language === 'ar' ? 'en' : 'ar';
          await changeLocale(next);
        }}
      >
        {t('common:switchLanguage')}
      </Button>
    </Screen>
  );
}
