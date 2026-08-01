// Forgot Password — pixel-aligned with Figma `295:4030` + error state `296:4249`.
// All values from MCP get_variable_defs / get_design_context.
import React, { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  Text as RNText,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { SmsIcon, ArrowLeftIcon, ErrorOutlineIcon } from '@nms/ui';
import { useApi } from '@nms/data';
import { forms } from '@nms/schemas';

const C = {
  page: '#FFFFF5',
  card: '#FFFFFF',
  border: '#D8D8D8',
  borderError: '#C90101',
  errorBg: '#FFF6F6',
  ink: '#333333',
  muted: '#535353',
  brand: '#76945C',
};

export default function ForgotPassword() {
  const { t, i18n } = useTranslation(['auth', 'common', 'errors']);
  const api = useApi();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  const fontBold = i18n.language === 'ar' ? 'Amiri-Bold' : 'Lora-Bold';
  const fontMedium = i18n.language === 'ar' ? 'Amiri' : 'Lora-Medium';
  const fontRegular = i18n.language === 'ar' ? 'Amiri' : 'Lora';

  const {
    control,
    handleSubmit,
    setError,
    formState: { isValid },
    watch,
  } = useForm({
    resolver: zodResolver(forms.ForgotPasswordForm),
    defaultValues: { email: '' },
    mode: 'onChange',
  });

  watch((_, { name }) => {
    if (name === 'email' && serverError) setServerError(null);
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true);
    setServerError(null);
    try {
      const { token } = await api.auth.requestPasswordResetOtp(values.email);
      router.push({ pathname: '/(auth)/otp', params: { email: values.email, resetToken: token } });
    } catch (e) {
      if (e?.code === 'email_not_registered') {
        const msg = t('auth:forgotPassword.errorEmailNotRegistered');
        setError('email', { message: msg });
        setServerError(msg);
      } else {
        setServerError(t('errors:generic'));
      }
    } finally {
      setSubmitting(false);
    }
  });

  const submittable = isValid && !submitting && !serverError;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.page }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Top row: back button + title */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <Pressable
            onPress={() => router.back()}
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              borderWidth: 1,
              borderColor: C.border,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: C.card,
            }}
          >
            <ArrowLeftIcon size={24} color={C.ink} strokeWidth={1.5} />
          </Pressable>
          <RNText style={{ fontFamily: fontBold, fontSize: 20, color: C.ink }}>
            {t('auth:forgotPassword.title')}
          </RNText>
        </View>

        {/* Body — gap-24 between illustration block and input */}
        <View style={{ gap: 24, marginTop: 16 }}>
          <View style={{ alignItems: 'center' }}>
            <Image
              source={require('../../assets/illustrations/forgot-password.png')}
              style={{ width: 343, height: 343 }}
              resizeMode="contain"
            />
            <RNText
              style={{
                fontFamily: fontMedium,
                fontSize: 16,
                lineHeight: 24,
                color: C.ink,
                textAlign: 'center',
                paddingHorizontal: 8,
              }}
            >
              {t('auth:forgotPassword.subtitle')}
            </RNText>
          </View>

          <Controller
            control={control}
            name="email"
            render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => {
              const showError = !!error;
              return (
                <View style={{ gap: 8 }}>
                  <View style={{ gap: 12 }}>
                    <RNText style={{ fontFamily: fontMedium, fontSize: 16, color: C.ink }}>
                      {t('auth:forgotPassword.email')}
                    </RNText>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        height: 48,
                        borderWidth: 1,
                        borderRadius: 20,
                        borderColor: showError ? C.borderError : C.border,
                        backgroundColor: showError ? C.errorBg : C.card,
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        gap: 12,
                      }}
                    >
                      <SmsIcon size={24} color={C.muted} />
                      <TextInput
                        value={value ?? ''}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        placeholder={t('auth:forgotPassword.emailPlaceholder')}
                        placeholderTextColor={C.muted}
                        autoCapitalize="none"
                        autoComplete="email"
                        keyboardType="email-address"
                        style={{
                          flex: 1,
                          fontFamily: fontRegular,
                          fontSize: 14,
                          color: C.ink,
                          padding: 0,
                        }}
                      />
                    </View>
                  </View>
                  {showError ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <ErrorOutlineIcon size={20} color={C.borderError} />
                      <RNText style={{ fontFamily: fontMedium, fontSize: 12, color: C.borderError }}>
                        {error.message}
                      </RNText>
                    </View>
                  ) : null}
                </View>
              );
            }}
          />
        </View>
      </ScrollView>

      <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16 }}>
        <Pressable
          onPress={submittable ? onSubmit : undefined}
          style={{
            height: 48,
            borderRadius: 20,
            backgroundColor: C.brand,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: submittable ? 1 : 0.4,
          }}
        >
          <RNText style={{ fontFamily: fontBold, fontSize: 16, color: C.page }}>
            {submitting ? '…' : t('auth:forgotPassword.submit')}
          </RNText>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
