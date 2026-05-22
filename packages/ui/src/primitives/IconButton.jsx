import React from 'react';
import { Pressable } from 'react-native';
import { cn } from '../tw';

export function IconButton({ onPress, children, className, accessibilityLabel, testID }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      className={cn(
        'h-11 w-11 items-center justify-center rounded-full bg-surface-card border border-neutral-200',
        className,
      )}
    >
      {children}
    </Pressable>
  );
}
