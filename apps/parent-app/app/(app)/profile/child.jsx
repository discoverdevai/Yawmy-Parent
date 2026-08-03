// Child Profile — pixel-aligned with Figma `598:77267`. A green header over a
// white rounded sheet holding the child's summary card plus info sections:
// allergies, medical notes, emergency & pickup contacts, immunization records.
import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text as RNText, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { router, useLocalSearchParams } from 'expo-router';
import { useParentChild } from '@nms/data';
import { useActiveChild } from '../../../lib/active-child';
import { ChildAvatar } from '../../../components/ChildAvatar';
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

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// "2021-03-12" -> "12 Mar 2021 (3 years old)".
function formatDob(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age -= 1;
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()} (${age} year${age === 1 ? '' : 's'} old)`;
}

// Backend returns allergies/medicalNotes/immunizations as single strings; split
// into bullet lines on newlines so the list layout still renders.
function toLines(s) {
  return s ? String(s).split(/\r?\n/).map((x) => x.trim()).filter(Boolean) : [];
}

function contactLabel(c) {
  return [c.relationship, c.fullName].filter(Boolean).join(' – ') || c.fullName || '';
}

export default function ChildProfileScreen() {
  const { i18n } = useTranslation(['common']);
  const isAr = i18n.language === 'ar';
  const fontRegular = isAr ? 'Amiri' : 'Lora';
  const fontMedium = isAr ? 'Amiri' : 'Lora-Medium';
  const fontSemiBold = isAr ? 'Amiri-Bold' : 'Lora-Bold';
  const fontBold = isAr ? 'Amiri-Bold' : 'Lora-Bold';

  // Which child: an explicit `id` param, else the parent's first child.
  const params = useLocalSearchParams();
  const { activeChildId, isLoading: childrenLoading } = useActiveChild();
  const childId = params.id ? String(params.id) : activeChildId;
  const { data: detail, isLoading: detailLoading } = useParentChild(childId);
  const isLoading = childrenLoading || (!!childId && detailLoading);

  const child = detail
    ? {
        name: detail.fullName,
        dob: formatDob(detail.dob),
        allergies: toLines(detail.allergies),
        medical: toLines(detail.medicalNotes),
        emergency: (detail.emergencyContacts ?? []).map((c) => ({ label: contactLabel(c), phone: c.phone })),
        pickup: (detail.pickups ?? []).map((c) => ({ label: contactLabel(c), phone: c.phone })),
        immunization: toLines(detail.immunizations),
      }
    : null;

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
    if (!items || items.length === 0) {
      return (
        <RNText style={{ fontFamily: fontRegular, fontSize: 14, color: C.gray, paddingLeft: 4 }}>
          None recorded
        </RNText>
      );
    }
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
            {!child ? (
              <View style={{ paddingTop: 64, alignItems: 'center', gap: 12 }}>
                {isLoading ? (
                  <ActivityIndicator color={C.gray} />
                ) : (
                  <RNText style={{ fontFamily: fontRegular, fontSize: 14, color: C.gray }}>
                    No child record found.
                  </RNText>
                )}
              </View>
            ) : (
              <>
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
                  <ChildAvatar photoUrl={detail?.photoUrl} size={48} />
                  <View style={{ gap: 8 }}>
                    <RNText style={{ fontFamily: fontBold, fontSize: 18, color: C.ink }}>{child.name}</RNText>
                    <RNText style={{ fontFamily: fontRegular, fontSize: 12, color: C.gray }}>{child.dob}</RNText>
                  </View>
                </View>

                <InfoCard icon={<AllergyIcon size={24} color={C.gray} />} label="Allergies">
                  <BulletList items={child.allergies} />
                </InfoCard>

                <InfoCard icon={<MedicalIcon size={24} color={C.gray} />} label="Medical Notes">
                  <BulletList items={child.medical} />
                </InfoCard>

                <InfoCard icon={<PhoneIcon size={24} color={C.gray} />} label="Emergency Contacts">
                  {child.emergency.length === 0 ? (
                    <RNText style={{ fontFamily: fontRegular, fontSize: 14, color: C.gray, paddingLeft: 4 }}>
                      None recorded
                    </RNText>
                  ) : (
                    <View style={{ gap: 12 }}>
                      {child.emergency.map((c, i) => (
                        <ContactCard key={i} label={c.label} phone={c.phone} />
                      ))}
                    </View>
                  )}
                </InfoCard>

                <InfoCard icon={<PickupIcon size={24} color={C.gray} />} label="Authorized Pickup Contacts">
                  {child.pickup.length === 0 ? (
                    <RNText style={{ fontFamily: fontRegular, fontSize: 14, color: C.gray, paddingLeft: 4 }}>
                      None recorded
                    </RNText>
                  ) : (
                    <View style={{ gap: 12 }}>
                      {child.pickup.map((c, i) => (
                        <ContactCard key={i} label={c.label} phone={c.phone} />
                      ))}
                    </View>
                  )}
                </InfoCard>

                <InfoCard icon={<ImmunizationIcon size={24} color={C.gray} />} label="Immunization Records">
                  <BulletList items={child.immunization} />
                </InfoCard>
              </>
            )}
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  );
}
