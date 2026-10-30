// Chat list — pixel-aligned with Figma `598:76474`, now backed by the real
// directory instead of sample threads.
//
// The list is derived by the backend from who this parent is related to *right
// now*: the nursery office, and — for the selected child — that child's room
// group and the teachers who actually teach it. So switching child re-fetches
// rather than filters, and a child moving room quietly changes who is listed
// with nothing here to clean up.
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  Text as RNText,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { router, useFocusEffect } from 'expo-router';
import { GroupIcon } from '@nms/ui';
import {
  useChatDirectory,
  useChatSocketConfig,
  useAuthFileHeaders,
  connectChatSocket,
} from '@nms/data';
import { BottomNav } from '../../../components/BottomNav';
import { useActiveChild } from '../../../lib/active-child';

const C = {
  page: '#FFFFF5',
  ink: '#333333',
  gray: '#535353',
  brand: '#76945C',
  green: '#DFEBD1',
  divider: '#F2F2F2',
  white: '#FFFFF5',
};

/**
 * The right-hand stamp: a time today, "Yesterday", then a date. Chat lists are
 * scanned rather than read, so recent rows show a time and older ones only need
 * to be placeable.
 */
function stampOf(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const startOf = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const today = startOf(new Date());
  const day = startOf(d);
  if (day === today) {
    let h = d.getHours();
    const m = String(d.getMinutes()).padStart(2, '0');
    const period = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${m} ${period}`;
  }
  if (day === today - 86400000) return 'Yesterday';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/** A stable key — rows nobody has messaged yet have no thread id to use. */
function rowKey(row) {
  return row.threadId || `${row.kind}:${row.peerUserId || row.roomId || 'self'}`;
}

export default function ChatListScreen() {
  const { i18n } = useTranslation(['common']);
  const isAr = i18n.language === 'ar';
  const fontRegular = isAr ? 'Amiri' : 'Lora';
  const fontMedium = isAr ? 'Amiri' : 'Lora-Medium';
  const fontBold = isAr ? 'Amiri-Bold' : 'Lora-Bold';

  const { children, activeChild, activeChildId, setActiveChildId, hasMultiple } = useActiveChild();
  const [pickerOpen, setPickerOpen] = useState(false);
  const authHeaders = useAuthFileHeaders();

  // Keyed by child id, so choosing a different child is a different query and
  // React Query refetches without the screen having to invalidate anything.
  const { data: rows, isLoading, error, refetch, isRefetching } = useChatDirectory(activeChildId);

  // A message in any thread reorders this list and grows a badge, even when that
  // conversation is not open. One personal queue does that without subscribing
  // to every thread on screen.
  const socketConfig = useChatSocketConfig();
  useEffect(() => {
    const socket = connectChatSocket({ ...socketConfig, onInboxMessage: () => refetch() });
    return () => socket.disconnect();
  }, [socketConfig, refetch]);

  // Unread counts go stale while a conversation is read elsewhere.
  useFocusEffect(
    React.useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const list = rows ?? [];

  function Avatar({ row }) {
    if (row.isGroup) {
      return (
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: C.green,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <GroupIcon size={30} color={C.ink} />
        </View>
      );
    }
    if (row.avatarUrl) {
      // /api/files/** requires authentication and the image loader does not go
      // through the REST client, so without this the avatar 403s and renders as
      // an empty circle.
      return (
        <Image
          source={{ uri: row.avatarUrl, headers: authHeaders }}
          style={{ width: 48, height: 48, borderRadius: 24 }}
        />
      );
    }
    return (
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: 24,
          backgroundColor: C.green,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <RNText style={{ fontFamily: fontBold, fontSize: 20, color: C.ink }}>
          {(row.title || '?').trim().charAt(0).toUpperCase()}
        </RNText>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.page }}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={C.brand} />
          }
        >
          <RNText style={{ fontFamily: fontBold, fontSize: 20, color: C.ink, textAlign: 'center' }}>
            Chat
          </RNText>

          {/* Which child these conversations are about. Only shown when there is
              a choice to make — one child needs no switcher. */}
          {hasMultiple ? (
            <Pressable
              onPress={() => setPickerOpen(true)}
              style={{
                marginTop: 12,
                alignSelf: 'center',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: C.green,
              }}
              accessibilityRole="button"
              accessibilityLabel="Switch child"
            >
              <RNText style={{ fontFamily: fontMedium, fontSize: 14, color: C.ink }}>
                {activeChild?.fullName ?? 'Select child'}
              </RNText>
              <RNText style={{ fontFamily: fontMedium, fontSize: 12, color: C.gray }}>▼</RNText>
            </Pressable>
          ) : null}

          <View style={{ marginTop: 24 }}>
            {isLoading && list.length === 0 ? (
              <View style={{ paddingVertical: 48, alignItems: 'center' }}>
                <ActivityIndicator size="large" color={C.brand} />
              </View>
            ) : error && list.length === 0 ? (
              <View style={{ paddingVertical: 48, alignItems: 'center', gap: 8 }}>
                <RNText
                  style={{
                    fontFamily: fontRegular,
                    fontSize: 14,
                    color: C.gray,
                    textAlign: 'center',
                  }}
                >
                  {error.message || 'Could not load your chats.'}
                </RNText>
                <Pressable onPress={refetch} hitSlop={8}>
                  <RNText style={{ fontFamily: fontBold, fontSize: 14, color: C.brand }}>
                    Try Again
                  </RNText>
                </Pressable>
              </View>
            ) : list.length === 0 ? (
              <View style={{ paddingVertical: 48, alignItems: 'center' }}>
                <RNText
                  style={{
                    fontFamily: fontRegular,
                    fontSize: 14,
                    color: C.gray,
                    textAlign: 'center',
                  }}
                >
                  No chats yet.
                </RNText>
              </View>
            ) : (
              list.map((row, i) => (
                <Pressable
                  key={rowKey(row)}
                  onPress={() =>
                    router.push({
                      // A row with no thread yet has no id to route with, so the
                      // conversation screen is handed the row and opens it.
                      pathname: '/(app)/chat/[id]',
                      params: {
                        id: row.threadId || 'new',
                        kind: row.kind,
                        peerUserId: row.peerUserId ?? '',
                        roomId: row.roomId ?? '',
                        name: row.title,
                        subtitle: row.subtitle,
                        avatarUrl: row.avatarUrl ?? '',
                      },
                    })
                  }
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                    paddingHorizontal: 8,
                    paddingVertical: 16,
                    borderBottomWidth: i < list.length - 1 ? 1 : 0,
                    borderBottomColor: C.divider,
                  }}
                >
                  <Avatar row={row} />
                  <View style={{ flex: 1, gap: 8 }}>
                    <RNText style={{ fontFamily: fontMedium, fontSize: 16, color: C.ink }}>
                      {row.title}
                    </RNText>
                    {/* No conversation yet means no preview, so who they are —
                        "Lead Teacher", "Nursery office" — stands in for it. */}
                    <RNText
                      style={{
                        fontFamily: fontRegular,
                        fontSize: 14,
                        color: C.gray,
                        fontStyle: row.preview ? 'normal' : 'italic',
                        opacity: row.preview ? 1 : 0.75,
                      }}
                      numberOfLines={1}
                    >
                      {row.preview || row.subtitle}
                    </RNText>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 8 }}>
                    <RNText style={{ fontFamily: fontMedium, fontSize: 12, color: C.gray }}>
                      {stampOf(row.lastMessageAt)}
                    </RNText>
                    {row.unread > 0 ? (
                      <View
                        style={{
                          minWidth: 24,
                          height: 24,
                          borderRadius: 12,
                          paddingHorizontal: 7,
                          backgroundColor: C.brand,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <RNText style={{ fontFamily: fontMedium, fontSize: 14, color: C.white }}>
                          {row.unread > 99 ? '99+' : row.unread}
                        </RNText>
                      </View>
                    ) : null}
                  </View>
                </Pressable>
              ))
            )}
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Child picker */}
      <Modal
        visible={pickerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setPickerOpen(false)}
      >
        <Pressable
          onPress={() => setPickerOpen(false)}
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.35)',
            justifyContent: 'center',
            padding: 24,
          }}
        >
          <View style={{ backgroundColor: C.white, borderRadius: 20, overflow: 'hidden' }}>
            <RNText style={{ fontFamily: fontBold, fontSize: 16, color: C.ink, padding: 16 }}>
              Show chats for
            </RNText>
            {children.map((child) => (
              <Pressable
                key={child.id}
                onPress={() => {
                  setActiveChildId(child.id);
                  setPickerOpen(false);
                }}
                style={{
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                  borderTopWidth: 1,
                  borderTopColor: C.divider,
                  backgroundColor: child.id === activeChildId ? C.green : 'transparent',
                }}
              >
                <RNText style={{ fontFamily: fontMedium, fontSize: 15, color: C.ink }}>
                  {child.fullName}
                </RNText>
                {child.roomName ? (
                  <RNText
                    style={{ fontFamily: fontRegular, fontSize: 13, color: C.gray, marginTop: 2 }}
                  >
                    {child.roomName}
                  </RNText>
                ) : null}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>

      <BottomNav active="fab" />
    </View>
  );
}
