// Approximation of the Daily Log + News mask icons (the Figma design uses
// raster mask images that are not extractable as path data; these stand-in
// SVGs match line weight + size).
import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

export function DailyLogIcon({ size = 24, color = '#535353', strokeWidth = 1.5 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M14 3H6C4.89543 3 4 3.89543 4 5V19C4 20.1046 4.89543 21 6 21H14"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M8 8H14" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path d="M8 12H14" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path d="M8 16H11" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      {/* Folded corner / clock decoration */}
      <Path
        d="M16 14C18.2091 14 20 15.7909 20 18C20 20.2091 18.2091 22 16 22C13.7909 22 12 20.2091 12 18"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M16 16V18L17 19" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </Svg>
  );
}

export function NewsIcon({ size = 24, color = '#535353', strokeWidth = 1.5 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect
        x={3}
        y={4}
        width={15}
        height={16}
        rx={2}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      <Path d="M18 8H21V18C21 19.1046 20.1046 20 19 20" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M7 8H14" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path d="M7 12H14" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path d="M7 16H11" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </Svg>
  );
}
