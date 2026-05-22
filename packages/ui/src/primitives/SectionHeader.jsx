import React from 'react';
import { View } from 'react-native';
import { Text } from './Text';
import { cn } from '../tw';

export function SectionHeader({ title, action, className }) {
  return (
    <View className={cn('flex-row items-center justify-between mb-2 mt-4', className)}>
      <Text variant="subtitle">{title}</Text>
      {action ? <View>{action}</View> : null}
    </View>
  );
}
