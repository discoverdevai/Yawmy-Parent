// Chat list — pixel-aligned with Figma `598:76474`. Lists the parent's threads
// (teacher / admin / room group) with avatar, last message, time and unread
// badge; tapping opens the conversation.
import React from 'react';
import { Image, Pressable, ScrollView, Text as RNText, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { GroupIcon } from '@nms/ui';
import { BottomNav } from '../../../components/BottomNav';
import { THREADS } from '../../../lib/chat-threads';

const C = {
  page: '#FFFFF5',
  ink: '#333333',
  gray: '#535353',
  brand: '#76945C',
  green: '#DFEBD1',
  divider: '#F2F2F2',
  white: '#FFFFF5',
};

export default function ChatListScreen() {
  const { i18n } = useTranslation(['common']);
  const isAr = i18n.language === 'ar';
  const fontRegular = isAr ? 'Amiri' : 'Lora';
  const fontMedium = isAr ? 'Amiri' : 'Lora-Medium';
  const fontBold = isAr ? 'Amiri-Bold' : 'Lora-Bold';

  function Avatar({ thread }) {
    if (thread.kind === 'person') {
      return <Image source={thread.avatar} style={{ width: 48, height: 48, borderRadius: 24 }} />;
    }
    return (
      <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center' }}>
        {thread.kind === 'initial' ? (
          <RNText style={{ fontFamily: fontBold, fontSize: 24, color: C.ink }}>{thread.initial}</RNText>
        ) : (
          <GroupIcon size={30} color={C.ink} />
        )}
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.page }}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          <RNText style={{ fontFamily: fontBold, fontSize: 20, color: C.ink, textAlign: 'center' }}>Chat</RNText>

          <View style={{ marginTop: 24 }}>
            {THREADS.map((thread, i) => (
              <Pressable
                key={thread.id}
                onPress={() => router.push(`/(app)/chat/${thread.id}`)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  paddingHorizontal: 8,
                  paddingVertical: 16,
                  borderBottomWidth: i < THREADS.length - 1 ? 1 : 0,
                  borderBottomColor: C.divider,
                }}
              >
                <Avatar thread={thread} />
                <View style={{ flex: 1, gap: 8 }}>
                  <RNText style={{ fontFamily: fontMedium, fontSize: 16, color: C.ink }}>{thread.name}</RNText>
                  <RNText style={{ fontFamily: fontRegular, fontSize: 14, color: C.gray }} numberOfLines={1}>
                    {thread.preview}
                  </RNText>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 8 }}>
                  <RNText style={{ fontFamily: fontMedium, fontSize: 12, color: C.gray }}>{thread.time}</RNText>
                  {thread.unread > 0 ? (
                    <View style={{ minWidth: 24, height: 24, borderRadius: 12, paddingHorizontal: 7, backgroundColor: C.brand, alignItems: 'center', justifyContent: 'center' }}>
                      <RNText style={{ fontFamily: fontMedium, fontSize: 14, color: C.white }}>{thread.unread}</RNText>
                    </View>
                  ) : null}
                </View>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>

      <BottomNav active="fab" />
    </View>
  );
}
