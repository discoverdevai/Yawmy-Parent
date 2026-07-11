// Quiet hours — pixel-aligned with Figma `598:77210`, the modal presented over
// the Profile screen. A dim backdrop (tap to dismiss) with a card holding
// From/To time steppers and a Save action. Silences notifications in-range.
import React, { useState } from 'react';
import { Pressable, Text as RNText, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { ArrowDownIcon } from '@nms/ui';

const C = {
  backdrop: 'rgba(0,0,0,0.6)',
  card: '#FFFFF5',
  box: '#FCFCEC',
  border: '#F5F5DC',
  ink: '#333333',
  gray: '#535353',
  brand: '#76945C',
  white: '#FEFEFE',
};

const pad = (n) => String(n).padStart(2, '0');
const wrap = (n, min, max) => (n > max ? min : n < min ? max : n);

export default function QuietHoursModal() {
  const { i18n } = useTranslation(['common']);
  const isAr = i18n.language === 'ar';
  const fontRegular = isAr ? 'Amiri' : 'Lora';
  const fontMedium = isAr ? 'Amiri' : 'Lora-Medium';
  const fontSemiBold = isAr ? 'Amiri-Bold' : 'Lora-Bold';
  const fontBold = isAr ? 'Amiri-Bold' : 'Lora-Bold';

  const [from, setFrom] = useState({ h: 8, m: 0, period: 'Am' });
  const [to, setTo] = useState({ h: 12, m: 0, period: 'Pm' });

  function Stepper({ value, onUp, onDown }) {
    return (
      <View style={{ width: 32, alignItems: 'center', gap: 4 }}>
        <Pressable onPress={onUp} hitSlop={8}>
          <View style={{ transform: [{ scaleY: -1 }] }}>
            <ArrowDownIcon size={24} color={C.ink} />
          </View>
        </Pressable>
        <RNText style={{ fontFamily: fontBold, fontSize: 18, color: C.ink }}>{pad(value)}</RNText>
        <Pressable onPress={onDown} hitSlop={8}>
          <ArrowDownIcon size={24} color={C.ink} />
        </Pressable>
      </View>
    );
  }

  // A From/To field: a header label box atop a bordered time-picker box.
  function TimeField({ label, value, setValue, side }) {
    const set = (patch) => setValue((v) => ({ ...v, ...patch }));
    return (
      <View style={{ flex: 1 }}>
        <View
          style={{
            height: 38,
            backgroundColor: C.box,
            borderWidth: 1,
            borderColor: C.border,
            borderTopLeftRadius: side === 'left' ? 12 : 0,
            borderTopRightRadius: side === 'right' ? 12 : 0,
            justifyContent: 'center',
            paddingHorizontal: 8,
          }}
        >
          <RNText style={{ fontFamily: fontMedium, fontSize: 14, color: C.ink }}>{label}</RNText>
        </View>
        <View
          style={{
            height: 118,
            backgroundColor: C.box,
            borderLeftWidth: 1,
            borderRightWidth: 1,
            borderBottomWidth: 1,
            borderColor: C.border,
            borderBottomLeftRadius: side === 'left' ? 12 : 0,
            borderBottomRightRadius: side === 'right' ? 12 : 0,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
            gap: 8,
          }}
        >
          <Stepper value={value.h} onUp={() => set({ h: wrap(value.h + 1, 1, 12) })} onDown={() => set({ h: wrap(value.h - 1, 1, 12) })} />
          <RNText style={{ fontFamily: fontBold, fontSize: 18, color: C.ink }}>:</RNText>
          <Stepper value={value.m} onUp={() => set({ m: wrap(value.m + 1, 0, 59) })} onDown={() => set({ m: wrap(value.m - 1, 0, 59) })} />
          <Pressable onPress={() => set({ period: value.period === 'Am' ? 'Pm' : 'Am' })} hitSlop={8}>
            <RNText style={{ fontFamily: fontSemiBold, fontSize: 16, color: C.ink }}>{value.period}</RNText>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.backdrop, alignItems: 'center', justifyContent: 'center' }}>
      {/* Backdrop tap-to-dismiss */}
      <Pressable onPress={() => router.back()} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />

      <View style={{ width: 343, backgroundColor: C.card, borderRadius: 36, padding: 16, gap: 16 }}>
        <View style={{ gap: 8 }}>
          <RNText style={{ fontFamily: fontBold, fontSize: 20, color: C.ink }}>Quiet hours</RNText>
          <RNText style={{ fontFamily: fontRegular, fontSize: 12, color: C.gray }}>
            Notifications will be silenced during this time.
          </RNText>
        </View>

        <View style={{ flexDirection: 'row' }}>
          <TimeField label="From:" value={from} setValue={setFrom} side="left" />
          <TimeField label="To:" value={to} setValue={setTo} side="right" />
        </View>

        <Pressable
          onPress={() => router.back()}
          style={{ height: 48, borderRadius: 20, backgroundColor: C.brand, alignItems: 'center', justifyContent: 'center' }}
        >
          <RNText style={{ fontFamily: fontBold, fontSize: 16, color: C.white }}>Save</RNText>
        </Pressable>
      </View>
    </View>
  );
}
