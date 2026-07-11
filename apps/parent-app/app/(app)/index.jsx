// Parent home — pixel-aligned with Figma `279:21169` (empty / not checked in)
// and `279:21351` (checked in). Geofence status is currently mocked via a
// dev toggle so the user can flip between the two states; real
// expo-location wiring lands in a follow-up turn.
import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  Text as RNText,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SCREEN_WIDTH = Dimensions.get('window').width;
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import {
  ArrowDownIcon,
  NotificationIcon,
  NotificationBoldIcon,
  PinCheckIcon,
  ErrorOutlineIcon,
} from '@nms/ui';
import { useAuth } from '@nms/data';
import { HomeAfterCheckIn } from './_home-after-checkin';
import { BottomNav } from '../../components/BottomNav';
import { CalendarWeek } from '../../components/CalendarWeek';

const C = {
  page: '#FFFFF5',
  card: '#FFFFFF',
  cardSec: '#FCFCEC',
  brand: '#76945C',
  brandDark: '#334722',
  brandLight: '#F8FAEE',
  ink: '#333333',
  muted: '#535353',
  border: '#D8D8D8',
  error: '#C90101',
  fefe: '#FEFEFE',
};

export default function ParentHome() {
  const { i18n } = useTranslation(['common']);
  const { user, signOut } = useAuth();
  const [insideGeofence, setInsideGeofence] = useState(true);
  const [hasNotifications, setHasNotifications] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);

  // Once the parent checks in — or for parent2@nms.local, seeded as already
  // checked in — we render the populated "Home — after check in" Figma frame.
  if (checkedIn || user?.email === 'parent2@nms.local') {
    return <HomeAfterCheckIn user={user} onSignOut={signOut} />;
  }

  const fontRegular = i18n.language === 'ar' ? 'Amiri' : 'Lora';
  const fontMedium = i18n.language === 'ar' ? 'Amiri' : 'Lora-Medium';
  const fontSemiBold = i18n.language === 'ar' ? 'Amiri-Bold' : 'Lora-Bold';
  const fontBold = i18n.language === 'ar' ? 'Amiri-Bold' : 'Lora-Bold';

  const childName = 'Kaylynn  Arcand';
  const roomName = 'Sunflower';

  return (
    <View style={{ flex: 1, backgroundColor: C.page }}>
      {/* Header curved background — full width, sits behind the avatar/calendar.
          Keeps the green-curve decoration that bleeds into the page. */}
      <Image
        source={require('../../assets/home/header-bg.png')}
        style={{ position: 'absolute', left: 0, top: 0, width: SCREEN_WIDTH, height: 203 }}
        resizeMode="stretch"
      />

      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Top row: avatar + child name + dropdown + bell */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              paddingHorizontal: 20,
              paddingTop: 16,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
              <Image
                source={require('../../assets/home/avatar.png')}
                style={{ width: 48, height: 48, borderRadius: 24 }}
              />
              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 16,
                }}
              >
                <View style={{ gap: 4, flex: 1 }}>
                  <RNText
                    style={{ fontFamily: fontSemiBold, fontSize: 14, color: C.ink }}
                  >
                    {childName}
                  </RNText>
                  <RNText
                    style={{ fontFamily: fontRegular, fontSize: 12, color: C.ink }}
                  >
                    {roomName}
                  </RNText>
                </View>
                <ArrowDownIcon size={24} color={C.ink} />
              </View>
            </View>
            <Pressable
              onPress={() => router.push('/(app)/notifications')}
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: C.page,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {hasNotifications ? (
                <NotificationBoldIcon size={24} color={C.brandDark} />
              ) : (
                <NotificationIcon size={24} color={C.ink} />
              )}
            </Pressable>
          </View>

          {/* Calendar strip */}
          <View style={{ marginTop: 24 }}>
            <CalendarWeek
              selectedDay={21}
              hasUpdate={false}
              onDayPress={(day) => {
                const t = new Date();
                const ymd = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                router.push(`/(app)/day-details/${ymd}`);
              }}
            />
          </View>

          {/* Today's Attendance card */}
          <View
            style={{
              backgroundColor: C.cardSec,
              paddingHorizontal: 20,
              paddingVertical: 12,
              marginTop: 16,
            }}
          >
            <View style={{ gap: 24 }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <RNText style={{ fontFamily: fontBold, fontSize: 20, color: C.ink }}>
                  {`Today's Attendance`}
                </RNText>
                <Pressable onPress={() => router.push('/(app)/attendance/history')}>
                  <RNText
                    style={{
                      fontFamily: fontMedium,
                      fontSize: 12,
                      color: C.brandDark,
                      textDecorationLine: 'underline',
                    }}
                  >
                    View History
                  </RNText>
                </Pressable>
              </View>

              <View style={{ gap: 8 }}>
                <Pressable
                  disabled={!insideGeofence}
                  onPress={() => setCheckedIn(true)}
                  style={{
                    height: 48,
                    borderRadius: 20,
                    backgroundColor: C.brand,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    opacity: insideGeofence ? 1 : 0.4,
                  }}
                >
                  <PinCheckIcon size={24} color={C.fefe} />
                  <RNText style={{ fontFamily: fontBold, fontSize: 16, color: C.fefe }}>
                    Check In
                  </RNText>
                </Pressable>
                {!insideGeofence ? (
                  <View
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
                  >
                    <ErrorOutlineIcon size={24} color={C.error} />
                    <RNText
                      style={{ fontFamily: fontMedium, fontSize: 12, color: C.error }}
                    >
                      You must be within 100m of the nursery to check-in.
                    </RNText>
                  </View>
                ) : null}
              </View>
            </View>
          </View>

          {/* Empty state */}
          <View
            style={{
              alignSelf: 'center',
              alignItems: 'center',
              gap: 8,
              width: 327,
              marginTop: 48,
            }}
          >
            <Image
              source={require('../../assets/home/empty-state.png')}
              style={{ width: 201, height: 201 }}
              resizeMode="contain"
            />
            <View style={{ alignItems: 'center', gap: 12 }}>
              <RNText
                style={{
                  fontFamily: fontSemiBold,
                  fontSize: 16,
                  color: C.ink,
                  textAlign: 'center',
                }}
              >
                No updates yet!
              </RNText>
              <RNText
                style={{
                  fontFamily: fontRegular,
                  fontSize: 14,
                  color: C.muted,
                  textAlign: 'center',
                }}
              >
                Content will appear once published by the teacher.
              </RNText>
            </View>
          </View>

          {__DEV__ ? (
            <View style={{ paddingHorizontal: 20, marginTop: 32, gap: 8 }}>
              <Pressable
                onPress={() => setInsideGeofence((v) => !v)}
                style={{
                  height: 36,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: C.border,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: C.card,
                }}
              >
                <RNText style={{ fontFamily: fontMedium, fontSize: 12, color: C.muted }}>
                  Dev · Toggle geofence ({insideGeofence ? 'inside' : 'outside'})
                </RNText>
              </Pressable>
              <Pressable
                onPress={() => setHasNotifications((v) => !v)}
                style={{
                  height: 36,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: C.border,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: C.card,
                }}
              >
                <RNText style={{ fontFamily: fontMedium, fontSize: 12, color: C.muted }}>
                  Dev · Toggle notifications ({hasNotifications ? 'has updates' : 'none'})
                </RNText>
              </Pressable>
              <Pressable
                onPress={signOut}
                style={{
                  height: 36,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: C.border,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: C.card,
                }}
              >
                <RNText style={{ fontFamily: fontMedium, fontSize: 12, color: C.muted }}>
                  Dev · Sign out ({user?.email ?? '—'})
                </RNText>
              </Pressable>
            </View>
          ) : null}
        </ScrollView>
      </SafeAreaView>

      <BottomNav active="home" />
    </View>
  );
}
