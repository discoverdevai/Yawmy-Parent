// Recreated from Figma vuesax/linear/arrow-left (downloaded SVG paths).
import React from 'react';
import Svg, { Path } from 'react-native-svg';

export function ArrowLeftIcon({ size = 24, color = '#333333', strokeWidth = 1.5 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9.57 5.93L3.5 12L9.57 18.07"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M20.5 12H3.67"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
