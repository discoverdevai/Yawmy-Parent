import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { ChevronDown, Check } from 'lucide-react-native';
import { Text } from './Text';
import { BottomSheet } from './BottomSheet';
import { cn } from '../tw';

/**
 * Pill-shaped select. When pressed, opens a BottomSheet with the option list.
 * Supports single or multi select. Renders the comma-joined labels (or a
 * placeholder) inside the trigger.
 */
export function Select({
  label,
  placeholder,
  value,
  onChange,
  options,
  multiSelect = false,
  className,
  triggerClassName,
}) {
  const [open, setOpen] = useState(false);
  const selectedValues = multiSelect ? (value ?? []) : value ? [value] : [];
  const selectedLabels = options
    .filter((o) => selectedValues.includes(o.value))
    .map((o) => o.label);

  function toggle(v) {
    if (multiSelect) {
      const next = selectedValues.includes(v)
        ? selectedValues.filter((x) => x !== v)
        : [...selectedValues, v];
      onChange(next);
    } else {
      onChange(v);
      setOpen(false);
    }
  }

  return (
    <View className={cn('w-full', className)}>
      {label ? (
        <Text variant="label" weight="bold" className="mb-2">
          {label}
        </Text>
      ) : null}
      <Pressable
        onPress={() => setOpen(true)}
        className={cn(
          'flex-row items-center justify-between rounded-3xl border border-neutral-200 bg-surface-card px-5 h-14',
          triggerClassName,
        )}
      >
        <Text tone={selectedLabels.length ? 'default' : 'muted'} className="flex-1">
          {selectedLabels.length ? selectedLabels.join(', ') : placeholder}
        </Text>
        <ChevronDown size={18} color="#52525B" />
      </Pressable>

      <BottomSheet visible={open} onDismiss={() => setOpen(false)}>
        {label ? (
          <Text variant="title" weight="bold" className="mb-3">
            {label}
          </Text>
        ) : null}
        <View>
          {options.map((opt) => {
            const active = selectedValues.includes(opt.value);
            return (
              <Pressable
                key={opt.value}
                onPress={() => toggle(opt.value)}
                className="flex-row items-center justify-between py-3"
              >
                <Text tone={active ? 'brand' : 'default'}>{opt.label}</Text>
                {active ? <Check size={20} color="#84A664" /> : null}
              </Pressable>
            );
          })}
        </View>
      </BottomSheet>
    </View>
  );
}
