// Child Profile — pixel-aligned with Figma `598:77267`. A green header over a
// white rounded sheet holding the child's summary card plus info sections:
// allergies, medical notes, emergency & pickup contacts, immunization records.
import React from 'react';
import { Image, Pressable, ScrollView, Text as RNText, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import {
  ArrowLeftIcon,
  PhoneIcon,
  AllergyIcon,
  MedicalIcon,
  PickupIcon,
  ImmunizationIcon,
} from '@nms/ui';

const C = {
  green: '#DFEBD1',
  sheet: '#FFFFF5',
  cardBg: '#F8FAEE',
  ink: '#333333',
  gray: '#535353',
  stroke: '#F5F5DC',
  contactBorder: '#DFEBD1',
};

// Sample child record — mirrors the Figma content; real data lands via API.
const CHILD = {
  name: 'Child Name',
  dob: '12 Mar 2021 (3 years old)',
  allergies: ['Peanut allergy and sensitivity to dust.', 'Egg allergy and sensitivity to pollen.'],
  medical: ['Mild asthma (uses inhaler when needed).', 'Currently taking antibiotics for an ear infection.'],
  emergency: [
    { label: 'Mother – Sara Ahmed', phone: '+20 100 123 4567' },
    { label: 'Father – Mohamed Hassan', phone: '+20 100 123 4567' },
  ],
  pickup: [
    { label: 'Mother – Sara Ahmed', phone: '+20 100 123 4567' },
    { label: 'Father – Mohamed Hassan', phone: '+20 100 123 4567' },
  ],
  immunization: ['Last vaccine: MMR - Jan 2025', 'Next due: Sep 2026'],
};

export default function ChildProfileScreen() {
  const { i18n } = useTranslation(['common']);
  const isAr = i18n.language === 'ar';
  const fontRegular = isAr ? 'Amiri' : 'Lora';
  const fontMedium = isAr ? 'Amiri' : 'Lora-Medium';
  const fontSemiBold = isAr ? 'Amiri-Bold' : 'Lora-Bold';
  const fontBold = isAr ? 'Amiri-Bold' : 'Lora-Bold';

  // A titled info card with an icon header.
  function InfoCard({ icon, label, children }) {
    return (
      <View style={{ backgroundColor: C.cardBg, borderRadius: 20, padding: 12, gap: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {icon}
          <RNText style={{ fontFamily: fontMedium, fontSize: 12, color: C.gray }}>{label}</RNText>
        </View>
        {children}
      </View>
    );
  }

  // A bulleted list of strings.
  function BulletList({ items }) {
    return (
      <View style={{ gap: 12 }}>
        {items.map((item, i) => (
          <View key={i} style={{ flexDirection: 'row', gap: 8, paddingLeft: 4 }}>
            <RNText style={{ fontFamily: fontSemiBold, fontSize: 14, color: C.ink, lineHeight: 20 }}>•</RNText>
            <RNText style={{ flex: 1, fontFamily: fontSemiBold, fontSize: 14, color: C.ink, lineHeight: 20 }}>
              {item}
            </RNText>
          </View>
        ))}
      </View>
    );
  }

  // A bordered contact sub-card (name + tappable phone number).
  function ContactCard({ label, phone }) {
    return (
      <View
        style={{
          borderWidth: 1,
          borderColor: C.contactBorder,
          borderRadius: 8,
          padding: 8,
          gap: 8,
        }}
      >
        <RNText style={{ fontFamily: fontSemiBold, fontSize: 14, color: C.ink }}>{label}</RNText>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <PhoneIcon size={16} color={C.ink} />
          <RNText style={{ fontFamily: fontMedium, fontSize: 14, color: C.ink }}>{phone}</RNText>
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
            paddingTop: 16,
            paddingBottom: 16,
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
          <RNText style={{ fontFamily: fontBold, fontSize: 20, color: C.ink }}>Child Profile</RNText>
        </View>

        {/* White sheet */}
        <View style={{ flex: 1, backgroundColor: C.sheet, borderTopLeftRadius: 40, borderTopRightRadius: 40, overflow: 'hidden' }}>
          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 24, paddingBottom: 40, gap: 16 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Child summary */}
            <View
              style={{
                backgroundColor: C.green,
                borderRadius: 20,
                padding: 12,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <Image
                source={require('../../../assets/home/avatar.png')}
                style={{ width: 48, height: 48, borderRadius: 24 }}
              />
              <View style={{ gap: 8 }}>
                <RNText style={{ fontFamily: fontBold, fontSize: 18, color: C.ink }}>{CHILD.name}</RNText>
                <RNText style={{ fontFamily: fontRegular, fontSize: 12, color: C.gray }}>{CHILD.dob}</RNText>
              </View>
            </View>

            <InfoCard icon={<AllergyIcon size={24} color={C.gray} />} label="Allergies">
              <BulletList items={CHILD.allergies} />
            </InfoCard>

            <InfoCard icon={<MedicalIcon size={24} color={C.gray} />} label="Medical Notes">
              <BulletList items={CHILD.medical} />
            </InfoCard>

            <InfoCard icon={<PhoneIcon size={24} color={C.gray} />} label="Emergency Contacts">
              <View style={{ gap: 12 }}>
                {CHILD.emergency.map((c, i) => (
                  <ContactCard key={i} label={c.label} phone={c.phone} />
                ))}
              </View>
            </InfoCard>

            <InfoCard icon={<PickupIcon size={24} color={C.gray} />} label="Authorized Pickup Contacts">
              <View style={{ gap: 12 }}>
                {CHILD.pickup.map((c, i) => (
                  <ContactCard key={i} label={c.label} phone={c.phone} />
                ))}
              </View>
            </InfoCard>

            <InfoCard icon={<ImmunizationIcon size={24} color={C.gray} />} label="Immunization Records">
              <BulletList items={CHILD.immunization} />
            </InfoCard>
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  );
}
