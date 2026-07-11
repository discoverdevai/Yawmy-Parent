// Contact Nursery / Request New Link — pixel-aligned with Figma `610:16628`
// (form) and `612:27547` (success popup). Reached from an expired invite: the
// parent requests a fresh access link from the nursery.
import React, { useState } from 'react';
import { Image, Modal, Pressable, ScrollView, TextInput, Text as RNText, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { ProfileCircleIcon, SmsIcon } from '@nms/ui';

const C = {
  page: '#FFFFF5',
  ink: '#333333',
  gray: '#535353',
  brand: '#76945C',
  border: '#D8D8D8',
  white: '#FEFEFE',
};

export default function ContactNurseryScreen() {
  const { i18n } = useTranslation(['auth', 'common']);
  const isAr = i18n.language === 'ar';
  const fontRegular = isAr ? 'Amiri' : 'Lora';
  const fontMedium = isAr ? 'Amiri' : 'Lora-Medium';
  const fontBold = isAr ? 'Amiri-Bold' : 'Lora-Bold';

  const [childName, setChildName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const canSubmit = childName.trim() && email.trim();

  function Field({ label, children }) {
    return (
      <View style={{ gap: 12 }}>
        <RNText style={{ fontFamily: fontMedium, fontSize: 16, color: C.ink }}>{label}</RNText>
        {children}
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.page }}>
      {/* Decorative banner */}
      <Image
        source={require('../../assets/illustrations/invite-banner.png')}
        style={{ width: '100%', height: 191 }}
        resizeMode="cover"
      />

      <SafeAreaView edges={['bottom']} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24, gap: 16 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ gap: 8 }}>
            <RNText style={{ fontFamily: fontBold, fontSize: 20, color: C.ink }}>Request New Link</RNText>
            <RNText style={{ fontFamily: fontRegular, fontSize: 14, color: C.gray, lineHeight: 21 }}>
              Your invitation link has expired. You can request a new one from the nursery.
            </RNText>
          </View>

          <Field label="Child Name">
            <View style={{ height: 48, borderRadius: 20, borderWidth: 1, borderColor: C.border, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <ProfileCircleIcon size={24} color={C.gray} />
              <TextInput
                value={childName}
                onChangeText={setChildName}
                placeholder="Enter child name"
                placeholderTextColor={C.gray}
                style={{ flex: 1, fontFamily: fontRegular, fontSize: 14, color: C.ink, padding: 0 }}
              />
            </View>
          </Field>

          <Field label="Email">
            <View style={{ height: 48, borderRadius: 20, borderWidth: 1, borderColor: C.border, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <SmsIcon size={24} color={C.gray} />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your Email"
                placeholderTextColor={C.gray}
                keyboardType="email-address"
                autoCapitalize="none"
                style={{ flex: 1, fontFamily: fontRegular, fontSize: 14, color: C.ink, padding: 0 }}
              />
            </View>
          </Field>

          <Field label="Message">
            <View style={{ minHeight: 120, borderRadius: 20, borderWidth: 1, borderColor: C.border, padding: 12 }}>
              <TextInput
                value={message}
                onChangeText={setMessage}
                placeholder="Add any extra details (optional)"
                placeholderTextColor={C.gray}
                multiline
                textAlignVertical="top"
                style={{ flex: 1, fontFamily: fontRegular, fontSize: 14, color: C.ink, padding: 0 }}
              />
            </View>
          </Field>

          <Pressable
            onPress={() => canSubmit && setSuccess(true)}
            style={{ height: 48, borderRadius: 20, backgroundColor: C.brand, alignItems: 'center', justifyContent: 'center', opacity: canSubmit ? 1 : 0.4, marginTop: 8 }}
          >
            <RNText style={{ fontFamily: fontBold, fontSize: 16, color: C.white }}>Request New Link</RNText>
          </Pressable>
        </ScrollView>
      </SafeAreaView>

      {/* Success popup */}
      <Modal visible={success} transparent animationType="fade" statusBarTranslucent onRequestClose={() => setSuccess(false)}>
        <Pressable
          onPress={() => {
            setSuccess(false);
            router.replace('/(auth)/sign-in');
          }}
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', padding: 16 }}
        >
          <View style={{ width: '100%', maxWidth: 343, backgroundColor: C.page, borderRadius: 36, padding: 16, alignItems: 'center', gap: 16 }}>
            <Image
              source={require('../../assets/illustrations/activated-thumbs-up.png')}
              style={{ width: 144, height: 144 }}
              resizeMode="contain"
            />
            <View style={{ gap: 12, alignItems: 'center' }}>
              <RNText style={{ fontFamily: fontBold, fontSize: 20, color: C.ink, textAlign: 'center' }}>
                We’ve Got Your Request!
              </RNText>
              <RNText style={{ fontFamily: fontMedium, fontSize: 14, color: C.gray, textAlign: 'center', lineHeight: 21 }}>
                Your request has been sent to the nursery. You will receive a new access link shortly. Please check your email for updates.
              </RNText>
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
