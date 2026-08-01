// Notifications — pixel-aligned with Figma `598:75949` (list) and `598:75837`
// (empty). Unread rows are tinted with a filled bell; "Mark As Read" clears the
// unread state and "Delete All" empties the list into the empty state.
import React from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, Text as RNText, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { ArrowLeftIcon, NotificationIcon, NotificationBoldIcon } from '@nms/ui';
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useDeleteAllNotifications,
} from '@nms/data';

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

export default function NotificationsScreen() {
  const { i18n } = useTranslation(['common']);
  const isAr = i18n.language === 'ar';
  const fontMedium = isAr ? 'Amiri' : 'Lora-Medium';
  const fontSemiBold = isAr ? 'Amiri-Bold' : 'Lora-Bold';
  const fontBold = isAr ? 'Amiri-Bold' : 'Lora-Bold';

  const { data, isLoading } = useNotifications('all');
  const items = data ?? [];
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();
  const deleteAllMut = useDeleteAllNotifications();

  const markAllRead = () => markAll.mutate();
  const deleteAll = () => deleteAllMut.mutate();

  function onOpen(n) {
    if (n.unread) markRead.mutate(n.id);
    if (n.type === 'ANNOUNCEMENT_PUBLISHED' && n.entityId) {
      router.push(`/(app)/news/${n.entityId}`);
    } else if ((n.type === 'INCIDENT_REPORTED' || n.type === 'INCIDENT_ACKNOWLEDGED') && n.entityId) {
      router.push(`/(app)/incidents/${n.entityId}`);
    }
  }

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

        {isLoading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator color={C.brand} />
          </View>
        ) : items.length > 0 ? (
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
                <Pressable
                  key={n.id}
                  onPress={() => onOpen(n)}
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
                </Pressable>
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
