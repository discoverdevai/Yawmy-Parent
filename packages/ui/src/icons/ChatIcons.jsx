// Icons for the Chat section (`598:76473`). Line approximations matching the
// vuesax family used across the design.
import React from 'react';
import Svg, { Path } from 'react-native-svg';

// Group avatar — two users (room / group chats)
export function GroupIcon({ size = 32, color = '#334722', strokeWidth = 1.6 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 11.5C11.07 11.5 12.75 9.82 12.75 7.75C12.75 5.68 11.07 4 9 4C6.93 4 5.25 5.68 5.25 7.75C5.25 9.82 6.93 11.5 9 11.5Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M2.5 20C2.5 16.41 5.41 13.5 9 13.5C12.59 13.5 15.5 16.41 15.5 20"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M15.5 4.5C17.16 4.79 18.42 6.24 18.42 8C18.42 9.76 17.16 11.21 15.5 11.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M17.5 13.5C19.98 13.86 21.5 15.5 21.5 20"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// Send / paper-plane
export function SendIcon({ size = 24, color = '#FEFEFE', strokeWidth = 1.5 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M8.9 12H4.2L2.6 5.1C2.4 4.2 3.4 3.5 4.2 3.9L21 11.1C21.8 11.5 21.8 12.5 21 12.9L4.2 20.1C3.4 20.5 2.4 19.8 2.6 18.9L4 13"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// Attachment / paperclip
export function AttachIcon({ size = 24, color = '#535353', strokeWidth = 1.5 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 11.5L12.5 20C10.5 22 7.3 22 5.3 20C3.3 18 3.3 14.8 5.3 12.8L14 4.1C15.3 2.8 17.4 2.8 18.7 4.1C20 5.4 20 7.5 18.7 8.8L10.3 17.2C9.7 17.8 8.6 17.8 8 17.2C7.4 16.6 7.4 15.5 8 14.9L15.5 7.4"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// Muted — volume with a slash (chat header mute toggle)
export function MuteIcon({ size = 24, color = '#333333', strokeWidth = 1.5 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M13.5 4.06V19.94C13.5 20.86 12.42 21.35 11.71 20.77L7.4 17.3C7.15 17.11 6.85 17 6.54 17H4C2.9 17 2 16.1 2 15V9C2 7.9 2.9 7 4 7H6.54C6.85 7 7.15 6.89 7.4 6.7L11.71 3.23C12.42 2.65 13.5 3.14 13.5 4.06Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M17 9.5L21 14.5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M21 9.5L17 14.5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// Double-check — message delivered/seen
export function DoubleCheckIcon({ size = 16, color = '#76945C', strokeWidth = 1.5 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M2 13L6.5 17.5L14.5 8" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M9.5 15.5L10 16L18.5 6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// Face-smile — emoji picker trigger
export function EmojiIcon({ size = 24, color = '#535353', strokeWidth = 1.5 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M8 14C8.9 15.2 10.3 16 12 16C13.7 16 15.1 15.2 16 14" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M9 9.5H9.01" stroke={color} strokeWidth={strokeWidth + 0.4} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M15 9.5H15.01" stroke={color} strokeWidth={strokeWidth + 0.4} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// Microphone — voice note
export function MicIcon({ size = 24, color = '#FEFEFE', strokeWidth = 1.5 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 15C13.66 15 15 13.66 15 12V6C15 4.34 13.66 3 12 3C10.34 3 9 4.34 9 6V12C9 13.66 10.34 15 12 15Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M5 11V12C5 15.87 8.13 19 12 19C15.87 19 19 15.87 19 12V11" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M12 19V22" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// Overflow menu — three vertical dots
export function DotsVerticalIcon({ size = 24, color = '#333333' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 6.5C12.83 6.5 13.5 5.83 13.5 5C13.5 4.17 12.83 3.5 12 3.5C11.17 3.5 10.5 4.17 10.5 5C10.5 5.83 11.17 6.5 12 6.5Z" fill={color} />
      <Path d="M12 13.5C12.83 13.5 13.5 12.83 13.5 12C13.5 11.17 12.83 10.5 12 10.5C11.17 10.5 10.5 11.17 10.5 12C10.5 12.83 11.17 13.5 12 13.5Z" fill={color} />
      <Path d="M12 20.5C12.83 20.5 13.5 19.83 13.5 19C13.5 18.17 12.83 17.5 12 17.5C11.17 17.5 10.5 18.17 10.5 19C10.5 19.83 11.17 20.5 12 20.5Z" fill={color} />
    </Svg>
  );
}
