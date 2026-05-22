import React, { forwardRef } from 'react';
import { Pressable, ActivityIndicator, View } from 'react-native';
import { cva } from 'class-variance-authority';
import { Text } from './Text';
import { cn } from '../tw';

const button = cva('flex-row items-center justify-center gap-2', {
  variants: {
    variant: {
      primary: 'bg-brand-primary-500 active:bg-brand-primary-600',
      secondary: 'bg-surface-card border border-brand-primary-500 active:bg-brand-primary-50',
      ghost: 'bg-transparent active:bg-neutral-100',
      ink: 'bg-ink-950 active:bg-ink-900',
      destructive: 'bg-danger active:opacity-80',
      link: 'bg-transparent',
    },
    size: {
      sm: 'h-11 px-4 rounded-2xl',
      md: 'h-14 px-5 rounded-3xl',
      lg: 'h-16 px-6 rounded-3xl',
    },
    block: {
      true: 'w-full',
      false: '',
    },
    disabled: {
      true: 'opacity-50',
      false: '',
    },
  },
  defaultVariants: { variant: 'primary', size: 'md', block: false, disabled: false },
});

const labelTone = {
  primary: 'onDark',
  secondary: 'brand',
  ghost: 'default',
  ink: 'onDark',
  destructive: 'onDark',
  link: 'brand',
};

export const Button = forwardRef(function Button(
  {
    children,
    onPress,
    variant = 'primary',
    size = 'md',
    block = false,
    leadingIcon,
    trailingIcon,
    loading = false,
    disabled = false,
    className,
    accessibilityLabel,
    testID,
    ...rest
  },
  ref,
) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      ref={ref}
      onPress={isDisabled ? undefined : onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      className={cn(button({ variant, size, block, disabled: isDisabled }), className)}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variant === 'primary' || variant === 'ink' || variant === 'destructive' ? '#FFFFFF' : '#84A664'} />
      ) : (
        <>
          {leadingIcon ? <View className="me-1">{leadingIcon}</View> : null}
          <Text weight="bold" tone={labelTone[variant]}>
            {children}
          </Text>
          {trailingIcon ? <View className="ms-1">{trailingIcon}</View> : null}
        </>
      )}
    </Pressable>
  );
});
