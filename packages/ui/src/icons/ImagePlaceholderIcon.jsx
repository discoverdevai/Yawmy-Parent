import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

// akar-icons:image (used in the sign-in placeholder card)
export function ImagePlaceholderIcon({ size = 163, color = '#535353', strokeWidth = 1.5 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 16L7 12L11 16L17 10L21 14"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M3 5C3 3.895 3.895 3 5 3H19C20.105 3 21 3.895 21 5V19C21 20.105 20.105 21 19 21H5C3.895 21 3 20.105 3 19V5Z"
        stroke={color}
        strokeWidth={strokeWidth}
      />
      <Circle cx="9" cy="9" r="2" stroke={color} strokeWidth={strokeWidth} />
    </Svg>
  );
}
