import React from 'react';
import { ScrollView, View, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cn } from '../tw';

/**
 * Screen layout primitive. Provides a cream-page background, optional
 * scroll, padded body, and a fixed footer slot below the scroll view.
 *
 * Layout-critical styles use plain `style` props rather than NativeWind
 * classes so the structure renders identically regardless of how the CSS
 * runtime is wired in the host app.
 */
export function Screen({
  children,
  className,
  scrollable = true,
  padded = true,
  footer,
  edges,
  ...rest
}) {
  const padding = padded ? { paddingHorizontal: 20, paddingVertical: 16 } : undefined;

  // Note: deliberately NOT setting `flexGrow: 1` on the contentContainer.
  // With flexGrow:1 the content stretches to fill the screen, and any
  // children using `mt-auto` / unbounded spacing redistribute oddly.
  // Letting the contentContainer size to its children gives predictable
  // top-to-bottom stacking that matches the Figma frames.
  const body = scrollable ? (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={padding}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={{ flex: 1, ...padding }}>{children}</View>
  );

  return (
    <SafeAreaView
      className={cn('bg-surface-page', className)}
      style={{ flex: 1, backgroundColor: '#FBF8EC' }}
      edges={edges}
      {...rest}
    >
      {Platform.OS === 'android' ? (
        <StatusBar backgroundColor="transparent" translucent barStyle="dark-content" />
      ) : null}
      {body}
      {footer ? (
        <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 }}>{footer}</View>
      ) : null}
    </SafeAreaView>
  );
}
