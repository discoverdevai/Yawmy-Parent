// vuesax/linear/home — bottom nav active state
import React from 'react';
import Svg, { Path } from 'react-native-svg';

export function HomeIcon({ size = 24, color = '#76945C', strokeWidth = 1.5 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 18V15"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M10.07 2.82L3.14 8.37C2.36 8.99 1.86 10.3 2.03 11.28L3.36 19.24C3.6 20.66 4.96 21.81 6.4 21.81H17.6C19.03 21.81 20.4 20.65 20.64 19.24L21.97 11.28C22.13 10.3 21.63 8.99 20.86 8.37L13.93 2.83C12.86 1.97 11.13 1.97 10.07 2.82Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
