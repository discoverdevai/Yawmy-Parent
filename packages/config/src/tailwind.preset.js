const tokens = require('./tokens.generated');

const colorScale = (scale) => {
  if (typeof scale === 'string') return scale;
  return Object.fromEntries(Object.entries(scale).map(([k, v]) => [k, v]));
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          primary: colorScale(tokens.color.brand.primary),
          accent: colorScale(tokens.color.brand.accent),
        },
        surface: tokens.color.surface,
        ink: tokens.color.ink,
        neutral: colorScale(tokens.color.neutral),
        success: tokens.color.semantic.success,
        warning: tokens.color.semantic.warning,
        danger: tokens.color.semantic.danger,
        info: tokens.color.semantic.info,
      },
      borderRadius: tokens.radius,
      spacing: Object.fromEntries(
        Object.entries(tokens.spacing).map(([k, v]) => [k, `${v}px`]),
      ),
      fontSize: tokens.fontSize,
      fontFamily: tokens.fontFamily,
    },
  },
};
