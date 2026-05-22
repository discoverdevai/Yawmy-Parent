import React, { forwardRef } from 'react';
import { Text as RNText } from 'react-native';
import { useTranslation } from 'react-i18next';
import { cva } from 'class-variance-authority';
import { cn } from '../tw';

const text = cva('text-ink-900', {
  variants: {
    variant: {
      display: 'text-3xl',
      heading: 'text-2xl',
      title: 'text-xl',
      subtitle: 'text-lg',
      body: 'text-base',
      label: 'text-sm',
      caption: 'text-xs text-neutral-600',
    },
    weight: {
      regular: '',
      bold: '',
    },
    tone: {
      default: '',
      muted: 'text-neutral-600',
      brand: 'text-brand-primary-600',
      danger: 'text-danger',
      success: 'text-success',
      onDark: 'text-neutral-0',
    },
  },
  defaultVariants: { variant: 'body', weight: 'regular', tone: 'default' },
});

const fontFor = (lang, weight) => {
  if (lang === 'ar') return weight === 'bold' ? 'Amiri-Bold' : 'Amiri';
  return weight === 'bold' ? 'PTSerif-Bold' : 'PTSerif';
};

export const Text = forwardRef(function Text(
  { variant = 'body', weight, tone, className, style, children, ...rest },
  ref,
) {
  const { i18n } = useTranslation();
  const isHeading = variant === 'display' || variant === 'heading' || variant === 'title';
  const computedWeight = weight ?? (isHeading ? 'bold' : 'regular');
  const fontFamily = fontFor(i18n.language, computedWeight);
  return (
    <RNText
      ref={ref}
      className={cn(text({ variant, weight: computedWeight, tone }), className)}
      style={[{ fontFamily }, style]}
      {...rest}
    >
      {children}
    </RNText>
  );
});
