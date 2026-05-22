const preset = require('@nms/config/eslint');

module.exports = [
  ...preset,
  {
    settings: {
      tailwindcss: {
        config: 'tailwind.config.js',
      },
    },
  },
];
