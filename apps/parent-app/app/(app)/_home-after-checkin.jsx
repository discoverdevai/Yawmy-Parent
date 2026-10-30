// Populated home — Figma frame `279:21432` "Home-after check in".
// Shown to parent2@nms.local. All photos, icons, and event covers are
// pulled directly from Figma assets at apps/parent-app/assets/home/photos/.
import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  Text as RNText,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import {
  ArrowDownIcon,
  NotificationBoldIcon,
  LogoutIcon,
  CalendarIcon,
  LocationIcon,
  BookmarkIcon,
} from '@nms/ui';
import { Clock, Music, Palette, BookOpen, Pause, Activity } from 'lucide-react-native';
import { BottomNav } from '../../components/BottomNav';
import { CalendarWeek } from '../../components/CalendarWeek';
import { AuthImage } from '../../components/AuthImage';
import { ChildAvatar } from '../../components/ChildAvatar';
import { resolveFileUrl } from '../../lib/apiBase';
import {
  useAuth,
  useParentNursery,
  useChildAttendance,
  useChildDailyLog,
  useChildMedia,
  useChildSchedule,
  useParentAnnouncements,
  useParentEvents,
  useParentCheckOut,
} from '@nms/data';
import { useActiveChild } from '../../lib/active-child';
import { useGeofence } from '../../lib/useGeofence';

function fmtTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  let h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${String(h).padStart(2, '0')}:${m} ${ampm}`;
}

const MOOD_LABELS = {
  happy: 'Happy and active so far.',
  calm: 'Calm and content.',
  fussy: 'A little fussy today.',
  sad: 'Felt down today.',
  sleepy: 'Sleepy and quiet.',
  energetic: 'Full of energy.',
};

function napsHours(naps) {
  if (!naps?.length) return null;
  let total = 0;
  for (const n of naps) {
    if (n.startAt && n.endAt) {
      total += (new Date(n.endAt).getTime() - new Date(n.startAt).getTime()) / 3600000;
    }
  }
  return total > 0 ? Math.round(total * 10) / 10 : null;
}

function mealsLine(meals) {
  if (!meals?.length) return '—';
  return meals.length === 1 ? `${meals[0].description}.` : `${meals.length} meals logged.`;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const SIDE_PAD = 16;
const CARD_WIDTH = SCREEN_WIDTH - SIDE_PAD * 2;

const C = {
  page: '#FFFFF5',
  card: '#FFFFFF',
  cardSec: '#FCFCEC',
  brand: '#76945C',
  brandLight: '#F8FAEE',
  brandDark: '#334722',
  cream: '#F5F5DC',
  ink: '#333333',
  muted: '#535353',
  border: '#D8D8D8',
  fefe: '#FEFEFE',
  red: '#E2725B',
  redSoft: 'rgba(226,114,91,0.9)',
};

const ANN_ICON = require('../../assets/home/photos/announcement-icon.png');
const MOOD_MASK = require('../../assets/home/photos/mood.png');
const NAP_MASK = require('../../assets/home/photos/nap.png');
const MEALS_MASK = require('../../assets/home/photos/meals.png');
const CHECKEDIN_ICON = require('../../assets/home/photos/checkedin-icon.png');

// Map the backend session (name + LocalTime start/end + teacher) into the
// timeline item the ScheduleEntry component renders.
function scheduleIcon(name) {
  const n = String(name ?? '').toLowerCase();
  if (n.includes('music')) return Music;
  if (n.includes('art') || n.includes('paint') || n.includes('craft')) return Palette;
  if (n.includes('story') || n.includes('read') || n.includes('book')) return BookOpen;
  if (n.includes('break') || n.includes('rest') || n.includes('nap') || n.includes('lunch'))
    return Pause;
  return Activity;
}

// LocalTime "HH:mm[:ss]" -> "09:00 AM".
function fmtClock(t) {
  if (!t) return '';
  const [H, M] = String(t).split(':').map(Number);
  const h = H % 12 || 12;
  const ampm = H >= 12 ? 'PM' : 'AM';
  return `${String(h).padStart(2, '0')}:${String(M).padStart(2, '0')} ${ampm}`;
}

function sessionState(dateStr, startTime, endTime) {
  const now = new Date();
  const start = new Date(`${dateStr}T${startTime}`);
  const end = new Date(`${dateStr}T${endTime}`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 'upcoming';
  if (now > end) return 'past';
  if (now >= start && now <= end) return 'active';
  return 'upcoming';
}

function teacherInitials(name) {
  if (!name) return '';
  const parts = String(name)
    .replace(/^(Ms|Mr|Mrs|Dr)\.?\s+/i, '')
    .trim()
    .split(/\s+/);
  const two = (parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '');
  return (two || name[0] || '').toUpperCase();
}

function toScheduleItem(s) {
  return {
    id: s.id,
    time: fmtClock(s.startTime),
    title: s.name,
    range: `${fmtClock(s.startTime)} - ${fmtClock(s.endTime)}`,
    teacher: s.teacherName ?? null,
    teacherInitial: teacherInitials(s.teacherName),
    state: sessionState(s.date, s.startTime, s.endTime),
    icon: scheduleIcon(s.name),
  };
}

function ScheduleEntry({ item, isLast }) {
  const { i18n } = useTranslation();
  const fontBold = i18n.language === 'ar' ? 'Amiri-Bold' : 'Lora-Bold';
  const fontMedium = i18n.language === 'ar' ? 'Amiri' : 'Lora-Medium';
  const fontSemiBold = i18n.language === 'ar' ? 'Amiri-Bold' : 'Lora-Bold';

  const isPast = item.state === 'past';
  const isActive = item.state === 'active';
  const cardBg = isPast ? '#EAEBE5' : C.brandLight;
  const titleColor = isPast ? C.muted : C.brandDark;
  const subtitleColor = isPast ? C.muted : C.muted;
  const Icon = item.icon;

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: isLast ? 0 : 24,
      }}
    >
      <View style={{ width: 48, paddingTop: 12 }}>
        <RNText style={{ fontFamily: fontSemiBold, fontSize: 10, color: C.ink }}>
          {item.time}
        </RNText>
      </View>
      <View style={{ width: 16, alignItems: 'center', paddingTop: 12, height: 32 }}>
        {isActive ? (
          <View
            style={{
              width: 16,
              height: 16,
              borderRadius: 8,
              borderWidth: 2,
              borderColor: C.brand,
              backgroundColor: C.page,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: C.brand }} />
          </View>
        ) : null}
      </View>
      <View
        style={{
          flex: 1,
          marginLeft: 8,
          backgroundColor: cardBg,
          borderLeftWidth: 2,
          borderLeftColor: '#888',
          borderRadius: 20,
          padding: 12,
          gap: 12,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            gap: 8,
            alignItems: 'flex-start',
            paddingBottom: item.teacher ? 12 : 0,
            borderBottomWidth: item.teacher ? 1 : 0,
            borderBottomColor: C.border,
          }}
        >
          <View style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={20} color={titleColor} strokeWidth={1.5} />
          </View>
          <View style={{ flex: 1, gap: 8 }}>
            <RNText style={{ fontFamily: fontBold, fontSize: 16, color: titleColor }}>
              {item.title}
            </RNText>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Clock size={14} color={subtitleColor} strokeWidth={1.5} />
              <RNText style={{ fontFamily: fontMedium, fontSize: 12, color: subtitleColor }}>
                {item.range}
              </RNText>
            </View>
          </View>
        </View>
        {item.teacher ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: C.brandLight,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <RNText style={{ fontFamily: fontSemiBold, fontSize: 10, color: C.ink }}>
                {item.teacherInitial}
              </RNText>
            </View>
            <RNText style={{ fontFamily: fontMedium, fontSize: 12, color: C.ink }}>
              {item.teacher}
            </RNText>
          </View>
        ) : null}
      </View>
    </View>
  );
}

function TodaySchedule({ items = [] }) {
  const { i18n } = useTranslation();
  const fontBold = i18n.language === 'ar' ? 'Amiri-Bold' : 'Lora-Bold';
  const fontRegular = i18n.language === 'ar' ? 'Amiri' : 'Lora';
  return (
    <View style={{ paddingHorizontal: SIDE_PAD, marginTop: 24 }}>
      <RNText style={{ fontFamily: fontBold, fontSize: 20, color: C.ink, marginBottom: 16 }}>
        Today’s Schedule
      </RNText>
      {items.length === 0 ? (
        <RNText style={{ fontFamily: fontRegular, fontSize: 13, color: C.muted }}>
          No schedule shared for today.
        </RNText>
      ) : (
        <View style={{ position: 'relative' }}>
          {/* Continuous timeline line — sits behind the dot at the active row.
              Positioned at the centre of the 16px timeline column (48 + 8). */}
          <View
            style={{
              position: 'absolute',
              left: 48 + 7.5,
              top: 12,
              bottom: 12,
              width: 1,
              backgroundColor: '#888',
            }}
          />
          {items.map((item, idx) => (
            <ScheduleEntry key={item.id} item={item} isLast={idx === items.length - 1} />
          ))}
        </View>
      )}
    </View>
  );
}

function SectionHeader({ title, link, onPressLink }) {
  const { i18n } = useTranslation();
  const fontBold = i18n.language === 'ar' ? 'Amiri-Bold' : 'Lora-Bold';
  const fontMedium = i18n.language === 'ar' ? 'Amiri' : 'Lora-Medium';
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
      }}
    >
      <RNText style={{ fontFamily: fontBold, fontSize: 20, color: C.ink }}>{title}</RNText>
      {link ? (
        <Pressable onPress={onPressLink}>
          <RNText
            style={{
              fontFamily: fontMedium,
              fontSize: 12,
              color: C.brandDark,
              textDecorationLine: 'underline',
            }}
          >
            {link}
          </RNText>
        </Pressable>
      ) : null}
    </View>
  );
}

function LogsPreviewRow({ icon, label, value }) {
  const { i18n } = useTranslation();
  const fontMedium = i18n.language === 'ar' ? 'Amiri' : 'Lora-Medium';
  const fontRegular = i18n.language === 'ar' ? 'Amiri' : 'Lora';
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 }}>
      <Image
        source={icon}
        style={{ width: 16, height: 16, tintColor: C.brand }}
        resizeMode="contain"
      />
      <RNText style={{ fontFamily: fontMedium, fontSize: 13, color: C.ink }}>{label}</RNText>
      <RNText
        style={{ fontFamily: fontRegular, fontSize: 13, color: C.muted, flex: 1 }}
        numberOfLines={1}
      >
        {value}
      </RNText>
    </View>
  );
}

function AnnouncementCard({ title, body, date }) {
  const { i18n } = useTranslation();
  const fontBold = i18n.language === 'ar' ? 'Amiri-Bold' : 'Lora-Bold';
  const fontMedium = i18n.language === 'ar' ? 'Amiri' : 'Lora-Medium';
  const fontRegular = i18n.language === 'ar' ? 'Amiri' : 'Lora';
  return (
    <View
      style={{
        flexDirection: 'row',
        gap: 12,
        backgroundColor: C.cardSec,
        borderRadius: 20,
        padding: 12,
        borderWidth: 1,
        borderColor: C.cream,
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 8,
          backgroundColor: C.cream,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Image source={ANN_ICON} style={{ width: 24, height: 24 }} resizeMode="contain" />
      </View>
      <View style={{ flex: 1, gap: 8 }}>
        <RNText style={{ fontFamily: fontBold, fontSize: 16, color: C.ink }}>{title}</RNText>
        <RNText style={{ fontFamily: fontRegular, fontSize: 12, color: C.muted, lineHeight: 18 }}>
          {body}
        </RNText>
        <RNText style={{ fontFamily: fontMedium, fontSize: 11, color: C.brandDark, marginTop: 2 }}>
          {date}
        </RNText>
      </View>
    </View>
  );
}

function EventCard({ category, title, body, location, date, imageSource }) {
  const { i18n } = useTranslation();
  const fontBold = i18n.language === 'ar' ? 'Amiri-Bold' : 'Lora-Bold';
  const fontMedium = i18n.language === 'ar' ? 'Amiri' : 'Lora-Medium';
  const fontRegular = i18n.language === 'ar' ? 'Amiri' : 'Lora';
  const badgeColor = category === 'Holiday' ? C.redSoft : 'rgba(118,148,92,0.9)';
  const badgeLabel = category || 'Event';
  return (
    <View
      style={{
        width: 251,
        backgroundColor: C.cardSec,
        borderRadius: 20,
        overflow: 'hidden',
      }}
    >
      <ImageBackground
        source={imageSource ?? undefined}
        style={{
          height: 111,
          width: '100%',
          justifyContent: 'flex-start',
        }}
        imageStyle={{ opacity: 0.75 }}
        resizeMode="cover"
      >
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.2)',
          }}
        />
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 8,
          }}
        >
          <View
            style={{
              backgroundColor: badgeColor,
              paddingHorizontal: 8,
              paddingVertical: 6,
              borderRadius: 12,
            }}
          >
            <RNText style={{ fontFamily: fontBold, fontSize: 10, color: C.fefe }}>
              {badgeLabel}
            </RNText>
          </View>
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: 'rgba(255,255,255,0.6)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <BookmarkIcon size={20} color={C.brandDark} />
          </View>
        </View>
      </ImageBackground>
      <View style={{ padding: 12, gap: 8 }}>
        <RNText style={{ fontFamily: fontBold, fontSize: 14, color: C.ink }} numberOfLines={1}>
          {title}
        </RNText>
        <RNText
          style={{ fontFamily: fontRegular, fontSize: 11, color: C.muted, lineHeight: 14 }}
          numberOfLines={2}
        >
          {body}
        </RNText>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 2 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <LocationIcon size={12} color={C.brandDark} />
            <RNText style={{ fontFamily: fontMedium, fontSize: 10, color: C.brandDark }}>
              {location}
            </RNText>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <CalendarIcon size={12} color={C.brandDark} />
            <RNText style={{ fontFamily: fontMedium, fontSize: 10, color: C.brandDark }}>
              {date}
            </RNText>
          </View>
        </View>
      </View>
    </View>
  );
}

export function HomeAfterCheckIn({ user, onSignOut }) {
  const { i18n } = useTranslation();
  const { session } = useAuth();
  const fontRegular = i18n.language === 'ar' ? 'Amiri' : 'Lora';
  const fontMedium = i18n.language === 'ar' ? 'Amiri' : 'Lora-Medium';
  const fontSemiBold = i18n.language === 'ar' ? 'Amiri-Bold' : 'Lora-Bold';
  const fontBold = i18n.language === 'ar' ? 'Amiri-Bold' : 'Lora-Bold';

  const { activeChild: child } = useActiveChild();
  const childId = child?.id;
  const childName = child?.fullName ?? '—';
  const roomName = child?.roomName ?? '';
  const today = new Date().toISOString().slice(0, 10);
  const { data: attendance } = useChildAttendance(childId, today);
  const { data: log } = useChildDailyLog(childId, today);
  const { data: media } = useChildMedia(childId, today);
  const { data: schedule } = useChildSchedule(childId, today);
  const { data: announcements } = useParentAnnouncements();
  const { data: events } = useParentEvents(true);

  const token = session?.accessToken;
  const imgSource = (fileUrl) => {
    const full = resolveFileUrl(fileUrl);
    if (!full) return null;
    return /\/api\/files\//.test(full) && token
      ? { uri: full, headers: { Authorization: `Bearer ${token}` } }
      : { uri: full };
  };

  const status = attendance?.status;
  const checkedOut = status === 'CHECKED_OUT';
  const { data: nursery } = useParentNursery();
  const checkOut = useParentCheckOut();
  const [devForceInside, setDevForceInside] = useState(false);
  const [checkOutError, setCheckOutError] = useState(null);

  // Only read GPS while a check-out is still possible (child PRESENT).
  const geo = useGeofence({
    lat: checkedOut ? undefined : nursery?.geofenceLat,
    lng: checkedOut ? undefined : nursery?.geofenceLng,
    radiusM: nursery?.geofenceRadiusM,
  });
  const insideGeofence = geo.status === 'inside' || devForceInside;
  const checkOutCoords =
    geo.coords ??
    (devForceInside && nursery?.geofenceLat != null
      ? { lat: nursery.geofenceLat, lng: nursery.geofenceLng, accuracyM: 5 }
      : null);
  const canCheckOut = insideGeofence && !!childId && !!checkOutCoords && !checkOut.isPending;

  async function onCheckOut() {
    if (!canCheckOut) return;
    setCheckOutError(null);
    try {
      await checkOut.mutateAsync({ childId, location: checkOutCoords });
    } catch (e) {
      setCheckOutError(e?.message ?? 'Check-out failed. Please try again.');
    }
  }

  const firstName = childName.trim().split(/\s+/)[0];
  const checkInTime = attendance?.lastCheckInAt ? fmtTime(attendance.lastCheckInAt) : null;
  const checkOutTime = attendance?.lastCheckOutAt ? fmtTime(attendance.lastCheckOutAt) : null;
  const moodValue = log?.mood ? (MOOD_LABELS[log.mood] ?? log.mood) : '—';
  const napHrs = napsHours(log?.naps);
  const napValue = napHrs != null ? `${napHrs}h nap.` : '—';
  const mealsValue = mealsLine(log?.meals);
  const mediaItems = (media ?? []).slice(0, 2);
  const scheduleItems = (schedule ?? []).map(toScheduleItem);
  const latestAnnouncements = (announcements ?? []).slice(0, 2);
  const upcomingEvents = (events ?? []).slice(0, 2);
  const mediaTileSize = (CARD_WIDTH - 12) / 2;

  return (
    <View style={{ flex: 1, backgroundColor: C.page }}>
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
          {/* Top row */}
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
              <ChildAvatar photoUrl={child?.photoUrl} size={48} />
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                <View style={{ gap: 4, flex: 1 }}>
                  <RNText style={{ fontFamily: fontSemiBold, fontSize: 14, color: C.ink }}>
                    {childName}
                  </RNText>
                  <RNText style={{ fontFamily: fontRegular, fontSize: 12, color: C.ink }}>
                    {roomName}
                  </RNText>
                </View>
                <ArrowDownIcon size={24} color={C.ink} />
              </View>
            </View>
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: C.page,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <NotificationBoldIcon size={24} color={C.brandDark} />
            </View>
          </View>

          {/* Calendar */}
          <View style={{ marginTop: 24 }}>
            <CalendarWeek
              selectedDay={21}
              onDayPress={(day) => {
                const t = new Date();
                const ymd = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                router.push(`/(app)/day-details/${ymd}`);
              }}
            />
          </View>

          {/* Today's Attendance — checked in */}
          <View
            style={{
              backgroundColor: C.cardSec,
              paddingHorizontal: SIDE_PAD,
              paddingVertical: 12,
              marginTop: 16,
            }}
          >
            <View style={{ gap: 16 }}>
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

              {/* Checked-in / checked-out indicator */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Image
                  source={CHECKEDIN_ICON}
                  style={{ width: 24, height: 24, tintColor: C.muted }}
                  resizeMode="contain"
                />
                <RNText style={{ fontFamily: fontMedium, fontSize: 14, color: C.muted, flex: 1 }}>
                  {checkedOut && checkOutTime
                    ? `${firstName} was checked out at ${checkOutTime}.`
                    : checkInTime
                      ? `${firstName} is safely checked in at ${checkInTime}.`
                      : `${firstName} is checked in.`}
                </RNText>
              </View>

              {/* Check Out — geofence-gated, only while the child is present */}
              {!checkedOut ? (
                <View style={{ gap: 8 }}>
                  <Pressable
                    disabled={!canCheckOut}
                    onPress={onCheckOut}
                    style={{
                      height: 48,
                      borderRadius: 20,
                      backgroundColor: C.brand,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      opacity: canCheckOut ? 1 : 0.4,
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                    }}
                  >
                    <LogoutIcon size={20} color={C.fefe} />
                    <RNText style={{ fontFamily: fontBold, fontSize: 16, color: C.fefe }}>
                      {checkOut.isPending ? 'Checking out…' : 'Check Out'}
                    </RNText>
                  </Pressable>
                  {checkOutError || (geo.status === 'outside' && !devForceInside) ? (
                    <RNText style={{ fontFamily: fontMedium, fontSize: 12, color: C.red }}>
                      {checkOutError ??
                        `You must be within ${nursery?.geofenceRadiusM ?? 100}m of the nursery to check out.`}
                    </RNText>
                  ) : null}
                  {__DEV__ ? (
                    <Pressable onPress={() => setDevForceInside((v) => !v)} hitSlop={6}>
                      <RNText
                        style={{
                          fontFamily: fontMedium,
                          fontSize: 11,
                          color: C.muted,
                          textAlign: 'center',
                        }}
                      >
                        Dev · Force geofence inside ({devForceInside ? 'on' : 'off'}) · GPS:{' '}
                        {geo.status}
                      </RNText>
                    </Pressable>
                  ) : null}
                </View>
              ) : null}
            </View>
          </View>

          {/* Today's Schedule — Figma `606:38073` */}
          <TodaySchedule items={scheduleItems} />

          {/* Today Logs Preview */}
          <View style={{ paddingHorizontal: SIDE_PAD, marginTop: 24 }}>
            <SectionHeader
              title="Today Logs Preview"
              link="See Details"
              onPressLink={() => router.push('/(app)/daily-log')}
            />
            <View
              style={{
                backgroundColor: C.cardSec,
                borderRadius: 20,
                paddingHorizontal: 12,
                paddingVertical: 16,
                gap: 8,
              }}
            >
              <LogsPreviewRow icon={MOOD_MASK} label="Mood:" value={moodValue} />
              <LogsPreviewRow icon={NAP_MASK} label="Nap:" value={napValue} />
              <LogsPreviewRow icon={MEALS_MASK} label="Meals:" value={mealsValue} />
              {/* Bookmark notch (top-right protrusion) */}
              <View
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: 36,
                  height: 32,
                  backgroundColor: C.cream,
                  borderTopRightRadius: 20,
                  borderBottomLeftRadius: 12,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <BookmarkIcon size={18} color={C.brandDark} />
              </View>
            </View>
          </View>

          {/* Today's Media */}
          <View style={{ paddingHorizontal: SIDE_PAD, marginTop: 24 }}>
            <SectionHeader
              title="Today's Media"
              link="See All"
              onPressLink={() => router.push('/(app)/profile/media')}
            />
            {mediaItems.length > 0 ? (
              <View style={{ flexDirection: 'row', gap: 12 }}>
                {mediaItems.map((m) => (
                  <AuthImage
                    key={m.id}
                    uri={m.fileUrl}
                    style={{ width: mediaTileSize, height: 130, borderRadius: 20 }}
                    resizeMode="cover"
                  />
                ))}
              </View>
            ) : (
              <RNText style={{ fontFamily: fontRegular, fontSize: 13, color: C.muted }}>
                No media shared yet today.
              </RNText>
            )}
          </View>

          {/* Latest Announcement */}
          <View style={{ paddingHorizontal: SIDE_PAD, marginTop: 24 }}>
            <SectionHeader
              title="Latest Announcement"
              link="See All"
              onPressLink={() => router.push('/(app)/news')}
            />
            {latestAnnouncements.length > 0 ? (
              <View style={{ gap: 12 }}>
                {latestAnnouncements.map((a) => (
                  <Pressable key={a.id} onPress={() => router.push(`/(app)/news/${a.id}`)}>
                    <AnnouncementCard title={a.title} body={a.preview} date={a.date} />
                  </Pressable>
                ))}
              </View>
            ) : (
              <RNText style={{ fontFamily: fontRegular, fontSize: 13, color: C.muted }}>
                No announcements yet.
              </RNText>
            )}
          </View>

          {/* Upcoming Events */}
          <View style={{ marginTop: 24 }}>
            <View style={{ paddingHorizontal: SIDE_PAD }}>
              <SectionHeader
                title="Upcoming Events"
                link="See All"
                onPressLink={() => router.push('/(app)/profile/events')}
              />
            </View>
            {upcomingEvents.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: SIDE_PAD, gap: 16 }}
              >
                {upcomingEvents.map((e) => (
                  <EventCard
                    key={e.id}
                    category={e.category}
                    title={e.title}
                    body={e.desc}
                    location={e.place}
                    date={e.date}
                    imageSource={imgSource(e.imageUrl)}
                  />
                ))}
              </ScrollView>
            ) : (
              <View style={{ paddingHorizontal: SIDE_PAD }}>
                <RNText style={{ fontFamily: fontRegular, fontSize: 13, color: C.muted }}>
                  No upcoming events.
                </RNText>
              </View>
            )}
          </View>

          {/* Dev sign out */}
          <View style={{ paddingHorizontal: SIDE_PAD, marginTop: 32, gap: 8 }}>
            <Pressable
              onPress={onSignOut}
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
        </ScrollView>
      </SafeAreaView>

      <BottomNav />
    </View>
  );
}

// This file is a colocated helper (rendered by ParentHome with props), but it
// lives under app/ so expo-router still registers it as a route and requires a
// default export. It's never navigated to directly; the stub keeps the router
// happy without creating a usable screen.
export default function HomeAfterCheckInRoute() {
  return null;
}
