// Invite welcome / expired — pixel-aligned with Figma `279:20088` (welcome)
// and `279:20358` (expired). Each visual is a discrete asset (decorative
// banner, illustration, image card) composed in code, so the live text
// rendered by the screen never doubles up with text baked into a screenshot.
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  Text as RNText,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { router, useLocalSearchParams } from 'expo-router';
import { useApi } from '@nms/data';

const C = {
  page: '#FFFFF5',
  ink: '#333333',
  muted: '#535353',
  brand: '#76945C',
  imageBg: '#D9D9D9',
};

export default function InviteLanding() {
  const { t, i18n } = useTranslation(['auth', 'common', 'errors']);
  const api = useApi();
  const params = useLocalSearchParams();
  const token = String(params.token ?? '');

  const fontBold = i18n.language === 'ar' ? 'Amiri-Bold' : 'Lora-Bold';
  const fontMedium = i18n.language === 'ar' ? 'Amiri' : 'Lora-Medium';

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
        if (!cancelled) setState({ kind: 'error', code: e?.code ?? 'invalid' });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [api, token]);

  if (state.kind === 'loading') {
    return (
      <View style={{ flex: 1, backgroundColor: C.page, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={C.brand} />
        <RNText style={{ fontFamily: fontMedium, fontSize: 14, color: C.muted, marginTop: 12 }}>
          {t('auth:invite.loading')}
        </RNText>
      </View>
    );
  }

  const isError = state.kind === 'error';

  // The backend may not know the nursery name for an invite; fall back to a
  // generic welcome rather than rendering an empty "".
  const nurseryName = state.kind === 'ready' ? state.nursery?.name : null;
  const title = isError
    ? t('auth:invite.expiredTitle')
    : nurseryName
      ? t('auth:invite.welcomeTitle', { nurseryName })
      : t('auth:invite.welcomeTitleGeneric');
  const body = isError ? t('auth:invite.expiredBody') : t('auth:invite.welcomeBody');
  const ctaLabel = isError ? t('auth:invite.expiredCta') : t('auth:invite.welcomeCta');

  return (
    <View style={{ flex: 1, backgroundColor: C.page }}>
      {/* Hanging-icons decorative banner — full width, 191px tall, sits at
          the very top of the screen. Same asset for both welcome and expired
          variants per Figma. */}
      <Image
        source={require('../../../assets/illustrations/invite-banner.png')}
        style={{ width: 375, height: 191 }}
        resizeMode="cover"
      />

      <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
        <View
          style={{
            flex: 1,
            paddingHorizontal: 16,
            alignItems: 'center',
            // Figma sets the content block to start at top:215px from the
            // screen origin. Banner height is 191px, so a 24px top padding
            // here puts the centered content at y≈215.
            paddingTop: 24,
            gap: 48,
          }}
        >
          {/* Hero asset — image-placeholder card for welcome,
              characters-with-EXPIRE-stamp illustration for expired. */}
          {isError ? (
            <Image
              source={require('../../../assets/illustrations/invite-expired.png')}
              style={{ width: 343, height: 230 }}
              resizeMode="contain"
            />
          ) : (
            <Image
              source={require('../../../assets/illustrations/invite-welcome-card.png')}
              style={{ width: 343, height: 308, borderRadius: 40, backgroundColor: C.imageBg }}
              resizeMode="contain"
            />
          )}

          {/* Title + body */}
          <View style={{ gap: 16, width: '100%' }}>
            <RNText
              style={{
                fontFamily: fontBold,
                fontSize: 24,
                lineHeight: 28,
                color: C.ink,
                textAlign: 'center',
              }}
            >
              {title}
            </RNText>
            <RNText
              style={{
                fontFamily: fontMedium,
                fontSize: 16,
                lineHeight: 24,
                color: C.muted,
                textAlign: 'center',
              }}
            >
              {body}
            </RNText>
          </View>
        </View>

        {/* Footer CTA */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 16, paddingTop: 8 }}>
          <Pressable
            onPress={() => {
              if (isError) {
                router.push('/(auth)/contact-nursery');
              } else {
                router.replace({
                  pathname: '/(auth)/set-password',
                  params: { inviteToken: token },
                });
              }
            }}
            style={{
              height: 48,
              borderRadius: 20,
              backgroundColor: C.brand,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <RNText style={{ fontFamily: fontBold, fontSize: 16, color: C.page }}>
              {ctaLabel}
            </RNText>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}
