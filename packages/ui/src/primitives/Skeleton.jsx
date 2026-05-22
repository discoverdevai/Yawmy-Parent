import React from 'react';
import { View } from 'react-native';
import { cn } from '../tw';

export function Skeleton({ className }) {
  return <View className={cn('bg-neutral-200 rounded-md', className)} />;
}
