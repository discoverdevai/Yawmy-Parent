import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { TextInput, View, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from './Text';
import { cn } from '../tw';

/**
 * 4-digit segmented input. Each cell is a separate TextInput; pasting a 4-digit
 * code into any cell distributes the digits across all four. RTL-aware: in RTL
 * the cell order remains visually left-to-right because numerals stay LTR.
 *
 * @param {{
 *   length?: number,
 *   value: string,
 *   onChange: (value: string) => void,
 *   error?: boolean,
 *   autoFocus?: boolean,
 * }} props
 */
export const OtpInput = forwardRef(function OtpInput(
  { length = 4, value, onChange, error, autoFocus = true },
  _ref,
) {
  const { i18n } = useTranslation();
  const fontFamily = i18n.language === 'ar' ? 'Amiri-Bold' : 'PTSerif-Bold';
  const inputs = useRef([]);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  useEffect(() => {
    if (autoFocus && inputs.current[0]) {
      const t = setTimeout(() => inputs.current[0]?.focus(), 100);
      return () => clearTimeout(t);
    }
  }, [autoFocus]);

  function handleChangeAt(i, raw) {
    const digits = raw.replace(/\D/g, '');
    if (digits.length === 0) {
      const next = value.slice(0, i) + '' + value.slice(i + 1);
      onChange(next.padEnd(0, ''));
      return;
    }
    if (digits.length >= length) {
      // user pasted full code
      onChange(digits.slice(0, length));
      inputs.current[length - 1]?.focus();
      return;
    }
    const ch = digits[digits.length - 1];
    const arr = value.padEnd(length, ' ').split('');
    arr[i] = ch;
    const next = arr.join('').replace(/ /g, '');
    onChange(next);
    if (i < length - 1) inputs.current[i + 1]?.focus();
  }

  function handleKeyPressAt(i, e) {
    if (e.nativeEvent.key === 'Backspace') {
      if ((value[i] ?? '') === '' && i > 0) {
        const arr = value.padEnd(length, ' ').split('');
        arr[i - 1] = '';
        onChange(arr.join('').trimEnd());
        inputs.current[i - 1]?.focus();
      }
    }
  }

  return (
    <View className="flex-row items-center justify-center gap-3">
      {Array.from({ length }).map((_, i) => {
        const ch = value[i] ?? '';
        const filled = ch !== '';
        const focused = focusedIndex === i;
        return (
          <Pressable key={i} onPress={() => inputs.current[i]?.focus()}>
            <View
              className={cn(
                'h-16 w-16 items-center justify-center rounded-2xl border',
                error
                  ? 'border-danger bg-surface-card'
                  : filled
                    ? 'border-brand-primary-300 bg-brand-primary-50'
                    : focused
                      ? 'border-brand-primary-500 bg-surface-card'
                      : 'border-neutral-300 bg-surface-card',
              )}
            >
              <TextInput
                ref={(el) => (inputs.current[i] = el)}
                value={ch}
                onChangeText={(t) => handleChangeAt(i, t)}
                onKeyPress={(e) => handleKeyPressAt(i, e)}
                onFocus={() => setFocusedIndex(i)}
                onBlur={() => setFocusedIndex(-1)}
                keyboardType="number-pad"
                maxLength={length}
                textContentType="oneTimeCode"
                className="text-2xl text-ink-900"
                style={{ fontFamily, textAlign: 'center', minWidth: 32 }}
                accessibilityLabel={`Digit ${i + 1}`}
              />
            </View>
          </Pressable>
        );
      })}
    </View>
  );
});

/**
 * Countdown timer used under the OTP input ("Resend code in 00:30").
 * @param {{ seconds: number, onResend: () => void }} props
 */
export function OtpResendCountdown({ seconds, onResend, label, resendLabel, prefix }) {
  const [remaining, setRemaining] = useState(seconds);
  useEffect(() => {
    setRemaining(seconds);
    if (seconds <= 0) return;
    const id = setInterval(() => {
      setRemaining((r) => (r > 0 ? r - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [seconds]);

  if (remaining > 0) {
    const m = String(Math.floor(remaining / 60)).padStart(2, '0');
    const s = String(remaining % 60).padStart(2, '0');
    return (
      <View className="items-center mt-3">
        {label ? (
          <Text tone="muted" variant="caption" className="mb-0.5">
            {label}
          </Text>
        ) : null}
        <Text variant="caption">
          <Text weight="bold" className="text-base">
            {prefix}
          </Text>
          {' '}
          <Text tone="muted">
            {m}:{s}
          </Text>
        </Text>
      </View>
    );
  }

  return (
    <View className="items-center mt-3">
      {label ? (
        <Text tone="muted" variant="caption" className="mb-0.5">
          {label}
        </Text>
      ) : null}
      <Pressable onPress={onResend}>
        <Text weight="bold" tone="brand">
          {resendLabel}
        </Text>
      </Pressable>
    </View>
  );
}
