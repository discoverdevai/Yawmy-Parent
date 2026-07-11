// Announcement Details — pixel-aligned with Figma `598:77013`. Green header
// over a white sheet: a meta card (scope + date), the title, body, and image.
import React from 'react';
import { Image, Pressable, ScrollView, Text as RNText, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeftIcon } from '@nms/ui';
import { ANNOUNCEMENT_BY_ID, ANNOUNCEMENTS, ANN_ICON } from '../../../lib/announcements';

const C = {
  green: '#DFEBD1',
  sheet: '#FFFFF5',
  metaBg: '#FCFCEC',
  iconBg: '#F5F5DC',
  ink: '#333333',
  gray: '#535353',
  stroke: '#F5F5DC',
};

const scopeLabel = { room: 'Room-targeted', nursery: 'Nursery-wide' };

export default function AnnouncementDetailsScreen() {
  const { i18n } = useTranslation(['common']);
  const isAr = i18n.language === 'ar';
  const fontRegular = isAr ? 'Amiri' : 'Lora';
  const fontMedium = isAr ? 'Amiri' : 'Lora-Medium';
  const fontSemiBold = isAr ? 'Amiri-Bold' : 'Lora-Bold';
  const fontBold = isAr ? 'Amiri-Bold' : 'Lora-Bold';

  const params = useLocalSearchParams();
  const item = ANNOUNCEMENT_BY_ID[String(params.id)] ?? ANNOUNCEMENTS[0];

  return (
    <View style={{ flex: 1, backgroundColor: C.green }}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 16, paddingVertical: 16 }}>
          <Pressable
            onPress={() => router.back()}
            style={{ width: 40, height: 40, borderRadius: 10, borderWidth: 1, borderColor: C.stroke, alignItems: 'center', justifyContent: 'center' }}
          >
            <ArrowLeftIcon size={24} color={C.ink} />
          </Pressable>
          <RNText style={{ fontFamily: fontBold, fontSize: 20, color: C.ink }}>Announcement Details</RNText>
        </View>

        {/* White sheet */}
        <View style={{ flex: 1, backgroundColor: C.sheet, borderTopLeftRadius: 40, borderTopRightRadius: 40, overflow: 'hidden' }}>
          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 32, paddingBottom: 40, gap: 16 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Meta card */}
            <View style={{ backgroundColor: C.metaBg, borderRadius: 20, padding: 8, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: C.iconBg, alignItems: 'center', justifyContent: 'center' }}>
                <Image source={ANN_ICON} style={{ width: 24, height: 24 }} resizeMode="contain" />
              </View>
              <View style={{ gap: 8 }}>
                <RNText style={{ fontFamily: fontMedium, fontSize: 12, color: C.gray }}>{scopeLabel[item.scope]}</RNText>
                <RNText style={{ fontFamily: fontSemiBold, fontSize: 14, color: C.ink }}>{item.date}</RNText>
              </View>
            </View>

            {/* Title + body */}
            <View style={{ gap: 12 }}>
              <RNText style={{ fontFamily: fontBold, fontSize: 20, color: C.ink }}>{item.title}</RNText>
              <RNText style={{ fontFamily: fontRegular, fontSize: 14, color: C.gray, lineHeight: 21 }}>{item.body}</RNText>
            </View>

            {/* Image */}
            <Image source={item.image} style={{ width: '100%', height: 202, borderRadius: 20 }} resizeMode="cover" />
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  );
}
