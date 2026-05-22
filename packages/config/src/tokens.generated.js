// Tokens pulled directly from Figma file `iU9SoYGTCBcPzYkDa0ZAi9` via the
// MCP `get_variable_defs` endpoint. Source-of-truth values are kept here
// (not editorialised) — the design system surfaces them through
// `tailwind.preset.js` and inline-style consumers in the apps.
const tokens = {
  color: {
    brand: {
      primary: {
        50: '#F4F7EE',
        100: '#E0E8D2',
        200: '#C2D0A4',
        300: '#A4B97A',
        400: '#8FA86B',
        500: '#76945C', // Figma `primary/CTAprimarycolor`
        600: '#637D4D',
        700: '#4F643D',
        800: '#3B4A2D',
        900: '#26301E',
      },
      accent: {
        50: '#FDEFEC',
        100: '#FAD5CD',
        200: '#F4ADA0',
        300: '#EE8472',
        400: '#E76A55',
        500: '#D85540',
        600: '#B14130',
        700: '#882F22',
        800: '#5F1F16',
        900: '#3A130D',
      },
    },
    surface: {
      page: '#FFFFF5', // Figma `bg/whitecolor`
      card: '#FFFFFF',
      sheet: '#FFFFFF',
      placeholder: '#D9D9D9',
    },
    ink: {
      950: '#0F0F10',
      900: '#1A1A1B',
      // Figma `text/blackColor`
      black: '#333333',
    },
    text: {
      primary: '#333333', // Figma `text/blackColor`
      muted: '#535353', // Figma `text/grayColor`
      placeholder: '#535353',
    },
    border: {
      gray: '#D8D8D8', // Figma `stroke/grayColor`
    },
    neutral: {
      0: '#FFFFFF',
      50: '#FAFAFA',
      100: '#F4F4F5',
      200: '#E4E4E7',
      300: '#D4D4D8',
      400: '#A1A1AA',
      500: '#71717A',
      600: '#52525B',
      700: '#3F3F46',
      800: '#27272A',
      900: '#18181B',
      1000: '#000000',
    },
    semantic: {
      success: '#16A34A',
      warning: '#F59E0B',
      danger: '#DC2626',
      info: '#2563EB',
    },
  },
  spacing: {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    8: 32,
    10: 40,
    12: 48,
    16: 64,
    20: 80,
    24: 96,
  },
  radius: {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    '2xl': 20, // Figma input/button radius
    '3xl': 24,
    pill: 28,
    media: 40, // Figma image-card radius
    full: 9999,
  },
  fontSize: {
    xs: [12, { lineHeight: 16 }],
    sm: [14, { lineHeight: 20 }],
    base: [16, { lineHeight: 24 }],
    lg: [18, { lineHeight: 28 }],
    xl: [20, { lineHeight: 24 }],
    '2xl': [24, { lineHeight: 32 }],
    '3xl': [30, { lineHeight: 38 }],
    '4xl': [36, { lineHeight: 44 }],
  },
  fontFamily: {
    // Figma uses "Recoleta" — a paid commercial font. We approximate with
    // PT Serif (free, Google Fonts) until Recoleta is licensed/loaded.
    serif: ['PTSerif', 'PT Serif', 'serif'],
    'serif-bold': ['PTSerif-Bold', 'serif'],
    arabic: ['Amiri', 'Cairo', 'serif'],
    sans: ['Inter', 'system-ui', 'sans-serif'],
  },
};

module.exports = tokens;
