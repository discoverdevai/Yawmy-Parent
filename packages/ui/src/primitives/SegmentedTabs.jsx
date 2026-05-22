import React from 'react';
import { Pressable, View } from 'react-native';
import { Text } from './Text';
import { cn } from '../tw';

/**
 * Two-segment pill tabs. Black background with a white inner pill marking the
 * selected option. Matches the Figma "Children / Teachers" pattern.
 *
 * @param {{
 *   value: string,
 *   onChange: (value: string) => void,
 *   options: { value: string, label: string }[],
 *   className?: string,
 * }} props
 */
export function SegmentedTabs({ value, onChange, options, className }) {
  return (
    <View className={cn('flex-row rounded-full bg-ink-950 p-1', className)}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            className={cn(
              'flex-1 items-center justify-center rounded-full py-2.5',
              active ? 'bg-surface-card' : 'bg-transparent',
            )}
          >
            <Text weight="bold" tone={active ? 'default' : 'onDark'}>
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
