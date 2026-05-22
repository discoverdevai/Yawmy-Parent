import React from 'react';
import { I18nManager } from 'react-native';

/**
 * Mirrors a child icon when the layout is RTL. Use only for direction-aware
 * icons (chevrons, arrows). Never wrap heart, bell, etc.
 */
export function DirectionalIcon({ children }) {
  if (!I18nManager.isRTL) return <>{children}</>;
  return (
    <>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        return React.cloneElement(child, {
          style: [child.props.style, { transform: [{ scaleX: -1 }] }],
        });
      })}
    </>
  );
}
