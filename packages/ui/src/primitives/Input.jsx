import React, { forwardRef, useState } from 'react';
import { TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from './Text';
import { cn } from '../tw';

export const Input = forwardRef(function Input(
  {
    label,
    helper,
    error,
    leadingIcon,
    trailingIcon,
    className,
    inputClassName,
    onFocus,
    onBlur,
    ...rest
  },
  ref,
) {
  const [focused, setFocused] = useState(false);
  const { i18n } = useTranslation();
  const fontFamily = i18n.language === 'ar' ? 'Amiri' : 'PTSerif';
  return (
    <View className={cn('w-full', className)}>
      {label ? (
        <Text variant="label" weight="bold" className="mb-2">
          {label}
        </Text>
      ) : null}
      <View
        className={cn(
          'flex-row items-center rounded-3xl border bg-surface-card px-5 h-14',
          error
            ? 'border-danger'
            : focused
              ? 'border-brand-primary-500'
              : 'border-neutral-200',
        )}
      >
        {leadingIcon ? <View className="me-3">{leadingIcon}</View> : null}
        <TextInput
          ref={ref}
          className={cn('flex-1 text-base text-ink-900', inputClassName)}
          style={{ fontFamily }}
          placeholderTextColor="#A1A1AA"
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...rest}
        />
        {trailingIcon ? <View className="ms-2">{trailingIcon}</View> : null}
      </View>
      {error ? (
        <Text variant="caption" tone="danger" className="mt-1">
          {error}
        </Text>
      ) : helper ? (
        <Text variant="caption" tone="muted" className="mt-1">
          {helper}
        </Text>
      ) : null}
    </View>
  );
});
