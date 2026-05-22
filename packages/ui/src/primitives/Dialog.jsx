import React from 'react';
import { Modal, View } from 'react-native';
import { cn } from '../tw';

/**
 * Centered modal dialog (the "Account Activated" / "Setup Successful" pattern
 * in Figma). Dimmed backdrop, white rounded card centered, content provided
 * by caller.
 */
export function Dialog({ visible, onRequestClose, children, className }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onRequestClose} statusBarTranslucent>
      <View className="flex-1 items-center justify-center bg-black/50 px-6">
        <View className={cn('w-full rounded-3xl bg-surface-card p-6', className)}>{children}</View>
      </View>
    </Modal>
  );
}
