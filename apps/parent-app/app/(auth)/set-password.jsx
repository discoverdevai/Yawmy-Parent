// Set Password — pixel-aligned with Figma `279:20892` (and reused for the
// reset-password flow). Includes the activated-success dialog `279:21026`.
import React, { useState } from 'react';
import {
  Alert,
  Image,
  Modal,
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
import { router, useLocalSearchParams } from 'expo-router';
import { LockIcon, EyeIcon, EyeOffIcon, ArrowLeftIcon } from '@nms/ui';
import { useApi, useAuth } from '@nms/data';
import { forms } from '@nms/schemas';

const C = {
  page: '#FFFFF5',
  card: '#FFFFFF',
  border: '#D8D8D8',
  borderError: '#C90101',
  ink: '#333333',
  muted: '#535353',
  brand: '#76945C',
  scrim: 'rgba(0,0,0,0.5)',
};

function PasswordField({ name, control, label, secure, onToggleSecure }) {
  const { t, i18n } = useTranslation(['auth']);
  const fontMedium = i18n.language === 'ar' ? 'Amiri' : 'Lora-Medium';
  const fontRegular = i18n.language === 'ar' ? 'Amiri' : 'Lora';
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
        <View style={{ gap: 12 }}>
          <RNText style={{ fontFamily: fontMedium, fontSize: 16, color: C.ink }}>
            {label}
          </RNText>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              height: 48,
              borderWidth: 1,
              borderRadius: 20,
              borderColor: error ? C.borderError : C.border,
              backgroundColor: C.card,
              paddingHorizontal: 12,
              paddingVertical: 8,
              gap: 12,
            }}
          >
            <LockIcon size={24} color={C.muted} />
            <TextInput
              value={value ?? ''}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder={t('auth:setPassword.passwordPlaceholder')}
              placeholderTextColor={C.muted}
              secureTextEntry={secure}
              style={{ flex: 1, fontFamily: fontRegular, fontSize: 14, color: C.ink, padding: 0 }}
            />
            <Pressable onPress={onToggleSecure} hitSlop={10}>
              {secure ? (
                <EyeOffIcon size={20} color={C.muted} />
              ) : (
                <EyeIcon size={20} color={C.muted} />
              )}
            </Pressable>
          </View>
          {error ? (
            <RNText style={{ fontFamily: fontRegular, fontSize: 12, color: C.borderError }}>
              {error.message}
            </RNText>
          ) : null}
        </View>
      )}
    />
  );
}

export default function SetPassword() {
  const { t, i18n } = useTranslation(['auth', 'common', 'errors']);
  const api = useApi();
  const { acceptInvite } = useAuth();
  const params = useLocalSearchParams();
  const resetToken = params.resetToken ? String(params.resetToken) : null;
  const inviteToken = params.inviteToken ? String(params.inviteToken) : null;

  const fontBold = i18n.language === 'ar' ? 'Amiri-Bold' : 'Lora-Bold';
  const fontMedium = i18n.language === 'ar' ? 'Amiri' : 'Lora-Medium';

  const [hide1, setHide1] = useState(true);
  const [hide2, setHide2] = useState(true);
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
      } else if (resetToken) {
        await api.auth.completePasswordReset(resetToken, values.newPassword);
      } else {
        router.replace('/(auth)/sign-in');
        return;
      }
      setActivated(true);
    } catch (e) {
      Alert.alert(t('errors:generic'), e?.message ?? '');
    } finally {
      setSubmitting(false);
    }
  });

  function continueAfterActivation() {
    setActivated(false);
    if (inviteToken) router.replace('/(app)');
    else router.replace('/(auth)/sign-in');
  }

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
            {t('auth:setPassword.title')}
          </RNText>
        </View>

        {/* Body */}
        <View style={{ gap: 24, marginTop: 16 }}>
          <View style={{ alignItems: 'center', gap: 4 }}>
            <Image
              source={require('../../assets/illustrations/set-password.png')}
              style={{ width: 327, height: 327 }}
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
              {t('auth:setPassword.subtitle')}
            </RNText>
          </View>

          <View style={{ gap: 24 }}>
            <PasswordField
              control={control}
              name="newPassword"
              label={t('auth:setPassword.newPassword')}
              secure={hide1}
              onToggleSecure={() => setHide1((v) => !v)}
            />
            <PasswordField
              control={control}
              name="confirmPassword"
              label={t('auth:setPassword.confirmPassword')}
              secure={hide2}
              onToggleSecure={() => setHide2((v) => !v)}
            />
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16 }}>
        <Pressable
          onPress={submitting ? undefined : onSubmit}
          style={{
            height: 48,
            borderRadius: 20,
            backgroundColor: C.brand,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: submitting ? 0.6 : 1,
          }}
        >
          <RNText style={{ fontFamily: fontBold, fontSize: 16, color: C.page }}>
            {submitting ? '…' : t('auth:setPassword.submit')}
          </RNText>
        </Pressable>
      </View>

      {/* Activated success modal — Figma node 279:21026. The popup card is
          343 wide with a 36px radius, 16px padding, 144x144 thumbs-up image,
          20px bold title, 14px medium gray body, full-width green CTA. */}
      <Modal visible={activated} transparent animationType="fade" statusBarTranslucent>
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.6)',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          <View
            style={{
              backgroundColor: C.page,
              borderRadius: 36,
              padding: 16,
              width: '100%',
              maxWidth: 343,
              alignItems: 'stretch',
              gap: 16,
            }}
          >
            <View style={{ alignItems: 'center', gap: 16 }}>
              <Image
                source={require('../../assets/illustrations/activated-thumbs-up.png')}
                style={{ width: 144, height: 144 }}
                resizeMode="contain"
              />
              <View style={{ gap: 12, alignItems: 'center' }}>
                <RNText
                  style={{
                    fontFamily: fontBold,
                    fontSize: 20,
                    color: C.ink,
                    textAlign: 'center',
                  }}
                >
                  {t('auth:setPassword.successTitle')}
                </RNText>
                <RNText
                  style={{
                    fontFamily: fontMedium,
                    fontSize: 14,
                    color: C.muted,
                    textAlign: 'center',
                  }}
                >
                  {t('auth:setPassword.successBody')}
                </RNText>
              </View>
            </View>
            <Pressable
              onPress={continueAfterActivation}
              style={{
                height: 48,
                borderRadius: 20,
                backgroundColor: C.brand,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <RNText style={{ fontFamily: fontBold, fontSize: 16, color: C.page }}>
                {t('auth:setPassword.successCta')}
              </RNText>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
