// Announcements (News) — pixel-aligned with Figma `598:76886` (list) and
// `598:76900` (empty). Room-targeted / Nursery-wide tabs; cards open the
// details screen. Empty tabs show the "No Announcement yet!" illustration.
import React, { useState } from 'react';
import { Image, Pressable, ScrollView, Text as RNText, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { BottomNav } from '../../../components/BottomNav';
import { ANNOUNCEMENTS, ANN_ICON } from '../../../lib/announcements';

const C = {
  page: '#FFFFF5',
  ink: '#333333',
  gray: '#535353',
  brand: '#76945C',
  brandText: '#334722',
  tabBar: '#F5F5DC',
  cardBg: '#FCFCEC',
  cardBorder: '#F5F5DC',
  iconBg: '#F5F5DC',
  white: '#FFFFF5',
};

export default function NewsScreen() {
  const { i18n } = useTranslation(['common']);
  const isAr = i18n.language === 'ar';
  const fontRegular = isAr ? 'Amiri' : 'Lora';
  const fontMedium = isAr ? 'Amiri' : 'Lora-Medium';
  const fontSemiBold = isAr ? 'Amiri-Bold' : 'Lora-Bold';
  const fontBold = isAr ? 'Amiri-Bold' : 'Lora-Bold';

  const [tab, setTab] = useState('room');
  const list = ANNOUNCEMENTS.filter((a) => a.scope === tab);
  const roomCount = ANNOUNCEMENTS.filter((a) => a.scope === 'room').length;

  function Tab({ id, label, count }) {
    const active = tab === id;
    return (
      <Pressable
        onPress={() => setTab(id)}
        style={{ flex: 1, height: 32, borderRadius: 12, backgroundColor: active ? C.brand : 'transparent', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}
      >
        <RNText style={{ fontFamily: fontSemiBold, fontSize: 14, color: active ? C.white : C.gray }}>{label}</RNText>
        {count ? (
          <View style={{ minWidth: 24, height: 24, borderRadius: 12, paddingHorizontal: 7, backgroundColor: C.white, alignItems: 'center', justifyContent: 'center' }}>
            <RNText style={{ fontFamily: fontMedium, fontSize: 14, color: C.brandText }}>{count}</RNText>
          </View>
        ) : null}
      </Pressable>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.page }}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          <RNText style={{ fontFamily: fontBold, fontSize: 20, color: C.ink, textAlign: 'center' }}>Announcement</RNText>

          {/* Tabs */}
          <View style={{ marginTop: 24, backgroundColor: C.tabBar, borderRadius: 20, padding: 8, flexDirection: 'row', gap: 8 }}>
            <Tab id="room" label="Room-targeted" count={roomCount} />
            <Tab id="nursery" label="Nursery-wide" />
          </View>

          {list.length > 0 ? (
            <View style={{ marginTop: 16, gap: 16 }}>
              {list.map((a) => (
                <Pressable
                  key={a.id}
                  onPress={() => router.push(`/(app)/news/${a.id}`)}
                  style={{ backgroundColor: C.cardBg, borderWidth: 1, borderColor: C.cardBorder, borderRadius: 20, padding: 12, flexDirection: 'row', gap: 8 }}
                >
                  <View style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: C.iconBg, alignItems: 'center', justifyContent: 'center' }}>
                    <Image source={ANN_ICON} style={{ width: 24, height: 24 }} resizeMode="contain" />
                  </View>
                  <View style={{ flex: 1, gap: 8 }}>
                    <RNText style={{ fontFamily: fontSemiBold, fontSize: 16, color: C.ink }}>{a.title}</RNText>
                    <RNText style={{ fontFamily: fontRegular, fontSize: 12, color: C.gray, lineHeight: 18 }}>{a.preview}</RNText>
                    <RNText style={{ fontFamily: fontMedium, fontSize: 12, color: C.ink }}>{a.date}</RNText>
                  </View>
                </Pressable>
              ))}
            </View>
          ) : (
            <View style={{ marginTop: 40, alignItems: 'center' }}>
              <Image
                source={require('../../../assets/illustrations/announcement-empty.png')}
                style={{ width: 343, height: 343 }}
                resizeMode="contain"
              />
              <RNText style={{ fontFamily: fontSemiBold, fontSize: 16, color: C.ink, textAlign: 'center', marginTop: 8 }}>
                No Announcement yet!
              </RNText>
              <RNText style={{ fontFamily: fontMedium, fontSize: 14, color: C.gray, textAlign: 'center', marginTop: 12 }}>
                Content will appear once published by the admin.
              </RNText>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>

      <BottomNav active="news" />
    </View>
  );
}
