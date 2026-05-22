import React from 'react';
import { View } from 'react-native';
import { cva } from 'class-variance-authority';
import { Text } from './Text';
import { cn } from '../tw';

const badge = cva('rounded-full px-2 py-0.5 self-start', {
  variants: {
    tone: {
      neutral: 'bg-neutral-100',
      brand: 'bg-brand-primary-100',
      accent: 'bg-brand-accent-100',
      success: 'bg-success/10',
      warning: 'bg-warning/10',
      danger: 'bg-danger/10',
    },
  },
  defaultVariants: { tone: 'neutral' },
});

const labelTone = {
  neutral: 'muted',
  brand: 'brand',
  accent: 'default',
  success: 'success',
  warning: 'default',
  danger: 'danger',
};

export function Badge({ children, tone = 'neutral', className }) {
  return (
    <View className={cn(badge({ tone }), className)}>
      <Text variant="caption" tone={labelTone[tone]}>
        {children}
      </Text>
    </View>
  );
}
