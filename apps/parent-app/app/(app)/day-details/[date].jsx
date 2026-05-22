// Day Details — Figma frame `598:75779`. Reached from the home calendar
// strip; shows everything the parent has access to for one specific day:
//   - Attendance: check-in + check-out with the hand-heart icon
//   - Logs Preview: mood / nap / meals at-a-glance, bookmark notch
//   - Media: horizontal photo carousel
//
// `[date]` is a YYYY-MM-DD param (so /(app)/day-details/2026-05-21).
import React from 'react';
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
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeftIcon, BookmarkIcon } from '@nms/ui';
import { useAuth, useChildren, useDailyLog } from '@nms/data';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SIDE_PAD = 16;

const MOOD_ICON = require('../../../assets/home/photos/mood.png');
const MEALS_ICON = require('../../../assets/home/photos/meals.png');
const NAP_ICON = require('../../../assets/home/photos/nap.png');
const CHECKEDIN_ICON = require('../../../assets/home/photos/checkedin-icon.png');
const MEDIA1 = require('../../../assets/home/photos/media1.png');
const MEDIA2 = require('../../../assets/home/photos/media2.png');

const C = {
  page: '#DFEBD1',
  card: '#FFFFFF',
  cardSec: '#FCFCEC',
  cream: '#F5F5DC',
  brand: '#76945C',
  brandDark: '#334722',
  ink: '#333333',
  muted: '#535353',
  border: '#D8D8D8',
};

const MOOD_LABELS = {
  happy: 'Happy and active so far.',
  calm: 'Calm and content.',
  fussy: 'A little fussy today.',
  sad: 'Felt down today.',
  sleepy: 'Sleepy and quiet.',
  energetic: 'Full of energy.',
};

function fmtTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  let h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${String(h).padStart(2, '0')}:${m} ${ampm}`;
}

function napsTotalHours(naps) {
  if (!naps?.length) return null;
  let total = 0;
  for (const n of naps) {
    total += (new Date(n.endAt).getTime() - new Date(n.startAt).getTime()) / 3600000;
  }
  return Math.round(total * 10) / 10;
}

function mealsSummary(meals) {
  if (!meals?.length) return null;
  const had = meals.filter((m) => m.amount !== 'none');
  if (had.length === 0) return 'No meals logged today.';
  if (had.length === 1) return `Ate ${had[0].amount} of ${had[0].description}.`;
  return `Ate ${had[0].amount} of ${had.length} meals.`;
}

function LogRow({ icon, label, value, fontMedium, fontRegular }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <Image
        source={icon}
        style={{ width: 16, height: 16, tintColor: C.brand }}
        resizeMode="contain"
      />
      <RNText style={{ fontFamily: fontMedium, fontSize: 14, color: C.ink }}>
        {label}
      </RNText>
      <RNText
        style={{ fontFamily: fontRegular, fontSize: 14, color: C.muted, flex: 1 }}
        numberOfLines={1}
      >
        {value}
      </RNText>
    </View>
  );
}

export default function DayDetails() {
  const { i18n } = useTranslation();
  const { date } = useLocalSearchParams();
  const ymd = Array.isArray(date) ? date[0] : date;

  const fontBold = i18n.language === 'ar' ? 'Amiri-Bold' : 'Lora-Bold';
  const fontMedium = i18n.language === 'ar' ? 'Amiri' : 'Lora-Medium';
  const fontRegular = i18n.language === 'ar' ? 'Amiri' : 'Lora';

  const { user } = useAuth();
  const childrenQuery = useChildren();
  const myChild = (childrenQuery.data ?? []).find((c) => c.guardianIds?.includes(user?.id));
  const childName = myChild?.name ?? 'Your child';
  const firstName = childName.trim().split(/\s+/)[0];

  const logQuery = useDailyLog(myChild?.id, ymd);
  const log = logQuery.data;

  // No attendance hook yet; fall back to placeholder times that mirror the
  // Figma demo so the section reads correctly until wiring lands.
  const checkInTime = '08:12 AM';
  const checkOutTime = log?.publishedAt ? '02:45 PM' : null;

  return (
    <View style={{ flex: 1, backgroundColor: C.page }}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              paddingHorizontal: SIDE_PAD,
              paddingTop: 8,
              paddingBottom: 16,
            }}
          >
            <Pressable
              onPress={() => router.back()}
              hitSlop={10}
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: C.border,
                backgroundColor: C.card,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ArrowLeftIcon size={22} color={C.ink} />
            </Pressable>
            <RNText style={{ fontFamily: fontBold, fontSize: 20, color: C.ink }}>
              Day Details
            </RNText>
          </View>

          <View
            style={{
              backgroundColor: C.card,
              marginHorizontal: 0,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingHorizontal: SIDE_PAD,
              paddingTop: 16,
              gap: 24,
            }}
          >
            {/* Attendance */}
            <View>
              <RNText
                style={{ fontFamily: fontBold, fontSize: 20, color: C.ink, marginBottom: 12 }}
              >
                Attendance
              </RNText>
              <View
                style={{
                  backgroundColor: C.cardSec,
                  borderRadius: 20,
                  padding: 12,
                  gap: 12,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Image
                    source={CHECKEDIN_ICON}
                    style={{ width: 24, height: 24, tintColor: C.muted }}
                    resizeMode="contain"
                  />
                  <RNText
                    style={{ fontFamily: fontMedium, fontSize: 14, color: C.muted, flex: 1 }}
                  >
                    {firstName} was safely checked in at {checkInTime}.
                  </RNText>
                </View>
                {checkOutTime ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Image
                      source={CHECKEDIN_ICON}
                      style={{ width: 24, height: 24, tintColor: C.muted }}
                      resizeMode="contain"
                    />
                    <RNText
                      style={{ fontFamily: fontMedium, fontSize: 14, color: C.muted, flex: 1 }}
                    >
                      {firstName} was safely checked out at {checkOutTime}.
                    </RNText>
                  </View>
                ) : null}
              </View>
            </View>

            {/* Logs Preview */}
            <View>
              <RNText
                style={{ fontFamily: fontBold, fontSize: 20, color: C.ink, marginBottom: 12 }}
              >
                Logs Preview
              </RNText>
              <View
                style={{
                  backgroundColor: C.cardSec,
                  borderRadius: 20,
                  paddingHorizontal: 12,
                  paddingVertical: 16,
                  gap: 8,
                  position: 'relative',
                }}
              >
                {log ? (
                  <>
                    <LogRow
                      icon={MOOD_ICON}
                      label="Mood:"
                      value={log.mood ? MOOD_LABELS[log.mood] ?? log.mood : '—'}
                      fontMedium={fontMedium}
                      fontRegular={fontRegular}
                    />
                    <LogRow
                      icon={NAP_ICON}
                      label="Nap:"
                      value={
                        napsTotalHours(log.naps) != null
                          ? `${napsTotalHours(log.naps)}h nap.`
                          : '—'
                      }
                      fontMedium={fontMedium}
                      fontRegular={fontRegular}
                    />
                    <LogRow
                      icon={MEALS_ICON}
                      label="Meals:"
                      value={mealsSummary(log.meals) ?? '—'}
                      fontMedium={fontMedium}
                      fontRegular={fontRegular}
                    />
                    {/* Bookmark notch — pulled from the home variant */}
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
                  </>
                ) : (
                  <RNText
                    style={{ fontFamily: fontRegular, fontSize: 14, color: C.muted }}
                  >
                    No log published for this day yet.
                  </RNText>
                )}
              </View>
            </View>

            {/* Media */}
            <View>
              <RNText
                style={{ fontFamily: fontBold, fontSize: 20, color: C.ink, marginBottom: 12 }}
              >
                Media
              </RNText>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 12, paddingRight: SIDE_PAD }}
              >
                <Image
                  source={MEDIA1}
                  style={{ width: 159, height: 159, borderRadius: 20 }}
                  resizeMode="cover"
                />
                <Image
                  source={MEDIA2}
                  style={{ width: 159, height: 159, borderRadius: 20 }}
                  resizeMode="cover"
                />
              </ScrollView>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
