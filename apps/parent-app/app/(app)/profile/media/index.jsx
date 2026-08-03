// Media Gallery — pixel-aligned with Figma `598:77345` (populated) and
// `598:77368` (empty state). A month header + week strip pick the day; the 21st
// shows a masonry photo grid, other days show the "no media" empty state.
import React, { useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, Text as RNText, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { ArrowLeftIcon } from '@nms/ui';
import { useChildMedia } from '@nms/data';
import { useActiveChild } from '../../../../lib/active-child';
import { AuthImage } from '../../../../components/AuthImage';

const C = {
  green: '#DFEBD1',
  sheet: '#FFFFF5',
  ink: '#333333',
  gray: '#535353',
  brand: '#76945C',
  white: '#FEFEFE',
  stroke: '#F5F5DC',
  circleStroke: '#D8D8D8',
};

const WEEK_LABELS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function toYmd(d) {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

// The 7 days of the current week (Mon–Sun) around today.
function currentWeek() {
  const today = new Date();
  const dow = (today.getDay() + 6) % 7; // Mon = 0
  const monday = new Date(today);
  monday.setDate(today.getDate() - dow);
  return WEEK_LABELS.map((label, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return { label, date: d.getDate(), ymd: toYmd(d) };
  });
}

export default function MediaGalleryScreen() {
  const { i18n } = useTranslation(['common']);
  const isAr = i18n.language === 'ar';
  const fontRegular = isAr ? 'Amiri' : 'Lora';
  const fontMedium = isAr ? 'Amiri' : 'Lora-Medium';
  const fontSemiBold = isAr ? 'Amiri-Bold' : 'Lora-Bold';
  const fontBold = isAr ? 'Amiri-Bold' : 'Lora-Bold';

  const [days] = useState(currentWeek);
  const [selected, setSelected] = useState(() => toYmd(new Date()));

  const { activeChildId: childId } = useActiveChild();
  const mediaQuery = useChildMedia(childId, selected);
  const photos = mediaQuery.data ?? [];

  const selectedDate = new Date(selected);
  const monthLabel = `${MONTHS[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`;

  const CircleBtn = ({ flip }) => (
    <View
      style={{
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: C.circleStroke,
        alignItems: 'center',
        justifyContent: 'center',
        transform: flip ? [{ scaleX: -1 }] : undefined,
      }}
    >
      <ArrowLeftIcon size={24} color={C.ink} />
    </View>
  );

  function openPhoto(item) {
    router.push(`/(app)/profile/media/photo?uri=${encodeURIComponent(item.fileUrl)}`);
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
          <RNText style={{ fontFamily: fontBold, fontSize: 20, color: C.ink }}>Media Gallery</RNText>
        </View>

        {/* White sheet */}
        <View style={{ flex: 1, backgroundColor: C.sheet, borderTopLeftRadius: 40, borderTopRightRadius: 40, overflow: 'hidden' }}>
          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 24, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Month header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
              <Pressable hitSlop={6}>
                <CircleBtn />
              </Pressable>
              <RNText style={{ fontFamily: fontMedium, fontSize: 14, color: C.ink }}>{monthLabel}</RNText>
              <Pressable hitSlop={6}>
                <CircleBtn flip />
              </Pressable>
            </View>

            {/* Week strip */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 16,
                marginTop: 12,
              }}
            >
              {days.map((d) => {
                const active = d.ymd === selected;
                if (active) {
                  return (
                    <Pressable
                      key={d.ymd}
                      onPress={() => setSelected(d.ymd)}
                      style={{
                        width: 48,
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 16,
                        backgroundColor: C.brand,
                        alignItems: 'center',
                        gap: 2,
                      }}
                    >
                      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: C.white }} />
                      <RNText style={{ fontFamily: fontRegular, fontSize: 12, color: C.white }}>{d.label}</RNText>
                      <RNText style={{ fontFamily: fontBold, fontSize: 16, color: C.white }}>{d.date}</RNText>
                    </Pressable>
                  );
                }
                return (
                  <Pressable
                    key={d.ymd}
                    onPress={() => setSelected(d.ymd)}
                    hitSlop={6}
                    style={{ alignItems: 'center', gap: 2 }}
                  >
                    <RNText style={{ fontFamily: fontRegular, fontSize: 12, color: C.gray }}>{d.label}</RNText>
                    <RNText style={{ fontFamily: fontBold, fontSize: 16, color: C.ink }}>{d.date}</RNText>
                  </Pressable>
                );
              })}
            </View>

            {/* Content: loading, masonry grid, or empty state */}
            {mediaQuery.isLoading ? (
              <View style={{ marginTop: 64, alignItems: 'center' }}>
                <ActivityIndicator color={C.brand} />
              </View>
            ) : photos.length > 0 ? (
              <View
                style={{
                  marginTop: 32,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}
              >
                <Pressable onPress={() => openPhoto(photos[0])} style={{ width: 166 }}>
                  <AuthImage uri={photos[0].fileUrl} style={{ width: 166, height: 242, borderRadius: 20 }} resizeMode="cover" />
                </Pressable>
                <View style={{ width: 165, gap: 12 }}>
                  {photos.slice(1).map((p) => (
                    <Pressable key={p.id} onPress={() => openPhoto(p)}>
                      <AuthImage uri={p.fileUrl} style={{ width: 165, height: 115, borderRadius: 20 }} resizeMode="cover" />
                    </Pressable>
                  ))}
                </View>
              </View>
            ) : (
              <View style={{ marginTop: 48, alignItems: 'center', gap: 12 }}>
                <Image
                  source={require('../../../../assets/illustrations/media-empty.png')}
                  style={{ width: 343, height: 286 }}
                  resizeMode="contain"
                />
                <RNText style={{ fontFamily: fontSemiBold, fontSize: 16, color: C.ink, textAlign: 'center' }}>
                  Sorry! No Media for this day!
                </RNText>
                <RNText style={{ fontFamily: fontMedium, fontSize: 14, color: C.gray, textAlign: 'center' }}>
                  Content will appear once published by the teacher.
                </RNText>
              </View>
            )}
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  );
}
