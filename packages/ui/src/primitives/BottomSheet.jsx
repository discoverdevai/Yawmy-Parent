import React from 'react';
import { Modal, Pressable, View, KeyboardAvoidingView, Platform } from 'react-native';
import { cn } from '../tw';

/**
 * Lightweight bottom sheet using a native Modal. Slides up from the bottom of
 * the screen with rounded top corners and a dimmed backdrop. Use this for
 * forms that overlay an existing screen (Add Room, Re-assign Child, etc).
 */
export function BottomSheet({ visible, onDismiss, children, className }) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onDismiss}
      statusBarTranslucent
    >
      <View className="flex-1 justify-end bg-black/40">
        <Pressable className="absolute inset-0" onPress={onDismiss} />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View
            className={cn(
              'rounded-t-3xl bg-surface-sheet px-5 pt-4 pb-6',
              className,
            )}
          >
            <View className="mb-3 self-center h-1 w-10 rounded-full bg-neutral-300" />
            {children}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
