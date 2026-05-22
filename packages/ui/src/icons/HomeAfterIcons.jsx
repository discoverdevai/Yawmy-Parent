// Icons used in the populated "Home — after check in" Figma frame
// (`279:21432`). Reproduced from the vuesax SVG paths Figma exports.
import React from 'react';
import Svg, { Path } from 'react-native-svg';

export function LogoutIcon({ size = 24, color = '#FEFEFE', strokeWidth = 1.5 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M17.44 14.62L20 12.06L17.44 9.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9.76 12.06H19.93"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M11.76 20C7.34 20 3.76 17 3.76 12C3.76 7 7.34 4 11.76 4"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function CalendarIcon({ size = 16, color = '#334722', strokeWidth = 1.2 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path d="M5.33333 1.33333V3.33333" stroke={color} strokeWidth={strokeWidth} strokeMiterlimit={10} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M10.6667 1.33333V3.33333" stroke={color} strokeWidth={strokeWidth} strokeMiterlimit={10} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M2.33333 6.06H13.6667" stroke={color} strokeWidth={strokeWidth} strokeMiterlimit={10} strokeLinecap="round" strokeLinejoin="round" />
      <Path
        d="M14 5.66667V11.3333C14 13.3333 13 14.6667 10.6667 14.6667H5.33333C3 14.6667 2 13.3333 2 11.3333V5.66667C2 3.66667 3 2.33333 5.33333 2.33333H10.6667C13 2.33333 14 3.66667 14 5.66667Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function LocationIcon({ size = 16, color = '#334722', strokeWidth = 1.2 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path
        d="M8 8.95333C9.14875 8.95333 10.08 8.02209 10.08 6.87333C10.08 5.72458 9.14875 4.79333 8 4.79333C6.85125 4.79333 5.92 5.72458 5.92 6.87333C5.92 8.02209 6.85125 8.95333 8 8.95333Z"
        stroke={color}
        strokeWidth={strokeWidth}
      />
      <Path
        d="M2.41333 5.66C3.72667 -0.113333 12.28 -0.106666 13.5867 5.66667C14.3533 9.05333 12.2467 11.92 10.4 13.6933C9.06 14.9867 6.94 14.9867 5.59333 13.6933C3.75333 11.92 1.64667 9.04667 2.41333 5.66Z"
        stroke={color}
        strokeWidth={strokeWidth}
      />
    </Svg>
  );
}

// Daily-log preview icons. The Figma file uses raster mask images for the
// mood / nap / meals indicators that we can't path-extract; these are
// approximations that match the line-weight and silhouette family.
export function MoodIcon({ size = 24, color = '#76945C', strokeWidth = 1.5 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke={color} strokeWidth={strokeWidth} />
      <Path d="M9 10H9.01" stroke={color} strokeWidth={strokeWidth + 0.5} strokeLinecap="round" />
      <Path d="M15 10H15.01" stroke={color} strokeWidth={strokeWidth + 0.5} strokeLinecap="round" />
      <Path d="M8.5 14C9.5 15.3 10.7 16 12 16C13.3 16 14.5 15.3 15.5 14" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function NapIcon({ size = 24, color = '#76945C', strokeWidth = 1.5 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function MealsIcon({ size = 24, color = '#76945C', strokeWidth = 1.5 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 2v7c0 1.1.9 2 2 2h2v11" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M7 2v20" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// Bookmark/saved icon for event cards
export function BookmarkIcon({ size = 16, color = '#FEFEFE', filled = false }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16Z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={filled ? color : 'none'}
      />
    </Svg>
  );
}

// Small green check pill for "safely checked in"
export function CheckCircleIcon({ size = 20, color = '#76945C', strokeWidth = 1.5 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M22 12C22 17.5 17.5 22 12 22C6.5 22 2 17.5 2 12C2 6.5 6.5 2 12 2C17.5 2 22 6.5 22 12Z"
        stroke={color}
        strokeWidth={strokeWidth}
      />
      <Path
        d="M7.75 12L10.58 14.83L16.25 9.17"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
