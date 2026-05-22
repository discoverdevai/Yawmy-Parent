// vuesax notification-bing — linear (default) and bold (with badge)
import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

export function NotificationIcon({ size = 24, color = '#333333', strokeWidth = 1.5 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 6.44V9.77" stroke={color} strokeWidth={strokeWidth} strokeMiterlimit={10} strokeLinecap="round" />
      <Path
        d="M12.02 2C8.34 2 5.36 4.98 5.36 8.66V10.76C5.36 11.44 5.08 12.46 4.73 13.04L3.46 15.16C2.68 16.47 3.22 17.93 4.66 18.41C9.44 20 14.61 20 19.39 18.41C20.74 17.96 21.32 16.38 20.59 15.16L19.32 13.04C18.97 12.46 18.69 11.43 18.69 10.76V8.66C18.68 5 15.68 2 12.02 2Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeMiterlimit={10}
        strokeLinecap="round"
      />
      <Path
        d="M15.33 18.82C15.33 20.65 13.83 22.15 12 22.15C11.09 22.15 10.25 21.77 9.65 21.17C9.05 20.57 8.67 19.73 8.67 18.82"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeMiterlimit={10}
      />
    </Svg>
  );
}

// Bold variant — used when the user has unread notifications. The dot badge
// is composed in code rather than baked into the icon.
export function NotificationBoldIcon({ size = 24, color = '#334722', dotColor = '#D85540' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20.19 14.06L19.06 12.18C18.81 11.77 18.59 10.98 18.59 10.5V8.63C18.59 5 15.64 2.05 12.02 2.05C8.39 2.06 5.44 5 5.44 8.63V10.49C5.44 10.97 5.22 11.76 4.98 12.17L3.85 14.05C3.42 14.78 3.32 15.61 3.59 16.33C3.86 17.06 4.47 17.64 5.27 17.9C6.35 18.26 7.44 18.52 8.55 18.71C8.66 18.73 8.77 18.74 8.88 18.76C9.02 18.78 9.17 18.8 9.32 18.82C9.58 18.86 9.84 18.89 10.11 18.91C10.74 18.97 11.38 19 12.02 19C12.65 19 13.28 18.97 13.9 18.91C14.13 18.89 14.36 18.87 14.58 18.84C14.76 18.82 14.94 18.8 15.12 18.77C15.23 18.76 15.34 18.74 15.45 18.72C16.57 18.54 17.68 18.26 18.76 17.9C19.53 17.64 20.12 17.06 20.4 16.32C20.68 15.57 20.6 14.75 20.19 14.06ZM12.75 10C12.75 10.42 12.41 10.76 11.99 10.76C11.57 10.76 11.23 10.42 11.23 10V6.9C11.23 6.48 11.57 6.14 11.99 6.14C12.41 6.14 12.75 6.48 12.75 6.9V10Z"
        fill={color}
      />
      <Path
        d="M14.83 20.01C14.41 21.17 13.3 22 12 22C11.21 22 10.43 21.68 9.88 21.11C9.56 20.81 9.32 20.41 9.18 20C9.31 20.02 9.44 20.03 9.58 20.05C9.81 20.08 10.05 20.11 10.29 20.13C10.86 20.18 11.44 20.21 12.02 20.21C12.59 20.21 13.16 20.18 13.72 20.13C13.93 20.11 14.14 20.1 14.34 20.07C14.5 20.05 14.66 20.03 14.83 20.01Z"
        fill={color}
      />
      <Circle cx={18} cy={5.5} r={3.5} fill={dotColor} />
    </Svg>
  );
}
