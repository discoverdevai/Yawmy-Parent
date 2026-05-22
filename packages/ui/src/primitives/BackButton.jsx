import React from 'react';
import { Pressable, I18nManager } from 'react-native';
import { ArrowLeft, ArrowRight } from 'lucide-react-native';
import { router } from 'expo-router';
import { cn } from '../tw';

/**
 * Circular back button used at the top-left of detail screens. Mirrors the
 * arrow direction in RTL.
 */
export function BackButton({ onPress, className, color = '#0F0F10' }) {
  const Icon = I18nManager.isRTL ? ArrowRight : ArrowLeft;
  return (
    <Pressable
      onPress={onPress ?? (() => router.back())}
      accessibilityRole="button"
      className={cn(
        'h-11 w-11 items-center justify-center rounded-full border border-neutral-200 bg-surface-card',
        className,
      )}
    >
      <Icon size={20} color={color} />
    </Pressable>
  );
}
