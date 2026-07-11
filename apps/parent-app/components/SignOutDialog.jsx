// Sign-out confirmation dialog — pixel-aligned with Figma `598:77927` (sign
// out) and reused for `598:77889` (sign out from all devices). A dim modal
// with a logout glyph, title/subtitle, and Cancel / confirm actions.
import React from 'react';
import { Modal, Pressable, Text as RNText, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { LogoutIcon } from '@nms/ui';

const C = {
  card: '#FFFFF5',
  ink: '#333333',
  gray: '#535353',
  brand: '#76945C',
  accent: '#B5503C',
  white: '#FEFEFE',
};

export function SignOutDialog({
  visible,
  onCancel,
  onConfirm,
  title = 'Do you want to sign out?',
  subtitle = 'You’ll need to sign in again to access your account.',
  confirmLabel = 'Sign Out',
}) {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const fontRegular = isAr ? 'Amiri' : 'Lora';
  const fontMedium = isAr ? 'Amiri' : 'Lora-Medium';
  const fontBold = isAr ? 'Amiri-Bold' : 'Lora-Bold';

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onCancel}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <Pressable onPress={onCancel} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
        <View style={{ width: '100%', maxWidth: 343, backgroundColor: C.card, borderRadius: 28, padding: 16, gap: 16, alignItems: 'center' }}>
          <LogoutIcon size={64} color={C.accent} strokeWidth={1.5} />
          <View style={{ gap: 8, alignItems: 'center' }}>
            <RNText style={{ fontFamily: fontBold, fontSize: 20, color: C.ink, textAlign: 'center' }}>{title}</RNText>
            <RNText style={{ fontFamily: fontRegular, fontSize: 14, color: C.gray, textAlign: 'center' }}>{subtitle}</RNText>
          </View>
          <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
            <Pressable onPress={onCancel} style={{ flex: 1, height: 48, alignItems: 'center', justifyContent: 'center' }}>
              <RNText style={{ fontFamily: fontMedium, fontSize: 16, color: C.gray }}>Cancel</RNText>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              style={{ flex: 1, height: 48, borderRadius: 20, backgroundColor: C.brand, alignItems: 'center', justifyContent: 'center' }}
            >
              <RNText style={{ fontFamily: fontBold, fontSize: 16, color: C.white }}>{confirmLabel}</RNText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
