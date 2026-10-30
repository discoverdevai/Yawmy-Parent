// Privacy & Security — pixel-aligned with Figma `598:77809` (collapsed),
// `598:77856` (Change Password expanded + success popup). Change Password is an
// inline accordion with a 3-field form; Sign Out From All Devices confirms via
// the shared dialog.
import React, { useState } from 'react';
import { Image, Modal, Pressable, ScrollView, TextInput, Text as RNText, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import {
  ArrowLeftIcon,
  ArrowDownIcon,
  KeyIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  LogoutIcon,
} from '@nms/ui';
import { useApi, useAuth } from '@nms/data';
import { SignOutDialog } from '../../../../components/SignOutDialog';

const C = {
  green: '#DFEBD1',
  sheet: '#FFFFF5',
  rowBg: '#F8FAEE',
  accentBg: '#FEF8ED',
  accent: '#B5503C',
  ink: '#333333',
  gray: '#535353',
  brand: '#76945C',
  white: '#FEFEFE',
  inputBorder: '#D8D8D8',
  stroke: '#F5F5DC',
};

export default function PrivacySecurityScreen() {
  const { i18n } = useTranslation(['common']);
  const api = useApi();
  const { signOutAllDevices } = useAuth();
  const isAr = i18n.language === 'ar';
  const fontRegular = isAr ? 'Amiri' : 'Lora';
  const fontMedium = isAr ? 'Amiri' : 'Lora-Medium';
  const fontSemiBold = isAr ? 'Amiri-Bold' : 'Lora-Bold';
  const fontBold = isAr ? 'Amiri-Bold' : 'Lora-Bold';

  const [expanded, setExpanded] = useState(false);
  const [success, setSuccess] = useState(false);
  const [signOutAll, setSignOutAll] = useState(false);
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [show, setShow] = useState({ current: false, next: false, confirm: false });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const canSubmit =
    form.current && form.next.length >= 8 && form.next === form.confirm && !submitting;

  async function onChangePassword() {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      await api.auth.changePassword(form.current, form.next);
      setSuccess(true);
    } catch (e) {
      setError(e?.message ?? 'Could not change your password. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function PasswordField({ label, field, placeholder }) {
    const visible = show[field];
    return (
      <View style={{ gap: 12 }}>
        <RNText style={{ fontFamily: fontMedium, fontSize: 16, color: C.ink }}>{label}</RNText>
        <View
          style={{
            height: 48,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: C.inputBorder,
            paddingHorizontal: 12,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
            <LockIcon size={24} color={C.gray} />
            <TextInput
              value={form[field]}
              onChangeText={(t) => setForm((f) => ({ ...f, [field]: t }))}
              placeholder={placeholder}
              placeholderTextColor={C.gray}
              secureTextEntry={!visible}
              style={{ flex: 1, fontFamily: fontRegular, fontSize: 14, color: C.ink, padding: 0 }}
            />
          </View>
          <Pressable onPress={() => setShow((s) => ({ ...s, [field]: !s[field] }))} hitSlop={8}>
            {visible ? (
              <EyeIcon size={24} color={C.gray} />
            ) : (
              <EyeOffIcon size={24} color={C.gray} />
            )}
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.green }}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 16,
            paddingHorizontal: 16,
            paddingVertical: 16,
          }}
        >
          <Pressable
            onPress={() => router.back()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: C.stroke,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ArrowLeftIcon size={24} color={C.ink} />
          </Pressable>
          <RNText style={{ fontFamily: fontBold, fontSize: 20, color: C.ink }}>
            Privacy & Security
          </RNText>
        </View>

        {/* White sheet */}
        <View
          style={{
            flex: 1,
            backgroundColor: C.sheet,
            borderTopLeftRadius: 40,
            borderTopRightRadius: 40,
            overflow: 'hidden',
          }}
        >
          <ScrollView
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingTop: 32,
              paddingBottom: 40,
              gap: 24,
            }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Change Password accordion */}
            <View style={{ backgroundColor: C.rowBg, borderRadius: 20, padding: 12, gap: 24 }}>
              <Pressable
                onPress={() => setExpanded((v) => !v)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <KeyIcon size={24} color={C.ink} />
                  <RNText style={{ fontFamily: fontSemiBold, fontSize: 16, color: C.ink }}>
                    Change Password
                  </RNText>
                </View>
                <View style={{ transform: [{ scaleY: expanded ? -1 : 1 }] }}>
                  <ArrowDownIcon size={24} color={C.ink} />
                </View>
              </Pressable>

              {expanded ? (
                <View style={{ gap: 16 }}>
                  <PasswordField
                    label="Current Password"
                    field="current"
                    placeholder="Enter your current password"
                  />
                  <PasswordField
                    label="New Password"
                    field="next"
                    placeholder="Enter your new password"
                  />
                  <PasswordField
                    label="Confirm New Password"
                    field="confirm"
                    placeholder="Enter your new password"
                  />
                  {error ? (
                    <RNText style={{ fontFamily: fontMedium, fontSize: 12, color: C.accent }}>
                      {error}
                    </RNText>
                  ) : null}
                  <Pressable
                    onPress={onChangePassword}
                    style={{
                      height: 48,
                      borderRadius: 20,
                      backgroundColor: C.brand,
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: canSubmit ? 1 : 0.4,
                    }}
                  >
                    <RNText style={{ fontFamily: fontBold, fontSize: 16, color: C.white }}>
                      {submitting ? 'Saving…' : 'Change Password'}
                    </RNText>
                  </Pressable>
                </View>
              ) : null}
            </View>

            {/* Sign Out From All Devices */}
            <Pressable
              onPress={() => setSignOutAll(true)}
              style={{
                height: 48,
                borderRadius: 20,
                backgroundColor: C.accentBg,
                paddingHorizontal: 12,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <LogoutIcon size={24} color={C.accent} />
              <RNText style={{ fontFamily: fontSemiBold, fontSize: 16, color: C.accent }}>
                Sign Out From All Devices
              </RNText>
            </Pressable>
          </ScrollView>
        </View>
      </SafeAreaView>

      {/* Success popup */}
      <Modal
        visible={success}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setSuccess(false)}
      >
        <Pressable
          onPress={() => {
            setSuccess(false);
            setExpanded(false);
            setForm({ current: '', next: '', confirm: '' });
          }}
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
              width: '100%',
              maxWidth: 343,
              backgroundColor: C.sheet,
              borderRadius: 20,
              padding: 16,
              alignItems: 'center',
              gap: 16,
            }}
          >
            <Image
              source={require('../../../../assets/illustrations/activated-thumbs-up.png')}
              style={{ width: 144, height: 144 }}
              resizeMode="contain"
            />
            <RNText
              style={{ fontFamily: fontBold, fontSize: 20, color: C.ink, textAlign: 'center' }}
            >
              Password Changed Successfully!
            </RNText>
          </View>
        </Pressable>
      </Modal>

      <SignOutDialog
        visible={signOutAll}
        onCancel={() => setSignOutAll(false)}
        onConfirm={() => {
          setSignOutAll(false);
          signOutAllDevices();
        }}
        title="Sign out from all devices?"
        subtitle="This will end your session on every device. You’ll need to sign in again."
      />
    </View>
  );
}
