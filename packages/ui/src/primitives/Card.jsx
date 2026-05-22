import React from 'react';
import { View } from 'react-native';
import { cn } from '../tw';

export function Card({ className, ...rest }) {
  return (
    <View
      className={cn(
        'rounded-3xl border border-neutral-200 bg-surface-card p-5',
        className,
      )}
      {...rest}
    />
  );
}

export function CardHeader({ className, ...rest }) {
  return <View className={cn('mb-3', className)} {...rest} />;
}

export function CardBody({ className, ...rest }) {
  return <View className={cn('', className)} {...rest} />;
}

export function CardFooter({ className, ...rest }) {
  return <View className={cn('mt-4 flex-row items-center justify-between', className)} {...rest} />;
}
