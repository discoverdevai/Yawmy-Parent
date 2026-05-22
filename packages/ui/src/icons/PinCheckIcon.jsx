// streamline-ultimate:style-one-pin-check — used on the Check In button
import React from 'react';
import Svg, { Path } from 'react-native-svg';

export function PinCheckIcon({ size = 24, color = '#FEFEFE', strokeWidth = 1.5 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 19.5 24" fill="none">
      <Path
        d="M13.5 6.748L9 12.748L6 9.748"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M18.75 9.748C18.7497 8.045 18.2662 6.378 17.3558 4.938C16.4455 3.499 15.1455 2.348 13.6069 1.618C12.0684 0.889 10.3544 0.610 8.66394 0.816C6.97353 1.021 5.3761 1.702 4.05719 2.779C2.73827 3.856 1.752 5.286 1.21291 6.901C0.673819 8.516 0.60404 10.251 1.01168 11.905C1.41931 13.558 2.28764 15.062 3.5158 16.241C4.74396 17.421 6.28155 18.228 7.95 18.568L9.75 23.248L11.55 18.568C13.5829 18.153 15.4099 17.049 16.722 15.441C18.034 13.834 18.7504 11.823 18.75 9.748Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
