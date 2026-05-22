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

const DEFAULT_DAYS = [
  { label: 'Mo', date: 18 },
  { label: 'Tu', date: 19 },
  { label: 'Wed', date: 20 },
  { label: 'Th', date: 21 },
  { label: 'Fr', date: 22 },
  { label: 'Sa', date: 23 },
  { label: 'Su', date: 24 },
];

export function CalendarWeek({
  selectedDay = 21,
  hasUpdate = false,
  days = DEFAULT_DAYS,
  onDayPress,
}) {
  const { i18n } = useTranslation();
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
      {days.map((d) => {
        const active = d.date === selectedDay;
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
              <RNText
                style={{ fontFamily: fontRegular, fontSize: 12, color: C.brandDark }}
              >
                {d.label}
              </RNText>
              <RNText
                style={{ fontFamily: fontBold, fontSize: 16, color: C.brandDark }}
              >
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
            <RNText style={{ fontFamily: fontBold, fontSize: 16, color: C.muted }}>
              {d.date}
            </RNText>
          </Pressable>
        );
      })}
    </View>
  );
}
