// Icons used on the Parent "Profile" Figma frame (`598:77070`).
// Reproduced from the vuesax / iconoir line families the design uses; where an
// exact vector wasn't path-extractable the silhouette is approximated to match
// the 1.5px line weight of the surrounding icon set.
import React from 'react';
import Svg, { Path } from 'react-native-svg';

// Child Profile — baby face
export function ChildIcon({ size = 24, color = '#333333', strokeWidth = 1.5 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 21.5C17.2467 21.5 21.5 17.2467 21.5 12C21.5 6.75329 17.2467 2.5 12 2.5C6.75329 2.5 2.5 6.75329 2.5 12C2.5 17.2467 6.75329 21.5 12 21.5Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M8.75 10.5H8.76" stroke={color} strokeWidth={strokeWidth + 0.4} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M15.25 10.5H15.26" stroke={color} strokeWidth={strokeWidth + 0.4} strokeLinecap="round" strokeLinejoin="round" />
      <Path
        d="M9 14.5C9.83 15.4 10.86 15.9 12 15.9C13.14 15.9 14.17 15.4 15 14.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M11 2.6C11.4 3.4 12.4 3.7 13.2 3.3"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// Media Gallery — image / photo
export function GalleryIcon({ size = 24, color = '#333333', strokeWidth = 1.5 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9 10C10.1046 10 11 9.10457 11 8C11 6.89543 10.1046 6 9 6C7.89543 6 7 6.89543 7 8C7 9.10457 7.89543 10 9 10Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M2.67 18.95L7.6 15.64C8.39 15.11 9.53 15.17 10.24 15.78L10.57 16.07C11.35 16.74 12.61 16.74 13.39 16.07L17.55 12.5C18.33 11.83 19.59 11.83 20.37 12.5L22 13.9"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// Quiet hours — alarm clock
export function AlarmIcon({ size = 24, color = '#333333', strokeWidth = 1.5 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 21.5C16.4183 21.5 20 17.9183 20 13.5C20 9.08172 16.4183 5.5 12 5.5C7.58172 5.5 4 9.08172 4 13.5C4 17.9183 7.58172 21.5 12 21.5Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M12 10V13.5L14 15" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M5.2 3L2.5 5.5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M18.8 3L21.5 5.5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// Language — globe
export function GlobeIcon({ size = 24, color = '#333333', strokeWidth = 1.5 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 22C14.2091 22 16 17.5228 16 12C16 6.47715 14.2091 2 12 2C9.79086 2 8 6.47715 8 12C8 17.5228 9.79086 22 12 22Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M2.5 9H21.5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M2.5 15H21.5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// Change Password — key (vuesax key)
export function KeyIcon({ size = 24, color = '#333333', strokeWidth = 1.5 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M19.79 14.93C17.73 16.98 14.78 17.61 12.19 16.8L7.48 21.5C7.14 21.85 6.47 22.06 5.99 21.99L3.81 21.69C3.09 21.59 2.42 20.91 2.31 20.19L2.01 18.01C1.94 17.53 2.17 16.86 2.5 16.52L7.2 11.81C6.4 9.21 7.02 6.26 9.08 4.21C12.03 1.26 16.82 1.26 19.78 4.21C22.74 7.16 22.74 11.98 19.79 14.93Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M6.89 17.49L9.19 19.79" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path
        d="M14.5 11C15.3284 11 16 10.3284 16 9.5C16 8.67157 15.3284 8 14.5 8C13.6716 8 13 8.67157 13 9.5C13 10.3284 13.6716 11 14.5 11Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// Privacy & Security — shield with keyhole (vuesax shield-security)
export function ShieldIcon({ size = 24, color = '#333333', strokeWidth = 1.5 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M10.49 2.23L5.5 4.11C4.35 4.54 3.41 5.9 3.41 7.12V14.55C3.41 15.73 4.19 17.28 5.14 17.99L9.44 21.2C10.85 22.26 13.17 22.26 14.58 21.2L18.88 17.99C19.83 17.28 20.61 15.73 20.61 14.55V7.12C20.61 5.89 19.67 4.53 18.52 4.1L13.53 2.23C12.68 1.92 11.32 1.92 10.49 2.23Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 12.5C13.1046 12.5 14 11.6046 14 10.5C14 9.39543 13.1046 8.5 12 8.5C10.8954 8.5 10 9.39543 10 10.5C10 11.6046 10.8954 12.5 12 12.5Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M12 12.5V15.5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
