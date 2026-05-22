// OTP entry — pixel-aligned with Figma `296:4438` (empty) + `298:4634` (filled).
import React, { useEffect, useRef, useState } from 'react';
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
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeftIcon } from '@nms/ui';
import { useApi } from '@nms/data';

const C = {
  page: '#FFFFF5',
  card: '#FFFFFF',
  border: '#D8D8D8',
  borderError: '#C90101',
  ink: '#333333',
  muted: '#535353',
  brand: '#76945C',
  brandDark: '#334722',
};

function OtpCells({ value, onChange, error }) {
  const { i18n } = useTranslation();
  const fontBold = i18n.language === 'ar' ? 'Amiri-Bold' : 'Lora-Bold';
  const refs = useRef([]);

  useEffect(() => {
    const t = setTimeout(() => refs.current[0]?.focus(), 200);
    return () => clearTimeout(t);
  }, []);

  function handleChange(i, text) {
    const digits = text.replace(/\D/g, '');
    if (digits.length === 0) {
      const arr = value.padEnd(4, ' ').split('');
      arr[i] = '';
      onChange(arr.join('').trimEnd());
      return;
    }
    if (digits.length >= 4) {
      onChange(digits.slice(0, 4));
      refs.current[3]?.focus();
      return;
    }
    const ch = digits[digits.length - 1];
    const arr = value.padEnd(4, ' ').split('');
    arr[i] = ch;
    onChange(arr.join('').replace(/ /g, ''));
    if (i < 3) refs.current[i + 1]?.focus();
  }

  function handleKey(i, e) {
    if (e.nativeEvent.key === 'Backspace' && (value[i] ?? '') === '' && i > 0) {
      const arr = value.padEnd(4, ' ').split('');
      arr[i - 1] = '';
      onChange(arr.join('').trimEnd());
      refs.current[i - 1]?.focus();
    }
  }

  return (
    <View style={{ flexDirection: 'row', gap: 16, alignSelf: 'center' }}>
      {Array.from({ length: 4 }).map((_, i) => {
        const ch = value[i] ?? '';
        return (
          <Pressable key={i} onPress={() => refs.current[i]?.focus()}>
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: error ? C.borderError : C.border,
                backgroundColor: C.card,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <TextInput
                ref={(el) => (refs.current[i] = el)}
                value={ch}
                onChangeText={(t) => handleChange(i, t)}
                onKeyPress={(e) => handleKey(i, e)}
                keyboardType="number-pad"
                maxLength={4}
                textContentType="oneTimeCode"
                style={{
                  fontFamily: fontBold,
                  fontSize: 24,
                  color: C.ink,
                  textAlign: 'center',
                  width: 32,
                  padding: 0,
                }}
              />
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

function ResendBlock({ seconds, onResend }) {
  const { t, i18n } = useTranslation(['auth']);
  const fontMedium = i18n.language === 'ar' ? 'Amiri' : 'Lora-Medium';
  const fontSemiBold = i18n.language === 'ar' ? 'Amiri-Bold' : 'Lora-Bold';
  const fontRegular = i18n.language === 'ar' ? 'Amiri' : 'Lora';
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    setRemaining(seconds);
    if (seconds <= 0) return;
    const id = setInterval(() => setRemaining((r) => (r > 0 ? r - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [seconds]);

  const m = String(Math.floor(remaining / 60)).padStart(2, '0');
  const s = String(remaining % 60).padStart(2, '0');

  return (
    <View style={{ alignItems: 'center', gap: 8 }}>
      <RNText style={{ fontFamily: fontMedium, fontSize: 12, color: C.ink, textAlign: 'center' }}>
        {t('auth:otp.didntReceive')}
      </RNText>
      {remaining > 0 ? (
        <RNText style={{ fontSize: 14, color: C.ink, textAlign: 'center' }}>
          <RNText style={{ fontFamily: fontSemiBold, color: C.brandDark }}>
            {t('auth:otp.resend')}
          </RNText>
          <RNText style={{ fontFamily: fontRegular, color: C.ink }}>{` ${t('auth:otp.resendInPrefix')} `}</RNText>
          <RNText style={{ fontFamily: fontRegular, color: C.ink }}>{`${m}:${s}`}</RNText>
        </RNText>
      ) : (
        <Pressable onPress={onResend} hitSlop={10}>
          <RNText style={{ fontFamily: fontSemiBold, fontSize: 14, color: C.brandDark }}>
            {t('auth:otp.resend')}
          </RNText>
        </Pressable>
      )}
    </View>
  );
}

export default function OtpScreen() {
  const { t, i18n } = useTranslation(['auth', 'errors']);
  const api = useApi();
  const params = useLocalSearchParams();
  const email = String(params.email ?? '');

  const fontBold = i18n.language === 'ar' ? 'Amiri-Bold' : 'Lora-Bold';
  const fontMedium = i18n.language === 'ar' ? 'Amiri' : 'Lora-Medium';

  const [code, setCode] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [resendKey, setResendKey] = useState(0);

  const complete = code.length === 4;

  async function onVerify() {
    if (!complete || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const { resetToken } = await api.auth.verifyOtp(email, code);
      router.replace({ pathname: '/(auth)/set-password', params: { resetToken } });
    } catch (e) {
      if (e?.code === 'otp_expired') setError(t('auth:otp.errorExpired'));
      else setError(t('auth:otp.errorInvalid'));
    } finally {
      setSubmitting(false);
    }
  }

  async function onResend() {
    setError(null);
    setCode('');
    try {
      await api.auth.requestPasswordResetOtp(email);
      setResendKey((k) => k + 1);
    } catch {
      setError(t('errors:generic'));
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.page }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
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
          <RNText style={{ fontFamily: fontBold, fontSize: 20, color: C.ink, flex: 1 }}>
            {t('auth:otp.title')}
          </RNText>
        </View>

        <View style={{ gap: 32, alignItems: 'center', marginTop: 16 }}>
          {/* Illustration + subtitle */}
          <View style={{ alignItems: 'center', gap: 4 }}>
            <Image
              source={require('../../assets/illustrations/otp.png')}
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
              {t('auth:otp.subtitle')}
            </RNText>
          </View>

          {/* OTP cells + resend block */}
          <View style={{ gap: 16, alignItems: 'center', width: 272 }}>
            <OtpCells value={code} onChange={setCode} error={!!error} />
            {error ? (
              <RNText
                style={{
                  fontFamily: fontMedium,
                  fontSize: 12,
                  color: C.borderError,
                  textAlign: 'center',
                }}
              >
                {error}
              </RNText>
            ) : null}
            <ResendBlock key={resendKey} seconds={30} onResend={onResend} />
          </View>
        </View>
      </ScrollView>

      <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16 }}>
        <Pressable
          onPress={complete && !submitting ? onVerify : undefined}
          style={{
            height: 48,
            borderRadius: 20,
            backgroundColor: C.brand,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: complete && !submitting ? 1 : 0.4,
          }}
        >
          <RNText style={{ fontFamily: fontBold, fontSize: 16, color: C.page }}>
            {submitting ? '…' : t('auth:otp.submit')}
          </RNText>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
