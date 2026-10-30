// Parent Profile — pixel-aligned with Figma `598:77070`. The menu links out to
// the child profile / media / events / privacy sub-screens; Notification and
// Quiet-hours are master toggles, and the language row flips the app locale.
import React, { useState } from 'react';
import { Pressable, ScrollView, Switch, Text as RNText, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { changeLocale } from '@nms/i18n/bootstrap';
import {
  ArrowDownIcon,
  ArrowLeftIcon,
  NotificationIcon,
  LogoutIcon,
  ChildIcon,
  GalleryIcon,
  CalendarIcon,
  AlarmIcon,
  GlobeIcon,
  ShieldIcon,
  MedicalIcon,
} from '@nms/ui';
import { useAuth, useNotificationPreferences, useUpdateNotificationPreferences } from '@nms/data';
import { useActiveChild } from '../../../lib/active-child';
import { BottomNav } from '../../../components/BottomNav';
import { SignOutDialog } from '../../../components/SignOutDialog';
import { ChildAvatar } from '../../../components/ChildAvatar';

const C = {
  page: '#FFFFF5',
  childCard: '#DFEBD1',
  rowBg: '#F8FAEE',
  ink: '#333333',
  brand: '#76945C',
  brandText: '#334722',
  signout: '#B5503C',
  gray: '#535353',
  trackOff: '#D8D8D8',
  thumb: '#FFFFFF',
};

export default function ProfileScreen() {
  const { i18n } = useTranslation(['common']);
  const { user, signOut } = useAuth();
  const { activeChild } = useActiveChild();
  const { data: prefs } = useNotificationPreferences();
  const updatePrefs = useUpdateNotificationPreferences();
  const [showSignOut, setShowSignOut] = useState(false);

  const isAr = i18n.language === 'ar';
  const fontRegular = isAr ? 'Amiri' : 'Lora';
  const fontMedium = isAr ? 'Amiri' : 'Lora-Medium';
  const fontBold = isAr ? 'Amiri-Bold' : 'Lora-Bold';

  const childName = activeChild?.fullName ?? '—';
  const roomName = activeChild?.roomName ?? '';
  const languageLabel = isAr ? 'العربية' : 'English';

  const notifications = prefs?.announcementsEnabled ?? true;
  const quietHours = !!prefs?.quietHoursStart;

  const onToggleNotifications = (v) => updatePrefs.mutate({ announcementsEnabled: v });
  const onToggleQuietHours = (v) => {
    if (v) router.push('/(app)/profile/settings/quiet-hours');
    else updatePrefs.mutate({ clearQuietHours: true });
  };

  const Chevron = (
    <View style={{ transform: [{ scaleX: -1 }] }}>
      <ArrowLeftIcon size={24} color={C.ink} />
    </View>
  );

  // Menu row — an icon, a label, and a trailing element (chevron / switch /
  // text). `onPress` makes the whole row tappable; `danger` recolours the
  // label (Sign Out) and drops the card background.
  function MenuRow({ icon, label, trailing, onPress, danger }) {
    const Wrapper = onPress ? Pressable : View;
    return (
      <Wrapper
        onPress={onPress}
        style={{
          height: 48,
          borderRadius: 20,
          backgroundColor: danger ? 'transparent' : C.rowBg,
          paddingHorizontal: 12,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        }}
      >
        {icon}
        <RNText
          style={{
            flex: 1,
            fontFamily: fontMedium,
            fontSize: 16,
            color: danger ? C.signout : C.ink,
          }}
        >
          {label}
        </RNText>
        {trailing}
      </Wrapper>
    );
  }

  function confirmSignOut() {
    setShowSignOut(true);
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.page }}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Screen title */}
          <RNText
            style={{
              fontFamily: fontBold,
              fontSize: 20,
              color: C.ink,
              textAlign: 'center',
            }}
          >
            Profile
          </RNText>

          {/* Child switcher card */}
          <View
            style={{
              marginTop: 32,
              backgroundColor: C.childCard,
              borderRadius: 20,
              padding: 8,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <ChildAvatar photoUrl={activeChild?.photoUrl} size={48} />
            <View style={{ flex: 1, gap: 8 }}>
              <RNText style={{ fontFamily: fontBold, fontSize: 18, color: C.ink }}>
                {childName}
              </RNText>
              <RNText style={{ fontFamily: fontRegular, fontSize: 12, color: C.ink }}>
                {roomName}
              </RNText>
            </View>
            <ArrowDownIcon size={24} color={C.ink} />
          </View>

          {/* Menu */}
          <View style={{ marginTop: 24, gap: 16 }}>
            <MenuRow
              icon={<ChildIcon size={24} color={C.ink} />}
              label="Child Profile"
              trailing={Chevron}
              onPress={() => router.push('/(app)/profile/child')}
            />
            <MenuRow
              icon={<GalleryIcon size={24} color={C.ink} />}
              label="Media Gallery"
              trailing={Chevron}
              onPress={() => router.push('/(app)/profile/media')}
            />
            <MenuRow
              icon={<CalendarIcon size={24} color={C.ink} strokeWidth={1.5} />}
              label="Events"
              trailing={Chevron}
              onPress={() => router.push('/(app)/profile/events')}
            />
            <MenuRow
              icon={<MedicalIcon size={24} color={C.ink} />}
              label="Incident Reports"
              trailing={Chevron}
              onPress={() => router.push('/(app)/incidents')}
            />
            <MenuRow
              icon={<NotificationIcon size={24} color={C.ink} />}
              label="Notification"
              trailing={
                <Switch
                  value={notifications}
                  onValueChange={onToggleNotifications}
                  trackColor={{ false: C.trackOff, true: C.brand }}
                  thumbColor={C.thumb}
                />
              }
            />
            <MenuRow
              icon={<AlarmIcon size={24} color={C.ink} />}
              label="Quiet hours"
              onPress={() => router.push('/(app)/profile/settings/quiet-hours')}
              trailing={
                <Switch
                  value={quietHours}
                  onValueChange={onToggleQuietHours}
                  trackColor={{ false: C.trackOff, true: C.brand }}
                  thumbColor={C.thumb}
                />
              }
            />
            <MenuRow
              icon={<GlobeIcon size={24} color={C.ink} />}
              label="language"
              // changeLocale saves the choice and applies right-to-left layout;
              // i18n.changeLanguage alone did neither.
              onPress={() => changeLocale(isAr ? 'en' : 'ar')}
              trailing={
                <RNText style={{ fontFamily: fontMedium, fontSize: 14, color: C.brandText }}>
                  {languageLabel}
                </RNText>
              }
            />
            <MenuRow
              icon={<ShieldIcon size={24} color={C.ink} />}
              label="Privacy & Security"
              trailing={Chevron}
              onPress={() => router.push('/(app)/profile/settings/privacy')}
            />
            <MenuRow
              icon={<LogoutIcon size={24} color={C.signout} />}
              label="Sign Out"
              danger
              onPress={confirmSignOut}
            />
          </View>

          {__DEV__ ? (
            <RNText
              style={{
                marginTop: 24,
                textAlign: 'center',
                fontFamily: fontRegular,
                fontSize: 11,
                color: C.gray,
              }}
            >
              {user?.email ?? '—'}
            </RNText>
          ) : null}
        </ScrollView>
      </SafeAreaView>

      <BottomNav active="profile" />

      <SignOutDialog
        visible={showSignOut}
        onCancel={() => setShowSignOut(false)}
        onConfirm={() => {
          setShowSignOut(false);
          signOut();
        }}
      />
    </View>
  );
}
