// Week-strip calendar at the top of the parent home. Pixel-aligned with
// the Figma `calender` instance — selected day is highlighted with the
// olive ring, the rest stay muted.
import React from 'react';
import { Pressable, Text as RNText, View } from 'react-native';
import { useTranslation } from 'react-i18next';

const C = {
  brand: '#76945C',
  brandDark: '#334722',
  brandLight: '#F8FAEE',
  muted: '#535353',
};

// The current week, Monday to Sunday, around `today`. Used to be a hardcoded
// 18–24 with the 21st selected, so the strip showed the wrong dates and day.
function currentWeek(today, locale) {
  const monday = new Date(today);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    let label;
    try {
      label = d.toLocaleDateString(locale, { weekday: 'short' });
    } catch {
      label = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'][d.getDay()];
    }
    return { label, date: d.getDate() };
  });
}

export function CalendarWeek({ selectedDay, hasUpdate = false, days, onDayPress }) {
  const { i18n } = useTranslation();
  const today = new Date();
  const weekDays = days ?? currentWeek(today, i18n.language === 'ar' ? 'ar-EG' : 'en-GB');
  const selected = selectedDay ?? today.getDate();
  const fontRegular = i18n.language === 'ar' ? 'Amiri' : 'Lora';
  const fontBold = i18n.language === 'ar' ? 'Amiri-Bold' : 'Lora-Bold';

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
      }}
    >
      {weekDays.map((d) => {
        const active = d.date === selected;
        if (active) {
          return (
            <Pressable
              key={d.date}
              onPress={onDayPress ? () => onDayPress(d.date) : undefined}
              style={{
                width: 48,
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 16,
                borderWidth: 2,
                borderColor: C.brand,
                backgroundColor: C.brandLight,
                alignItems: 'center',
                gap: 2,
              }}
            >
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: hasUpdate ? C.brand : C.brandDark,
                }}
              />
              <RNText style={{ fontFamily: fontRegular, fontSize: 12, color: C.brandDark }}>
                {d.label}
              </RNText>
              <RNText style={{ fontFamily: fontBold, fontSize: 16, color: C.brandDark }}>
                {d.date}
              </RNText>
            </Pressable>
          );
        }
        return (
          <Pressable
            key={d.date}
            onPress={onDayPress ? () => onDayPress(d.date) : undefined}
            hitSlop={6}
            style={{ alignItems: 'center', gap: 2, paddingVertical: 4, paddingHorizontal: 8 }}
          >
            <RNText style={{ fontFamily: fontRegular, fontSize: 12, color: C.muted }}>
              {d.label}
            </RNText>
            <RNText style={{ fontFamily: fontBold, fontSize: 16, color: C.muted }}>{d.date}</RNText>
          </Pressable>
        );
      })}
    </View>
  );
}
