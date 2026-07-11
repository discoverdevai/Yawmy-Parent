// Events — pixel-aligned with Figma `598:77462` (upcoming), `598:77541`
// (saved) and `598:77586` (empty). Segmented tabs switch between all upcoming
// events and the ones the parent has bookmarked; each card can be saved/unsaved.
import React, { useState } from 'react';
import { Image, Pressable, ScrollView, Text as RNText, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { ArrowLeftIcon, BookmarkIcon, LocationIcon, CalendarIcon } from '@nms/ui';

const event1 = require('../../../assets/home/photos/event1.png');
const event2 = require('../../../assets/home/photos/event2.png');
const media1 = require('../../../assets/home/photos/media1.png');

const C = {
  green: '#DFEBD1',
  sheet: '#FFFFF5',
  tabBar: '#F5F5DC',
  ink: '#333333',
  gray: '#535353',
  brand: '#76945C',
  brandText: '#334722',
  coral: 'rgba(226,114,91,0.9)',
  cardBody: '#F8FAEE',
  white: '#FEFEFE',
  stroke: '#F5F5DC',
  overlay: 'rgba(0,0,0,0.2)',
  saveBg: 'rgba(255,255,255,0.6)',
};

const EVENTS = [
  { id: '1', category: 'Holiday', title: 'Art Day at the Nursery.', desc: 'Children will enjoy safe outdoor activities with their teachers.', place: 'At Nursery', date: 'Mar 30- 10:30 PM', image: event1 },
  { id: '2', category: 'Parent Meeting', title: 'Progress Discussion Meeting.', desc: 'Let’s discuss your child’s progress and development.', place: 'At Nursery', date: 'Mar 30- 10:30 PM', image: event2 },
  { id: '3', category: 'Parent Meeting', title: 'Progress Discussion Meeting.', desc: 'Let’s discuss your child’s progress and development.', place: 'At Nursery', date: 'Mar 30- 10:30 PM', image: media1 },
  { id: '4', category: 'Holiday', title: 'Art Day at the Nursery.', desc: 'Children will enjoy safe outdoor activities with their teachers.', place: 'At Nursery', date: 'Mar 30- 10:30 PM', image: event1 },
];

export default function EventsScreen() {
  const { i18n } = useTranslation(['common']);
  const isAr = i18n.language === 'ar';
  const fontRegular = isAr ? 'Amiri' : 'Lora';
  const fontMedium = isAr ? 'Amiri' : 'Lora-Medium';
  const fontSemiBold = isAr ? 'Amiri-Bold' : 'Lora-Bold';
  const fontBold = isAr ? 'Amiri-Bold' : 'Lora-Bold';

  const [tab, setTab] = useState('upcoming');
  const [saved, setSaved] = useState(() => new Set(['2', '4']));

  const toggleSave = (id) =>
    setSaved((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const list = tab === 'saved' ? EVENTS.filter((e) => saved.has(e.id)) : EVENTS;

  function Tab({ id, label }) {
    const active = tab === id;
    return (
      <Pressable
        onPress={() => setTab(id)}
        style={{
          flex: 1,
          height: 32,
          borderRadius: 12,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: active ? C.brand : 'transparent',
        }}
      >
        <RNText style={{ fontFamily: fontSemiBold, fontSize: 14, color: active ? C.sheet : C.gray }}>{label}</RNText>
      </Pressable>
    );
  }

  function MetaItem({ icon, text }) {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        {icon}
        <RNText style={{ fontFamily: fontMedium, fontSize: 12, color: C.brandText }}>{text}</RNText>
      </View>
    );
  }

  function EventCard({ item }) {
    const isSaved = saved.has(item.id);
    return (
      <View style={{ borderRadius: 20, overflow: 'hidden' }}>
        {/* Image slot */}
        <View style={{ height: 111 }}>
          <Image source={item.image} style={{ position: 'absolute', width: '100%', height: '100%' }} resizeMode="cover" />
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: C.overlay }} />
          <View
            style={{
              position: 'absolute',
              top: 8,
              left: 8,
              right: 8,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <View style={{ backgroundColor: C.coral, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 6 }}>
              <RNText style={{ fontFamily: fontSemiBold, fontSize: 10, color: C.white }}>{item.category}</RNText>
            </View>
            <Pressable
              onPress={() => toggleSave(item.id)}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isSaved ? C.brand : C.saveBg,
              }}
            >
              <BookmarkIcon size={20} color={isSaved ? C.white : C.brandText} filled={isSaved} />
            </Pressable>
          </View>
        </View>

        {/* Body slot */}
        <View style={{ backgroundColor: C.cardBody, paddingHorizontal: 8, paddingVertical: 12, gap: 8 }}>
          <View style={{ gap: 4 }}>
            <RNText style={{ fontFamily: fontSemiBold, fontSize: 16, color: C.ink }}>{item.title}</RNText>
            <RNText style={{ fontFamily: fontRegular, fontSize: 12, color: C.gray, lineHeight: 18 }}>{item.desc}</RNText>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <MetaItem icon={<LocationIcon size={16} color={C.brandText} />} text={item.place} />
            <MetaItem icon={<CalendarIcon size={16} color={C.brandText} />} text={item.date} />
          </View>
        </View>
      </View>
    );
  }

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
          <RNText style={{ fontFamily: fontBold, fontSize: 20, color: C.ink }}>Events</RNText>
        </View>

        {/* White sheet */}
        <View style={{ flex: 1, backgroundColor: C.sheet, borderTopLeftRadius: 40, borderTopRightRadius: 40, overflow: 'hidden' }}>
          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 24, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Segmented tabs */}
            <View style={{ backgroundColor: C.tabBar, borderRadius: 20, padding: 8, flexDirection: 'row', gap: 8 }}>
              <Tab id="upcoming" label="Upcoming" />
              <Tab id="saved" label="Saved" />
            </View>

            {list.length > 0 ? (
              <View style={{ marginTop: 24, gap: 16 }}>
                {list.map((item) => (
                  <EventCard key={item.id} item={item} />
                ))}
              </View>
            ) : (
              <View style={{ marginTop: 36, alignItems: 'center' }}>
                <Image
                  source={require('../../../assets/illustrations/events-empty.png')}
                  style={{ width: 343, height: 343 }}
                  resizeMode="contain"
                />
                <RNText style={{ fontFamily: fontSemiBold, fontSize: 16, color: C.ink, textAlign: 'center', marginTop: 16 }}>
                  Sorry! Nothing planned just yet.
                </RNText>
                <RNText style={{ fontFamily: fontMedium, fontSize: 14, color: C.gray, textAlign: 'center', marginTop: 12 }}>
                  We’ll share any upcoming events with you soon.
                </RNText>
              </View>
            )}
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  );
}
