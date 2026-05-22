const path = require('path');
const tokensPreset = require('@nms/config/tailwind');

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require('nativewind/preset'), tokensPreset],
  content: [
    './app/**/*.{js,jsx}',
    path.join(path.dirname(require.resolve('@nms/ui/package.json')), 'src/**/*.{js,jsx}'),
  ],
  theme: { extend: {} },
  plugins: [],
};
