import React from 'react';
import { Pressable, View } from 'react-native';
import { ChevronRight, ChevronLeft } from 'lucide-react-native';
import { I18nManager } from 'react-native';
import { Text } from './Text';
import { cn } from '../tw';

export function ListItem({
  title,
  subtitle,
  leading,
  trailing,
  onPress,
  showChevron = true,
  className,
  testID,
}) {
  const Chevron = I18nManager.isRTL ? ChevronLeft : ChevronRight;
  const Wrapper = onPress ? Pressable : View;
  return (
    <Wrapper
      onPress={onPress}
      testID={testID}
      className={cn(
        'flex-row items-center gap-3 rounded-md bg-neutral-0 px-4 py-3',
        onPress ? 'active:bg-neutral-100' : '',
        className,
      )}
    >
      {leading ? <View>{leading}</View> : null}
      <View className="flex-1">
        <Text variant="body" className="font-medium">
          {title}
        </Text>
        {subtitle ? (
          <Text variant="caption" tone="muted">
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing ? (
        <View>{trailing}</View>
      ) : showChevron && onPress ? (
        <Chevron size={18} color="#A1A1AA" />
      ) : null}
    </Wrapper>
  );
}
