// Notifications — pixel-aligned with Figma `598:75949` (list) and `598:75837`
// (empty). Unread rows are tinted with a filled bell; "Mark As Read" clears the
// unread state and "Delete All" empties the list into the empty state.
import React, { useState } from 'react';
import { Image, Pressable, ScrollView, Text as RNText, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { ArrowLeftIcon, NotificationIcon, NotificationBoldIcon } from '@nms/ui';

const C = {
  page: '#FFFFF5',
  ink: '#333333',
  black: '#121212',
  gray: '#535353',
  brand: '#76945C',
  unreadBg: '#FEF8ED',
  divider: '#F5F5DC',
  accent: '#E2725B',
  circleStroke: '#D8D8D8',
};

const INITIAL = [
  { id: '1', text: 'Official Holiday — Sunday, April 21  The nursery will be closed.', unread: true },
  { id: '2', text: 'End of Term Party ,Wednesday, April 23 · 10:00 AM.', unread: true },
  { id: '3', text: 'Arts & Creativity Day ,Saturday, April 26 · 9:00 AM.', unread: false },
  { id: '4', text: 'New event scheduled, Progress Discussion Meeting.', unread: false },
  { id: '5', text: 'New event scheduled, Progress Discussion Meeting.', unread: false },
  { id: '6', text: 'New event scheduled, Progress Discussion Meeting.', unread: false },
  { id: '7', text: 'New event scheduled, Progress Discussion Meeting.', unread: false },
  { id: '8', text: 'New event scheduled, Progress Discussion Meeting.', unread: false },
];

export default function NotificationsScreen() {
  const { i18n } = useTranslation(['common']);
  const isAr = i18n.language === 'ar';
  const fontMedium = isAr ? 'Amiri' : 'Lora-Medium';
  const fontSemiBold = isAr ? 'Amiri-Bold' : 'Lora-Bold';
  const fontBold = isAr ? 'Amiri-Bold' : 'Lora-Bold';

  const [items, setItems] = useState(INITIAL);

  const markAllRead = () => setItems((list) => list.map((n) => ({ ...n, unread: false })));
  const deleteAll = () => setItems([]);

  return (
    <View style={{ flex: 1, backgroundColor: C.page }}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 16, paddingVertical: 12 }}>
          <Pressable
            onPress={() => router.back()}
            style={{ width: 48, height: 48, borderRadius: 24, borderWidth: 1, borderColor: C.circleStroke, alignItems: 'center', justifyContent: 'center' }}
          >
            <ArrowLeftIcon size={24} color={C.ink} />
          </Pressable>
          <RNText style={{ fontFamily: fontBold, fontSize: 20, color: C.ink }}>Notification</RNText>
        </View>

        {items.length > 0 ? (
          <>
            {/* Actions */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 8 }}>
              <Pressable onPress={markAllRead} hitSlop={8}>
                <RNText style={{ fontFamily: fontMedium, fontSize: 14, color: C.black }}>Mark As Read</RNText>
              </Pressable>
              <Pressable onPress={deleteAll} hitSlop={8} style={{ height: 40, justifyContent: 'center' }}>
                <RNText style={{ fontFamily: fontSemiBold, fontSize: 16, color: C.brand }}>Delete All</RNText>
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
              {items.map((n) => (
                <View
                  key={n.id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    gap: 8,
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    minHeight: 40,
                    justifyContent: 'center',
                    backgroundColor: n.unread ? C.unreadBg : 'transparent',
                    borderBottomWidth: 1,
                    borderBottomColor: C.divider,
                  }}
                >
                  {n.unread ? (
                    <NotificationBoldIcon size={24} color={C.accent} />
                  ) : (
                    <NotificationIcon size={24} color={C.gray} />
                  )}
                  <RNText style={{ flex: 1, fontFamily: fontMedium, fontSize: 14, color: C.ink, lineHeight: 21 }}>{n.text}</RNText>
                </View>
              ))}
            </ScrollView>
          </>
        ) : (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
            <Image
              source={require('../../../assets/illustrations/announcement-empty.png')}
              style={{ width: 300, height: 300 }}
              resizeMode="contain"
            />
            <RNText style={{ fontFamily: fontSemiBold, fontSize: 16, color: C.ink, textAlign: 'center', marginTop: 8 }}>
              Nothing here yet, you’re all set!
            </RNText>
            <RNText style={{ fontFamily: fontMedium, fontSize: 14, color: C.gray, textAlign: 'center', marginTop: 12 }}>
              Nothing here yet, we’ll notify you when there are notifications.
            </RNText>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}
