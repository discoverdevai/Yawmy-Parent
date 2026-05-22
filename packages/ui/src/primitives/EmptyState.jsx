import React from 'react';
import { View } from 'react-native';
import { Text } from './Text';
import { cn } from '../tw';

export function EmptyState({ title, body, icon, action, className }) {
  return (
    <View className={cn('items-center justify-center py-10 px-6', className)}>
      {icon ? <View className="mb-3">{icon}</View> : null}
      <Text variant="title" className="mb-1 text-center">
        {title}
      </Text>
      {body ? (
        <Text tone="muted" className="text-center">
          {body}
        </Text>
      ) : null}
      {action ? <View className="mt-4">{action}</View> : null}
    </View>
  );
}
