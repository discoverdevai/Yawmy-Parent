import React from 'react';
import { View } from 'react-native';
import { Star, Moon, Heart } from 'lucide-react-native';
import { cn } from '../tw';

/**
 * Decorative top banner for parent-portal hero screens (invite welcome,
 * invite expired). Mimics the Figma "hanging items" header — small icons
 * dangling from the top edge with thin lines.
 *
 * Real assets (duck, baby bottle, whale) will be exported from Figma later;
 * for now we render lucide icons in the same coral / cream / olive palette to
 * keep the same visual rhythm.
 */
const items = [
  { Icon: Star, color: '#F4D06F', length: 28 },
  { Icon: Moon, color: '#EE8472', length: 44 },
  { Icon: Heart, color: '#F4ADA0', length: 36 },
  { Icon: Star, color: '#9AB269', length: 50 },
  { Icon: Star, color: '#D85540', length: 30 },
  { Icon: Heart, color: '#F4D06F', length: 40 },
  { Icon: Moon, color: '#84A664', length: 26 },
];

export function NurseryDecorations({ className }) {
  return (
    <View className={cn('flex-row justify-between px-3 pt-1', className)}>
      {items.map(({ Icon, color, length }, i) => (
        <View key={i} className="items-center">
          <View style={{ width: 1, height: length, backgroundColor: '#D4D4D8' }} />
          <Icon size={20} color={color} fill={color} />
        </View>
      ))}
    </View>
  );
}
