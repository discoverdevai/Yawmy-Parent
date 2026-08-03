// Daily Logs — Figma section `598:75993` with three states:
//   - empty    (`598:75994`)  → no published log yet for the selected day
//   - populated (`598:76336`) → cards for Mood / Meals / Nap / Diapers / Activities / Medication
//   - absent   (`598:76165`)  → child stayed home (no log + no attendance)
//
// We pick the first child in the parent's `useChildren()` result and
// load `useDailyLog(child.id, today)`. Date navigation is wired to the
// shared `CalendarWeek` strip; in-week selection re-fetches the log.
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
import { useTranslation } from 'react-i18next';
import {
  ArrowDownIcon,
  NotificationIcon,
  NotificationBoldIcon,
} from '@nms/ui';
import {
  ChevronLeft,
  ChevronRight,
  Baby,
  Sparkles,
  Pill,
} from 'lucide-react-native';

const MOOD_ICON = require('../../assets/home/photos/mood.png');
const MEALS_ICON = require('../../assets/home/photos/meals.png');
const NAP_ICON = require('../../assets/home/photos/nap.png');
import { useChildDailyLog } from '@nms/data';
import { useActiveChild } from '../../lib/active-child';
import { BottomNav } from '../../components/BottomNav';
import { CalendarWeek } from '../../components/CalendarWeek';
import { ChildAvatar } from '../../components/ChildAvatar';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SIDE_PAD = 16;

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
};

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

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
  happy: 'Happy and playful today',
  calm: 'Calm and content',
  fussy: 'A little fussy',
  sad: 'Felt down today',
  sleepy: 'Sleepy and quiet',
  energetic: 'Full of energy',
};

function buildSections(log) {
  if (!log) return [];
  const sections = [];

  if (log.mood) {
    sections.push({
      key: 'mood',
      iconSource: MOOD_ICON,
      title: 'Mood',
      rows: [{ id: 'mood', text: MOOD_LABELS[log.mood] ?? log.mood, time: null }],
    });
  }

  if (log.meals?.length) {
    sections.push({
      key: 'meals',
      iconSource: MEALS_ICON,
      title: 'Meals',
      rows: log.meals.map((m) => ({
        id: m.id,
        text: m.description,
        time: fmtTime(m.time),
      })),
    });
  }

  if (log.naps?.length) {
    sections.push({
      key: 'nap',
      iconSource: NAP_ICON,
      title: 'Nap',
      rows: log.naps.map((n) => ({
        id: n.id,
        text: n.quality === 'restful' ? 'Slept Well' : n.quality === 'short' ? 'Short Nap' : 'Light Sleep',
        time: `${fmtTime(n.startAt)} to ${fmtTime(n.endAt)}`,
      })),
    });
  }

  if (log.diapers?.length) {
    sections.push({
      key: 'diapers',
      Icon: Baby,
      title: 'Diapers',
      rows: [{
        id: 'diaper-summary',
        text: `Diaper changed ${log.diapers.length} times`,
        time: null,
      }],
    });
  }

  if (log.activities?.length) {
    sections.push({
      key: 'activities',
      Icon: Sparkles,
      title: 'Activities',
      rows: log.activities.map((a) => ({ id: a.id, text: a.description, time: null })),
    });
  }

  if (log.medication?.length) {
    sections.push({
      key: 'medication',
      Icon: Pill,
      title: 'Medication',
      rows: log.medication.map((med) => ({
        id: med.id,
        text: med.drug,
        time: fmtTime(med.time),
      })),
    });
  }

  return sections;
}

// Figma `Component 1` etc. — cream `#FCFCEC` card with a 2px white left
// border, 8px padding, 24×24 black masked icon left, then a column of
// title (16 bold) + rows (12 medium black on the left, 8 medium grey time
// on the right). Mood / Meals / Nap reuse the masked PNG assets shipped
// with the home; Diapers / Activities / Medication fall back to lucide.
function LogCard({ Icon, iconSource, title, rows, fontBold, fontMedium }) {
  return (
    <View
      style={{
        backgroundColor: C.cardSec,
        borderRadius: 20,
        borderLeftWidth: 2,
        borderLeftColor: '#FFFFFF',
        padding: 8,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
        <View
          style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}
        >
          {iconSource ? (
            <Image
              source={iconSource}
              style={{ width: 24, height: 24, tintColor: C.ink }}
              resizeMode="contain"
            />
          ) : Icon ? (
            <Icon size={20} color={C.ink} strokeWidth={1.5} />
          ) : null}
        </View>
        <View style={{ flex: 1, gap: 8 }}>
          <RNText style={{ fontFamily: fontBold, fontSize: 16, color: C.ink }}>
            {title}
          </RNText>
          <View style={{ gap: 12 }}>
            {rows.map((r) => (
              <View
                key={r.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <RNText
                  style={{ fontFamily: fontMedium, fontSize: 12, color: C.ink, flex: 1 }}
                  numberOfLines={1}
                >
                  {r.text}
                </RNText>
                {r.time ? (
                  <RNText style={{ fontFamily: fontMedium, fontSize: 8, color: C.muted }}>
                    {r.time}
                  </RNText>
                ) : null}
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

function MonthNav({ date, fontMedium }) {
  const monthLabel = `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        paddingVertical: 8,
      }}
    >
      <Pressable
        hitSlop={10}
        style={{
          width: 40,
          height: 40,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ChevronLeft size={20} color={C.ink} />
      </Pressable>
      <RNText style={{ fontFamily: fontMedium, fontSize: 14, color: C.ink }}>
        {monthLabel}
      </RNText>
      <Pressable
        hitSlop={10}
        style={{
          width: 40,
          height: 40,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ChevronRight size={20} color={C.ink} />
      </Pressable>
    </View>
  );
}

export default function DailyLogScreen() {
  const { i18n } = useTranslation();

  const fontRegular = i18n.language === 'ar' ? 'Amiri' : 'Lora';
  const fontMedium = i18n.language === 'ar' ? 'Amiri' : 'Lora-Medium';
  const fontSemiBold = i18n.language === 'ar' ? 'Amiri-Bold' : 'Lora-Bold';
  const fontBold = i18n.language === 'ar' ? 'Amiri-Bold' : 'Lora-Bold';

  const { activeChild: myChild } = useActiveChild();

  const [date] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState(() => new Date().getDate());
  const ymd = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;

  const logQuery = useChildDailyLog(myChild?.id, ymd);
  const sections = buildSections(logQuery.data);

  const childName = myChild?.fullName ?? 'Your child';
  const roomName = myChild?.roomName ?? '';
  const hasNotifications = false;

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
          {/* Header — same shape as home */}
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
              <ChildAvatar photoUrl={myChild?.photoUrl} size={48} />
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
                  {roomName ? (
                    <RNText
                      style={{ fontFamily: fontRegular, fontSize: 12, color: C.ink }}
                    >
                      {roomName}
                    </RNText>
                  ) : null}
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
              {hasNotifications ? (
                <NotificationBoldIcon size={24} color={C.brandDark} />
              ) : (
                <NotificationIcon size={24} color={C.ink} />
              )}
            </View>
          </View>

          {/* Month nav + week strip */}
          <View style={{ marginTop: 16 }}>
            <MonthNav date={date} fontMedium={fontMedium} />
            <View style={{ marginTop: 4 }}>
              <CalendarWeek selectedDay={selectedDay} onDayPress={setSelectedDay} />
            </View>
          </View>

          {/* Body */}
          {logQuery.isLoading ? (
            <View
              style={{
                paddingTop: 80,
                alignItems: 'center',
              }}
            >
              <RNText style={{ fontFamily: fontRegular, fontSize: 14, color: C.muted }}>
                Loading…
              </RNText>
            </View>
          ) : sections.length === 0 ? (
            <EmptyState fontBold={fontBold} fontRegular={fontRegular} />
          ) : (
            <View style={{ paddingHorizontal: SIDE_PAD, marginTop: 24, gap: 16 }}>
              {sections.map((s) => (
                <LogCard
                  key={s.key}
                  Icon={s.Icon}
                  iconSource={s.iconSource}
                  title={s.title}
                  rows={s.rows}
                  fontBold={fontBold}
                  fontMedium={fontMedium}
                />
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>

      <BottomNav active="log" />
    </View>
  );
}

function EmptyState({ fontBold, fontRegular }) {
  return (
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
            fontFamily: fontBold,
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
  );
}
