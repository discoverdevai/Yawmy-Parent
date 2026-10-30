// Attendance History — Figma frame `598:75666`. Pixel-aligned with the
// design: olive page bg, cream-rounded white panel pinned to the bottom,
// three "stat pills" with floating white-badge mask icons, then a
// gray-base calendar grid where Present (green) / Absent (red) cells
// override the base bg. Future days stay gray with no icon; weekends keep
// the gray bg and get a small filled-dot indicator.
//
// TODO: replace `buildMonth` with a real `useAttendanceMonth(childId, …)`
// hook once the attendance mock client gains month-summary support.
import React, { useState, useMemo } from 'react';
import { Pressable, ScrollView, Text as RNText, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  CalendarRange,
  CalendarCheck,
  CalendarX,
} from 'lucide-react-native';
import { ArrowLeftIcon } from '@nms/ui';
import { useChildAttendanceHistory } from '@nms/data';
import { useActiveChild } from '../../../lib/active-child';

const C = {
  page: '#DFEBD1', // primary/bgcolor
  panel: '#FFFFF5', // bg/whitecolor
  cream: '#F5F5DC', // sec/strokecolor
  ink: '#333333',
  muted: '#535353',
  border: '#D8D8D8',
  cellGray: '#F2F2F2', // bg/graycolor — every cell starts here
  presentBg: '#F0FDE9', // bg/lightgreencolor
  presentText: '#334722', // primary/textcolor
  absentBg: '#FFF6F6', // bg/lightredcolor
  absentText: '#C90101', // text/redcolor
  blueBg: '#F2F8FF', // bg/lightbluecolor
  blueText: '#0C4085', // text/bluecolor
  white: '#FEFEFE',
};

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const DOW = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function toYmd(d) {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

// `statusByDate` maps YYYY-MM-DD -> backend AttendanceStatus for days with a
// record. A past weekday with a PRESENT/CHECKED_OUT record is "present";
// otherwise "absent". Weekends and future days are non-school cells.
function buildMonth(year, monthIndex, statusByDate) {
  const first = new Date(year, monthIndex, 1);
  const startDow = first.getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const cells = [];
  for (let i = 0; i < 42; i++) {
    const dayNum = i - startDow + 1;
    const inMonth = dayNum >= 1 && dayNum <= daysInMonth;
    if (!inMonth) {
      // Show out-of-month days with their actual number (greyed) — Figma
      // shows e.g. "29" for the trailing day of the previous month.
      const fillDate = new Date(year, monthIndex, dayNum);
      const fillDow = ((fillDate.getDay() % 7) + 7) % 7;
      const isWeekend = fillDow === 0 || fillDow === 6;
      cells.push({
        key: `e${i}`,
        status: isWeekend ? 'weekend' : 'fill',
        inMonth: false,
        day: fillDate.getDate(),
      });
      continue;
    }
    const d = new Date(year, monthIndex, dayNum);
    const dow = d.getDay();
    const future = d > today;
    let status;
    if (dow === 0 || dow === 6) status = 'weekend';
    else if (future) status = 'future';
    else {
      const st = statusByDate.get(toYmd(d));
      status = st === 'PRESENT' || st === 'CHECKED_OUT' ? 'present' : 'absent';
    }
    cells.push({ key: `d${dayNum}`, status, inMonth: true, day: dayNum });
  }
  return cells;
}

function summarise(cells) {
  let present = 0;
  let absent = 0;
  let totalSchoolDays = 0;
  for (const c of cells) {
    if (!c.inMonth) continue;
    if (c.status === 'present') {
      present += 1;
      totalSchoolDays += 1;
    } else if (c.status === 'absent') {
      absent += 1;
      totalSchoolDays += 1;
    }
  }
  const percentage = totalSchoolDays === 0 ? 0 : Math.round((present / totalSchoolDays) * 100);
  return { present, absent, percentage };
}

// One stat — colored pill with a floating white badge holding the icon.
// Per Figma 598:75677 / 598:75681 — pill has 12px top margin to leave
// room for the badge that overlaps the top-right corner.
function StatPill({ value, label, BgIcon, bgColor, textColor, fontSemiBold }) {
  return (
    <View style={{ flex: 1, position: 'relative', paddingTop: 12 }}>
      <View
        style={{
          backgroundColor: bgColor,
          borderRadius: 12,
          paddingHorizontal: 12,
          paddingVertical: 8,
          alignItems: 'center',
          gap: 8,
        }}
      >
        <RNText style={{ fontFamily: fontSemiBold, fontSize: 14, color: textColor }}>
          {value}
        </RNText>
        <RNText
          style={{ fontFamily: fontSemiBold, fontSize: 10, color: textColor, textAlign: 'center' }}
        >
          {label}
        </RNText>
      </View>
      {/* Floating white icon badge — top-right corner, 32×32 with shadow */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: C.white,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#2D2D2D',
          shadowOpacity: 0.08,
          shadowRadius: 4,
          shadowOffset: { width: 0, height: 0 },
          elevation: 2,
        }}
      >
        <BgIcon size={16} color={textColor} strokeWidth={1.5} />
      </View>
    </View>
  );
}

// Single calendar cell. Layout: number on top, status icon at the bottom.
// 49px tall × full column width, rounded-12, base gray bg overridden when
// the day is present (green) or absent (red).
function DayCell({ cell, fontMedium }) {
  const baseStyle = {
    height: 49,
    borderRadius: 12,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: C.cellGray,
  };
  let cellBg = C.cellGray;
  let textColor = C.muted;
  if (cell.status === 'present') {
    cellBg = C.presentBg;
    textColor = C.presentText;
  } else if (cell.status === 'absent') {
    cellBg = C.absentBg;
    textColor = C.absentText;
  } else if (!cell.inMonth) {
    textColor = C.muted;
  }

  return (
    <View style={[baseStyle, { backgroundColor: cellBg }]}>
      <RNText style={{ fontFamily: fontMedium, fontSize: 14, color: textColor }}>{cell.day}</RNText>
      {cell.status === 'present' ? (
        <CheckCircle size={16} color={textColor} strokeWidth={1.5} />
      ) : cell.status === 'absent' ? (
        <XCircle size={16} color={textColor} strokeWidth={1.5} />
      ) : cell.status === 'weekend' ? (
        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: C.muted }} />
      ) : (
        <View style={{ height: 16 }} />
      )}
    </View>
  );
}

// One vertical column of the calendar — day-letter at top, then 6 stacked
// cells. Per Figma, columns have a 12px gap between cells.
function DayColumn({ letter, cells, fontMedium }) {
  return (
    <View style={{ width: 40, gap: 12 }}>
      <RNText
        style={{
          fontFamily: fontMedium,
          fontSize: 14,
          color: C.muted,
          textAlign: 'center',
        }}
      >
        {letter}
      </RNText>
      {cells.map((c) => (
        <DayCell key={c.key} cell={c} fontMedium={fontMedium} />
      ))}
    </View>
  );
}

export default function AttendanceHistory() {
  const { i18n } = useTranslation();
  const fontBold = i18n.language === 'ar' ? 'Amiri-Bold' : 'Lora-Bold';
  const fontMedium = i18n.language === 'ar' ? 'Amiri' : 'Lora-Medium';
  const fontSemiBold = i18n.language === 'ar' ? 'Amiri-Bold' : 'Lora-Bold';

  const [cursor, setCursor] = useState(() => {
    const t = new Date();
    return { year: t.getFullYear(), monthIndex: t.getMonth() };
  });

  const { activeChildId: childId } = useActiveChild();
  const monthFrom = toYmd(new Date(cursor.year, cursor.monthIndex, 1));
  const monthTo = toYmd(new Date(cursor.year, cursor.monthIndex + 1, 0));
  const { data: history } = useChildAttendanceHistory(childId, monthFrom, monthTo);

  const statusByDate = useMemo(() => {
    const m = new Map();
    (history ?? []).forEach((h) => m.set(h.date, h.status));
    return m;
  }, [history]);

  const cells = buildMonth(cursor.year, cursor.monthIndex, statusByDate);
  const { present, absent, percentage } = summarise(cells);

  const monthLabel = `${MONTH_NAMES[cursor.monthIndex]} ${cursor.year}`;

  // Group cells by column (col 0=Sun … col 6=Sat). 6 rows max → 6 cells/col.
  const columns = [0, 1, 2, 3, 4, 5, 6].map((col) =>
    [0, 1, 2, 3, 4, 5].map((row) => cells[row * 7 + col]),
  );

  const goPrev = () =>
    setCursor((c) =>
      c.monthIndex === 0
        ? { year: c.year - 1, monthIndex: 11 }
        : { year: c.year, monthIndex: c.monthIndex - 1 },
    );
  const goNext = () =>
    setCursor((c) =>
      c.monthIndex === 11
        ? { year: c.year + 1, monthIndex: 0 }
        : { year: c.year, monthIndex: c.monthIndex + 1 },
    );

  return (
    <View style={{ flex: 1, backgroundColor: C.page }}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        {/* Top header — sits on the green page bg */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 16,
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 16,
          }}
        >
          <Pressable
            onPress={() => router.back()}
            hitSlop={10}
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: C.cream,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'transparent',
            }}
          >
            <ArrowLeftIcon size={22} color={C.ink} />
          </Pressable>
          <RNText style={{ fontFamily: fontBold, fontSize: 20, color: C.ink }}>
            Attendance History
          </RNText>
        </View>

        {/* Bottom rounded white panel — fills remaining space */}
        <View
          style={{
            flex: 1,
            backgroundColor: C.panel,
            borderTopLeftRadius: 40,
            borderTopRightRadius: 40,
            paddingHorizontal: 16,
            paddingTop: 24,
          }}
        >
          <ScrollView
            contentContainerStyle={{ paddingBottom: 32, gap: 32 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Stats row */}
            <View style={{ flexDirection: 'row', gap: 16, alignItems: 'flex-start' }}>
              <StatPill
                value={`${percentage}%`}
                label="Overall Attendance"
                BgIcon={CalendarRange}
                bgColor={C.presentBg}
                textColor={C.presentText}
                fontSemiBold={fontSemiBold}
              />
              <StatPill
                value={String(present)}
                label="Present Days"
                BgIcon={CalendarCheck}
                bgColor={C.blueBg}
                textColor={C.blueText}
                fontSemiBold={fontSemiBold}
              />
              <StatPill
                value={String(absent)}
                label="Absent Days"
                BgIcon={CalendarX}
                bgColor={C.absentBg}
                textColor={C.absentText}
                fontSemiBold={fontSemiBold}
              />
            </View>

            {/* Calendar card */}
            <View
              style={{
                borderWidth: 1,
                borderColor: C.border,
                borderRadius: 20,
                paddingHorizontal: 8,
                paddingVertical: 16,
                gap: 16,
                alignItems: 'center',
              }}
            >
              {/* Month nav */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <Pressable
                  onPress={goPrev}
                  hitSlop={10}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 50,
                    borderWidth: 1,
                    borderColor: C.border,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ChevronLeft size={20} color={C.ink} strokeWidth={1.5} />
                </Pressable>
                <RNText style={{ fontFamily: fontMedium, fontSize: 14, color: C.ink }}>
                  {monthLabel}
                </RNText>
                <Pressable
                  onPress={goNext}
                  hitSlop={10}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 50,
                    borderWidth: 1,
                    borderColor: C.border,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ChevronRight size={20} color={C.ink} strokeWidth={1.5} />
                </Pressable>
              </View>

              {/* Calendar columns */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  width: '100%',
                }}
              >
                {columns.map((colCells, idx) => (
                  <DayColumn key={idx} letter={DOW[idx]} cells={colCells} fontMedium={fontMedium} />
                ))}
              </View>
            </View>

            {/* Legend */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 24,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <CheckCircle size={16} color={C.presentText} strokeWidth={1.5} />
                <RNText style={{ fontFamily: fontMedium, fontSize: 12, color: C.presentText }}>
                  Present
                </RNText>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <XCircle size={16} color={C.absentText} strokeWidth={1.5} />
                <RNText style={{ fontFamily: fontMedium, fontSize: 12, color: C.absentText }}>
                  Absent
                </RNText>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <View
                  style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: C.muted }}
                />
                <RNText style={{ fontFamily: fontMedium, fontSize: 12, color: C.muted }}>
                  Weekend
                </RNText>
              </View>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  );
}
