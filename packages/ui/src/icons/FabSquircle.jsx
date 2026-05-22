// The FAB shape behind the bottom-nav messages icon. Reproduced from Figma
// `btn-69` (node 279:21350 / I279:21350;245:10008). It's a 56×56 squircle —
// not a rotated diamond and not a plain rounded-rect — with each corner
// described by a long quadratic-feeling arc.
import React from 'react';
import Svg, { Path } from 'react-native-svg';

export function FabSquircle({ size = 56, color = '#76945C' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 56 56" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M34.9318 2.87111L53.1289 21.0683C56.957 24.8967 56.957 31.1033 53.1289 34.9317L34.9318 53.1289C31.1034 56.957 24.8966 56.957 21.0682 53.1289L2.87113 34.9317C-0.957042 31.1033 -0.957042 24.8967 2.87113 21.0683L21.0682 2.87111C24.8966 -0.957037 31.1034 -0.957037 34.9318 2.87111V2.87111Z"
        fill={color}
      />
    </Svg>
  );
}
