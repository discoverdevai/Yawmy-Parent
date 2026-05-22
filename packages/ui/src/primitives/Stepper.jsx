import React from 'react';
import { View } from 'react-native';
import { cn } from '../tw';

/**
 * Horizontal step indicator. Filled segments mark current/past steps.
 * Renders as `total` thin bars with a small gap.
 *
 * @param {{ current: number, total: number, className?: string }} props
 */
export function Stepper({ current, total, className }) {
  return (
    <View className={cn('flex-row gap-1.5', className)}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          className={cn(
            'h-1 flex-1 rounded-full',
            i <= current - 1 ? 'bg-brand-primary-500' : 'bg-neutral-200',
          )}
        />
      ))}
    </View>
  );
}
