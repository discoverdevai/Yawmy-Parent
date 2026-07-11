// Media Gallery — pixel-aligned with Figma `598:77345` (populated) and
// `598:77368` (empty state). A month header + week strip pick the day; the 21st
// shows a masonry photo grid, other days show the "no media" empty state.
import React, { useState } from 'react';
import { Image, Pressable, ScrollView, Text as RNText, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { ArrowLeftIcon } from '@nms/ui';
import { PHOTOS_BY_DAY } from '../../../../lib/media-photos';

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

const DAYS = [
  { label: 'Mo', date: 18 },
  { label: 'Tu', date: 19 },
  { label: 'Wed', date: 20 },
  { label: 'Th', date: 21 },
  { label: 'Fr', date: 22 },
  { label: 'Sa', date: 23 },
  { label: 'Su', date: 24 },
];

export default function MediaGalleryScreen() {
  const { i18n } = useTranslation(['common']);
  const isAr = i18n.language === 'ar';
  const fontRegular = isAr ? 'Amiri' : 'Lora';
  const fontMedium = isAr ? 'Amiri' : 'Lora-Medium';
  const fontSemiBold = isAr ? 'Amiri-Bold' : 'Lora-Bold';
  const fontBold = isAr ? 'Amiri-Bold' : 'Lora-Bold';

  const [selected, setSelected] = useState(21);
  const photos = PHOTOS_BY_DAY[selected] ?? [];

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

  function openPhoto(index) {
    router.push(`/(app)/profile/media/photo?day=${selected}&index=${index}`);
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
              <RNText style={{ fontFamily: fontMedium, fontSize: 14, color: C.ink }}>March 2026</RNText>
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
              {DAYS.map((d) => {
                const active = d.date === selected;
                if (active) {
                  return (
                    <Pressable
                      key={d.date}
                      onPress={() => setSelected(d.date)}
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
                    key={d.date}
                    onPress={() => setSelected(d.date)}
                    hitSlop={6}
                    style={{ alignItems: 'center', gap: 2 }}
                  >
                    <RNText style={{ fontFamily: fontRegular, fontSize: 12, color: C.gray }}>{d.label}</RNText>
                    <RNText style={{ fontFamily: fontBold, fontSize: 16, color: C.ink }}>{d.date}</RNText>
                  </Pressable>
                );
              })}
            </View>

            {/* Content: masonry grid or empty state */}
            {photos.length > 0 ? (
              <View
                style={{
                  marginTop: 32,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}
              >
                <Pressable onPress={() => openPhoto(0)} style={{ width: 166 }}>
                  <Image source={photos[0]} style={{ width: 166, height: 242, borderRadius: 20 }} resizeMode="cover" />
                </Pressable>
                <View style={{ width: 165, gap: 12 }}>
                  {photos.slice(1).map((p, i) => (
                    <Pressable key={i} onPress={() => openPhoto(i + 1)}>
                      <Image source={p} style={{ width: 165, height: 115, borderRadius: 20 }} resizeMode="cover" />
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
