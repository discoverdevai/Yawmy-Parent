// Sign-in screen — pixel-aligned with Figma `279:26996`. All colors,
// dimensions, paddings, radii match the design tokens pulled via the MCP
// `get_variable_defs` endpoint.
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, Text as RNText, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { router } from 'expo-router';
import { SmsIcon, LockIcon, EyeIcon, EyeOffIcon, AkarImageIcon } from '@nms/ui';
import { useAuth } from '@nms/data';
import { changeLocale } from '@nms/i18n/bootstrap';

// Static demo credentials. On a match we open a real (mock) parent session so
// the whole app — home, chat, profile, etc. — is populated with seeded data.
const STATIC_USERNAME = 'gaber';
const STATIC_PASSWORD = 'TestPassword123';

const C = {
  page: '#FFFFF5',
  card: '#FFFFFF',
  border: '#D8D8D8',
  borderError: '#DC2626',
  ink: '#333333',
  muted: '#535353',
  brand: '#76945C',
  imageBg: '#D9D9D9',
};

function Field({ name, control, label, placeholder, icon, trailing, secureTextEntry, ...rest }) {
  const { i18n } = useTranslation();
  const fontFamily = i18n.language === 'ar' ? 'Amiri' : 'Lora';
  const fontFamilyMedium = i18n.language === 'ar' ? 'Amiri-Bold' : 'Lora-Medium';
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
        <View style={{ gap: 12 }}>
          {label ? (
            <RNText style={{ fontFamily: fontFamilyMedium, fontSize: 16, color: C.ink }}>
              {label}
            </RNText>
          ) : null}
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
            {icon}
            <TextInput
              value={value ?? ''}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder={placeholder}
              placeholderTextColor={C.muted}
              secureTextEntry={secureTextEntry}
              style={{ flex: 1, fontFamily, fontSize: 14, color: C.ink, padding: 0 }}
              {...rest}
            />
            {trailing}
          </View>
          {error ? (
            <RNText style={{ fontFamily, fontSize: 12, color: C.borderError }}>
              {error.message}
            </RNText>
          ) : null}
        </View>
      )}
    />
  );
}

export default function SignIn() {
  const { t, i18n } = useTranslation(['auth', 'common', 'errors']);
  const { signIn } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [hidePw, setHidePw] = useState(true);

  const fontFamilyBold = i18n.language === 'ar' ? 'Amiri-Bold' : 'Lora-Bold';
  const fontFamilyMedium = i18n.language === 'ar' ? 'Amiri' : 'Lora-Medium';

  const { control, handleSubmit } = useForm({
    defaultValues: { email: STATIC_USERNAME, password: STATIC_PASSWORD },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true);
    try {
      const username = (values.email ?? '').trim();
      if (username !== STATIC_USERNAME || values.password !== STATIC_PASSWORD) {
        throw new Error('invalid');
      }
      // Establish a real (mock) parent session behind the static login so the
      // rest of the app is populated with seeded data.
      await signIn('parent@nms.local', 'password123');
      router.replace('/(app)');
    } catch {
      Alert.alert(t('errors:generic'), t('auth:signIn.errorInvalid'));
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.page }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 24, paddingBottom: 16 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Title block — title + subtitle, both centered */}
        <View style={{ gap: 16, marginBottom: 24 }}>
          <RNText
            style={{ fontFamily: fontFamilyBold, fontSize: 20, color: C.ink, textAlign: 'center' }}
          >
            {t('auth:signIn.title')}
          </RNText>
          <RNText
            style={{
              fontFamily: fontFamilyMedium,
              fontSize: 16,
              lineHeight: 24,
              color: C.ink,
              textAlign: 'center',
            }}
          >
            {t('auth:signIn.subtitle')}
          </RNText>
        </View>

        {/* Image placeholder card — h-308, rounded-40 (Figma) */}
        <View
          style={{
            height: 308,
            borderRadius: 40,
            backgroundColor: C.imageBg,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 24,
          }}
        >
          <AkarImageIcon size={163} color="#333333" strokeWidth={4} />
        </View>

        {/* Inputs — gap-16 between email and password block */}
        <View style={{ gap: 16 }}>
          <Field
            control={control}
            name="email"
            label="Username"
            placeholder="Enter your username"
            icon={<SmsIcon size={24} color={C.muted} />}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <View style={{ gap: 12 }}>
            <Field
              control={control}
              name="password"
              label={t('auth:signIn.password')}
              placeholder={t('auth:signIn.passwordPlaceholder')}
              icon={<LockIcon size={24} color={C.muted} />}
              secureTextEntry={hidePw}
              trailing={
                <Pressable onPress={() => setHidePw((v) => !v)} hitSlop={10}>
                  {hidePw ? (
                    <EyeOffIcon size={20} color={C.muted} />
                  ) : (
                    <EyeIcon size={20} color={C.muted} />
                  )}
                </Pressable>
              }
            />
            <Pressable
              onPress={() => router.push('/(auth)/forgot-password')}
              style={{ alignSelf: 'flex-end' }}
              hitSlop={10}
            >
              <RNText style={{ fontFamily: fontFamilyMedium, fontSize: 12, color: C.brand }}>
                {t('auth:signIn.forgotPassword')}
              </RNText>
            </Pressable>
          </View>
        </View>

        {/* Subtle dev-only language switcher */}
        <Pressable
          onPress={async () => {
            const next = i18n.language === 'ar' ? 'en' : 'ar';
            await changeLocale(next);
          }}
          style={{ alignSelf: 'center', paddingVertical: 12, marginTop: 24 }}
        >
          <RNText style={{ fontFamily: fontFamilyMedium, fontSize: 12, color: C.muted }}>
            {t('common:switchLanguage')}
          </RNText>
        </Pressable>

        {__DEV__ ? (
          <View
            style={{
              alignSelf: 'center',
              flexDirection: 'row',
              gap: 8,
              marginTop: 8,
              paddingVertical: 8,
            }}
          >
            <Pressable
              onPress={() =>
                router.push({
                  pathname: '/(auth)/invite/[token]',
                  params: { token: 'PARENTINVITE' },
                })
              }
              style={{
                paddingVertical: 6,
                paddingHorizontal: 10,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: '#D8D8D8',
              }}
            >
              <RNText style={{ fontFamily: fontFamilyMedium, fontSize: 11, color: C.muted }}>
                Dev · Invite welcome
              </RNText>
            </Pressable>
            <Pressable
              onPress={() =>
                router.push({
                  pathname: '/(auth)/invite/[token]',
                  params: { token: 'EXPIREDINVITE' },
                })
              }
              style={{
                paddingVertical: 6,
                paddingHorizontal: 10,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: '#D8D8D8',
              }}
            >
              <RNText style={{ fontFamily: fontFamilyMedium, fontSize: 11, color: C.muted }}>
                Dev · Invite expired
              </RNText>
            </Pressable>
          </View>
        ) : null}
      </ScrollView>

      {/* Footer — pinned button matches Figma node 279:27128 */}
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
          <RNText style={{ fontFamily: fontFamilyBold, fontSize: 16, color: C.page }}>
            {submitting ? '…' : t('auth:signIn.submit')}
          </RNText>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
