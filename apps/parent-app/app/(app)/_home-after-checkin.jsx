// Populated home — Figma frame `279:21432` "Home-after check in".
// Shown to parent2@nms.local. All photos, icons, and event covers are
// pulled directly from Figma assets at apps/parent-app/assets/home/photos/.
import React from 'react';
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
import {
  Clock,
  Music,
  Palette,
  BookOpen,
  Pause,
} from 'lucide-react-native';
import { BottomNav } from '../../components/BottomNav';
import { CalendarWeek } from '../../components/CalendarWeek';

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

const MEDIA1 = require('../../assets/home/photos/media1.png');
const MEDIA2 = require('../../assets/home/photos/media2.png');
const EVENT1 = require('../../assets/home/photos/event1.png');
const EVENT2 = require('../../assets/home/photos/event2.png');
const AVATAR = require('../../assets/home/photos/avatar.png');
const ANN_ICON = require('../../assets/home/photos/announcement-icon.png');
const MOOD_MASK = require('../../assets/home/photos/mood.png');
const NAP_MASK = require('../../assets/home/photos/nap.png');
const MEALS_MASK = require('../../assets/home/photos/meals.png');
const CHECKEDIN_ICON = require('../../assets/home/photos/checkedin-icon.png');

// Static schedule for the after-checkin demo. Sourced from Figma frame
// `606:38073` "Today's Schedule" — a vertical timeline with one entry per
// session. Real data wires in once /(app)/daily-log lands; for now the
// shape mirrors what `useSchedule(childId, date)` will return.
const SCHEDULE_ITEMS = [
  {
    id: 'music',
    time: '09:00 AM',
    title: 'Music Session',
    range: '09:00 AM - 10:00 AM',
    teacher: 'Ms. Maren Philips',
    teacherInitial: 'An',
    state: 'past',
    icon: Music,
  },
  {
    id: 'art',
    time: '10:00 AM',
    title: 'Art Session',
    range: '10:00 AM - 11:00 AM',
    teacher: 'Ms. Maren Philips',
    teacherInitial: 'An',
    state: 'active',
    icon: Palette,
  },
  {
    id: 'story',
    time: '11:00 PM',
    title: 'Story Time',
    range: '11:00 AM - 11:30 AM',
    teacher: 'Ms. Maren Philips',
    teacherInitial: 'An',
    state: 'upcoming',
    icon: BookOpen,
  },
  {
    id: 'break',
    time: '11:30 AM',
    title: 'Break',
    range: '11:30 AM - 12:00 PM',
    teacher: null,
    teacherInitial: null,
    state: 'upcoming',
    icon: Pause,
  },
];

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
      <View
        style={{ width: 16, alignItems: 'center', paddingTop: 12, height: 32 }}
      >
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
            <View
              style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: C.brand }}
            />
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
              <RNText
                style={{ fontFamily: fontMedium, fontSize: 12, color: subtitleColor }}
              >
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

function TodaySchedule() {
  const { i18n } = useTranslation();
  const fontBold = i18n.language === 'ar' ? 'Amiri-Bold' : 'Lora-Bold';
  return (
    <View style={{ paddingHorizontal: SIDE_PAD, marginTop: 24 }}>
      <RNText
        style={{ fontFamily: fontBold, fontSize: 20, color: C.ink, marginBottom: 16 }}
      >
        Today’s Schedule
      </RNText>
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
        {SCHEDULE_ITEMS.map((item, idx) => (
          <ScheduleEntry
            key={item.id}
            item={item}
            isLast={idx === SCHEDULE_ITEMS.length - 1}
          />
        ))}
      </View>
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
      <RNText style={{ fontFamily: fontMedium, fontSize: 13, color: C.ink }}>
        {label}
      </RNText>
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

function EventCard({ kind, title, body, location, date, image }) {
  const { i18n } = useTranslation();
  const fontBold = i18n.language === 'ar' ? 'Amiri-Bold' : 'Lora-Bold';
  const fontMedium = i18n.language === 'ar' ? 'Amiri' : 'Lora-Medium';
  const fontRegular = i18n.language === 'ar' ? 'Amiri' : 'Lora';
  const badgeColor = kind === 'holiday' ? C.redSoft : 'rgba(118,148,92,0.9)';
  const badgeLabel = kind === 'holiday' ? 'Holiday' : 'Progress';
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
        source={image}
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
  const fontRegular = i18n.language === 'ar' ? 'Amiri' : 'Lora';
  const fontMedium = i18n.language === 'ar' ? 'Amiri' : 'Lora-Medium';
  const fontSemiBold = i18n.language === 'ar' ? 'Amiri-Bold' : 'Lora-Bold';
  const fontBold = i18n.language === 'ar' ? 'Amiri-Bold' : 'Lora-Bold';

  const childName = 'Kaylynn  Arcand';
  const roomName = 'Sunflower';
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
              <Image
                source={AVATAR}
                style={{ width: 48, height: 48, borderRadius: 24 }}
              />
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

              {/* Checked-in indicator */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Image
                  source={CHECKEDIN_ICON}
                  style={{ width: 24, height: 24, tintColor: C.muted }}
                  resizeMode="contain"
                />
                <RNText style={{ fontFamily: fontMedium, fontSize: 14, color: C.muted, flex: 1 }}>
                  {childName.trim().split(/\s+/)[0]} is safely checked in at 08:12 AM.
                </RNText>
              </View>

              {/* Check Out button — Figma uses opacity 0.40 on the olive bg */}
              <Pressable
                style={{
                  height: 48,
                  borderRadius: 20,
                  backgroundColor: C.brand,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  opacity: 0.4,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                }}
              >
                <LogoutIcon size={20} color={C.fefe} />
                <RNText style={{ fontFamily: fontBold, fontSize: 16, color: C.fefe }}>
                  Check Out
                </RNText>
              </Pressable>
            </View>
          </View>

          {/* Today's Schedule — Figma `606:38073` */}
          <TodaySchedule />

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
              <LogsPreviewRow icon={MOOD_MASK} label="Mood:" value="Happy and active so far." />
              <LogsPreviewRow icon={NAP_MASK} label="Nap:" value="1.5h nap." />
              <LogsPreviewRow
                icon={MEALS_MASK}
                label="Meals:"
                value="Ate most of breakfast and lunch."
              />
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
            <SectionHeader title="Today's Media" link="See All" />
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Image
                source={MEDIA1}
                style={{
                  width: mediaTileSize,
                  height: 130,
                  borderRadius: 20,
                }}
                resizeMode="cover"
              />
              <Image
                source={MEDIA2}
                style={{
                  width: mediaTileSize,
                  height: 130,
                  borderRadius: 20,
                }}
                resizeMode="cover"
              />
            </View>
          </View>

          {/* Latest Announcement */}
          <View style={{ paddingHorizontal: SIDE_PAD, marginTop: 24 }}>
            <SectionHeader title="Latest Announcement" link="See All" />
            <View style={{ gap: 12 }}>
              <AnnouncementCard
                title="New Update from the Classroom"
                body="Your child's class had a special activity today. Check out what the kids enjoyed and learned together!"
                date="Mar 30 · 10:30 PM"
              />
              <AnnouncementCard
                title="New Update from the Classroom"
                body="Your child's class had a special activity today. Check out what the kids enjoyed and learned together!"
                date="Mar 30 · 10:30 PM"
              />
            </View>
          </View>

          {/* Upcoming Events */}
          <View style={{ marginTop: 24 }}>
            <View style={{ paddingHorizontal: SIDE_PAD }}>
              <SectionHeader title="Upcoming Events" link="See All" />
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: SIDE_PAD, gap: 16 }}
            >
              <EventCard
                kind="holiday"
                title="Art Day at the Nursery."
                body="Children will enjoy painting and creative activities together."
                location="At Nursery"
                date="Mar 30 · 10:30 PM"
                image={EVENT1}
              />
              <EventCard
                kind="meeting"
                title="Progress"
                body="Let's discuss your child's progress and growth so far."
                location="At Nursery"
                date="Apr 5 · 09:00 AM"
                image={EVENT2}
              />
            </ScrollView>
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
