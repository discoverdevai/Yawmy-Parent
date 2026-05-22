// Curved bottom-nav background with the FAB cutout. Reproduced verbatim from
// the Figma `Subtract` SVG (node 279:21350, asset b66b134-...).
import React from 'react';
import Svg, { Path } from 'react-native-svg';

// preserveAspectRatio="none" lets the SVG stretch horizontally to whatever
// `width` the host passes (device-width on phone), keeping the same 70px
// height. The notch ends up centered on the actual device regardless of
// screen size — no fixed 375 letterboxing.
export function NavBackground({ width = 375, height = 70, color = '#FCFCEC' }) {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 375 70"
      fill="none"
      preserveAspectRatio="none"
    >
      <Path
        d="M355 0C366.046 1.77171e-06 375 8.95431 375 20V70H0V20C0 8.95431 8.95431 2.6173e-07 20 0H154.279L154.191 0.0878906C149.27 5.01016 149.27 12.9898 154.191 17.9121L177.588 41.3086C182.51 46.2304 190.49 46.2304 195.412 41.3086L218.809 17.9121C223.73 12.9898 223.73 5.01016 218.809 0.0878906L218.721 0H355Z"
        fill={color}
      />
    </Svg>
  );
}
